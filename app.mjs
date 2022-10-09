import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import path from "path";
import encrypt from "mongoose-encryption";
const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(serveStatic(path.join("public")));
app.use(bodyParser.urlencoded({
  extended: true
}));


main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');

  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}
console.log(process.env.SECRET);
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ['password']
});
const User = mongoose.model("User", userSchema, "users");





app.route("/")
  .get(function(req, res) {
    res.render("home");
  });

app.route("/:page")
  .get(function(req, res) {
    const page = req.params.page;
    res.render(page);
  })
  .post(function(req, res) {
    const page = req.params.page;
    const userName = req.body.username;
    const passWord = req.body.password;
    switch (page) {
      case "register":
        const newUser = new User({
          username: userName,
          password: passWord
        });
        newUser.save();
        res.render("secrets");
        break;
      case "login":
        User.findOne({
          username: userName
        }, function(err, result) {
          if (err) {
            console.log(err);
          } else {
            if (result) {
              if (result.password === passWord) {
                res.render("secrets");
              } else {
                console.log("error pw");
                res.render(page);
              }
            } else {
              console.log("error user");
            }
          }
        })
        break;
    }
    // if (page == "register") {
    //   const newUser = new User({
    //     username: userName,
    //     password: passWord
    //   });
    //   newUser.save();
    //   res.render("secrets");
    // } else {
    //   User.findOne({
    //     username: userName
    //   }, function(err, result) {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       if (result) {
    //         if (result.password === passWord) {
    //           res.render("secrets");
    //         } else {
    //           console.log("error pw");
    //           res.render(page);
    //         }
    //       } else {
    //         console.log("error user");
    //       }
    //     }
    //   })
    // }
  });

app.listen(port, function() {
  console.log(`Listen port: ${port}.`);
});
