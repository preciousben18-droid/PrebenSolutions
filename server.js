require("dotenv").config();

const express = require("express");
const session = require("express-session");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "preben_secret",
    resave: false,
    saveUninitialized: false
  })
);

app.get("/", (req, res) => {
  res.send(`
    <h1>PREBEN SOLUTIONS</h1>
    <p>Website is live 🚀</p>
    <p>JAMB | Post UTME | NYSC | Registrations</p>
  `);
});

app.get("/dashboard", (req, res) => {
  res.send("<h1>Dashboard</h1>");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
