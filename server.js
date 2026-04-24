```js
// ===============================
// PREBEN SOLUTIONS - PRODUCTION SERVER
// Railway Ready | Node.js + Express + MongoDB
// ===============================

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

// ===============================
// BASIC CONFIG
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "preben_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  })
);

// ===============================
// DATABASE CONNECTION
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ===============================
// MODELS
// ===============================

// Users
const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// Questions
const questionSchema = new mongoose.Schema({
  subject: String,
  question: String,
  options: [String],
  answer: String
});

const Question = mongoose.model("Question", questionSchema);

// ===============================
// ROUTES
// ===============================

// Homepage
app.get('/', (req, res) => {
  res.send(`
    <h1>PREBEN SOLUTIONS</h1>
    <p>Website is live 🚀</p>
    <p>JAMB | Post UTME | NYSC | Registrations</p>
  `);
});

// ===============================
// REGISTER
// ===============================
app.get("/register", (req, res) => {
  res.send(`
    <h2>Create Account</h2>
    <form method="POST" action="/register">
      <input name="fullname" placeholder="Full Name" required /><br><br>
      <input name="email" type="email" placeholder="Email" required /><br><br>
      <input name="password" type="password" placeholder="Password" required /><br><br>
      <button type="submit">Register</button>
    </form>
  `);
});

app.post("/register", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      email,
      password: hashed
    });

    res.send("Registration successful. <a href='/login'>Login now</a>");
  } catch (err) {
    res.send("Registration failed. Email may already exist.");
  }
});

// ===============================
// LOGIN
// ===============================
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="email" type="email" placeholder="Email" required /><br><br>
      <input name="password" type="password" placeholder="Password" required /><br><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send("User not found");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.send("Invalid password");

  req.session.userId = user._id;
  res.redirect("/dashboard");
});

// ===============================
// DASHBOARD
// ===============================
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) return res.redirect("/login");

  res.send(`
    <h1>User Dashboard</h1>
    <p>Welcome to PREBEN SOLUTIONS</p>
    <a href="/cbt">Take CBT Exam</a><br><br>
    <a href="/logout">Logout</a>
  `);
});

// ===============================
// CBT EXAM
// ===============================
app.get("/cbt", async (req, res) => {
  const questions = await Question.find().limit(5);

  if (questions.length === 0) {
    return res.send(`
      <h2>No Questions Yet</h2>
      <p>Add questions directly to MongoDB later.</p>
    `);
  }

  let html = `<h1>CBT Practice Test</h1><form method="POST" action="/submit-exam">`;

  questions.forEach((q, index) => {
    html += `<p>${index + 1}. ${q.question}</p>`;

    q.options.forEach((opt) => {
      html += `
        <label>
          <input type="radio" name="q${index}" value="${opt}" required>
          ${opt}
        </label><br>
      `;
    });

    html += "<br>";
  });

  html += `<button type="submit">Submit Exam</button></form>`;

  res.send(html);
});

// Submit CBT
app.post("/submit-exam", (req, res) => {
  res.send(`
    <h2>Exam Submitted Successfully ✅</h2>
    <a href="/dashboard">Back to Dashboard</a>
  `);
});

// ===============================
// LOGOUT
// ===============================
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PREBEN SOLUTIONS running on port ${PORT}`);
});
```
