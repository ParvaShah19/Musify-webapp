// server.js
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const fs = require("fs");
const { emit } = require("process");

const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/'));

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root", //add pass
  database: "musify", //Your DB
});

app.get("/", async (req, res) => {
  fs.readFile("./login.html", function (err, html) {
    if (err) throw err;
    res.write(html);
  });
});

app.get("/login", async (req, res) => {
  fs.readFile("./login.html", function (err, html) {
    if (err) throw err;
    res.write(html);
  });
});

app.get("/signup", async (req, res) => {
  fs.readFile("./signup.html", function (err, html) {
    if (err) throw err;
    res.write(html);
  });
});

app.get("/home", async (req, res) => {
  fs.readFile("./home.html", function (err, html) {
    if (err) throw err;
    res.write(html);
  });
});

app.get("style.css", async (req, res) => {
  fs.readFile("./style.css", function (err, css) {
    if (err) throw err;
    res.write(css);
  });
});

// Route to handle user registration (POST request)
app.post("/homeReg", async (req, res) => {
  console.log(req.body);

  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body['confirm-password'];

  if (password == confirmPassword) {
    try {
      pool.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [email, password],
        (err, rows, fields) => {
          console.log(err, rows, fields);
          if (rows["affectedRows"] == 1) {
            fs.readFile("./home.html", function (err, html) {
              if (err) throw err;
              res.write(html);
            });
          } else {
            res.status(500).send("Registration failed");
          }
        }
      );
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(500).send("Passwords do not match");
  }
});

app.post("/home", async (req, res) => {
  const { email, password } = req.body;
  try {
    pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [email],
      (err, rows, fields) => {
        console.log(err, rows, fields);
        const user = rows[0];
        if (!user) {
          return res.status(401).send("Invalid username or password");
        }

        if (user.password != password) {
          return res.status(401).send("Invalid username or password");
        }

        fs.readFile("./home.html", function (err, html) {
          if (err) throw err;
          res.write(html);
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.listen(port, () => {
  console.log("Server listening on port ${port}");
});
