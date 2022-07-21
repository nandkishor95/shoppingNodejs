const express = require('express');
const app = express();
require("../MyTest4/Database/connection");
const useroute = require("../MyTest4/Route/router");
const multer = require('multer');

const ejs = require("ejs");
const path = require("path");
const qrcode = require("qrcode");
const fs = require('fs');
const shell = require('shelljs');

app.use(express.json());
app.use("/user", useroute);
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

app.post("/scan", (req, res, next) => {
    const input_text = req.body.text;
    console.log(input_text);
    qrcode.toDataURL(input_text, (err, src) => {
        res.render("scan", {
            qr_code: src,
        });
    });
});

app.get("/qr", (req, res, next) => {
    res.render("index");
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server connect successfully at ${port}`)
});


const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "upload")
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + ".jpg")
        }
    })
}).single("user_file");

app.post("/upload", upload, (req, res) => {
    res.send("File uploaded")
});