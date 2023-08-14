//jshint esversion:6
//start mongo -> mongod --config /Users/nahuel/data/db/mongod.conf
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const path = require("path");
const encrypt = require("mongoose-encryption")


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

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:["password"]});

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
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    try {
        await newUser.save();
        res.render("secrets");
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
            if (foundUser && foundUser.password === password) {
                res.render("secrets");
            } else {
                // Handle case where user is not found or password is incorrect
                // For example, you can render an error page or send a response indicating authentication failure.
                res.render("login-failed");
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