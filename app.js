//jshint esversion:6
//start mongo -> mongod --config /Users/nahuel/data/db/mongod.conf
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const path = require("path");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});


const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});




app.post("/register", async function(req, res) {
    try {
        bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
            if (err) {
                console.error(err);
                // Handle the error appropriately
                return;
            }

            const newUser = new User({
                email: req.body.username,
                password: hash,
            });

            try {
                await newUser.save();
                res.render("secrets");
            } catch (err) {
                console.error(err);
                // Handle the error appropriately
            }
        });
    } catch (err) {
        console.error(err);
        // Handle the error appropriately
    }
});






app.post("/login", function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username})
        .then(foundUser => {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    if (result == true){
                        res.render("secrets");
                    }
                });
            } else {
                console.log("Not User")
            }
        })
        .catch(err => {
            console.log(err);
            // Handle the error appropriately, for example, render an error page.
            res.render("error");
        });
});


app.listen(3000, function(){
    console.log("Server running on port 3000.");
});