/* PREBEN SOLUTIONS - CBT SYSTEM (FULL LOCKED EXAM MODE / ANTI-CHEAT UPGRADE) */

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'preben_cbt_lock_secret',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect('mongodb://127.0.0.1:27017/preben_cbt_lock');

/* ================= MODELS ================= */
const UserSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'student' }
});

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String,
  subject: String
});

const ResultSchema = new mongoose.Schema({
  userId: String,
  score: Number,
  total: Number,
  subject: String,
  warnings: Number,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Question = mongoose.model('Question', QuestionSchema);
const Result = mongoose.model('Result', ResultSchema);

/* ================= MIDDLEWARE ================= */
function isLoggedIn(req, res, next) {
  if (!req.session.user) return res.redirect('/');
  next();
}

/* ================= HOME ================= */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

/* ================= CBT EXAM (FULL LOCK MODE) ================= */
app.get('/exam', isLoggedIn, async (req, res) => {
  const subject = req.session.subject || 'General';
  const questions = await Question.find({ subject }).limit(10);

  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>LOCKED CBT MODE - PREBEN</title>
<style>
body{margin:0;font-family:Arial;background:#111;color:#fff;user-select:none;}
.header{background:#0A3D91;color:#fff;padding:10px;display:flex;justify-content:space-between;align-items:center;}
.timer{background:#fff;color:#0A3D91;padding:8px 15px;border-radius:8px;font-weight:bold;}
.container{display:flex;height:90vh;}
.questions{flex:3;padding:20px;overflow-y:auto;}
.sidebar{flex:1;background:#222;padding:20px;border-left:2px solid #333;}
.qbox{background:#1c1c1c;padding:15px;border-radius:10px;margin-bottom:15px;}
.option{display:block;margin:8px 0;padding:10px;background:#333;border-radius:8px;cursor:pointer;}
.option:hover{background:#444;}
.navgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;}
.navgrid div{padding:10px;background:#444;text-align:center;border-radius:6px;cursor:pointer;}
.navgrid div.flagged{background:#F5B301;color:#000;}
.warning{color:#ff4d4d;font-size:12px;margin-top:10px;}
.submit{background:#F5B301;color:#000;padding:12px;width:100%;border:none;border-radius:8px;font-weight:bold;cursor:pointer;}
</style>
</head>
<body>

<div class='header'>
<h3>PREBEN CBT LOCKED MODE</h3>
<div class='timer' id='timer'>60:00</div>
</div>

<div class='container'>
<div class='questions'>
<form method='POST' action='/submit-exam' id='examForm'>
<input type='hidden' name='warnings' id='warnings'/>
` + questions.map((q,i)=>`
<div class='qbox'>
<h3>${i+1}. ${q.question}</h3>
${q.options.map(opt=>`
<label class='option'>
<input type='radio' name='q${i}' value='${opt}'> ${opt}
</label>
`).join('')}
</div>
`).join('') + `
<button class='submit' type='submit'>Submit Exam</button>
<div class='warning' id='warn'></div>
</form>
</div>

<div class='sidebar'>
<h3>Navigator</h3>
<div class='navgrid'>
${questions.map((_,i)=>`<div onclick="document.querySelectorAll('.qbox')[${i}].scrollIntoView()">${i+1}</div>`).join('')}
</div>
<p class='warning'>⚠ Do not switch tabs or exit fullscreen</p>
</div>
</div>

<script>
let time=60*60;
let warnings=0;

// FULLSCREEN LOCK
function goFull(){
  let el=document.documentElement;
  if(el.requestFullscreen) el.requestFullscreen();
}
goFull();

// ANTI CHEAT EVENTS
window.addEventListener('blur',()=>{
  warnings++;
  document.getElementById('warn').innerText='Warning: Tab switching detected ('+warnings+')';
});

document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    warnings++;
    document.getElementById('warn').innerText='Warning: You left the exam page ('+warnings+')';
  }
});

// disable right click
document.addEventListener('contextmenu',e=>e.preventDefault());

// disable copy paste
document.addEventListener('copy',e=>e.preventDefault());
document.addEventListener('paste',e=>e.preventDefault());

// timer
setInterval(()=>{
  let m=Math.floor(time/60);
  let s=time%60;
  document.getElementById('timer').innerText=m+":"+(s<10?'0':'')+s;
  time--;
  if(time<0){ document.getElementById('examForm').submit(); }
},1000);

// submit warnings
const form=document.getElementById('examForm');
form.addEventListener('submit',()=>{
  document.getElementById('warnings').value=warnings;
});
</script>

</body>
</html>
  `);
});

/* ================= SUBMIT ================= */
app.post('/submit-exam', isLoggedIn, async (req,res)=>{
  const answers=req.body;
  const subject=req.session.subject;
  const questions=await Question.find({subject}).limit(10);

  let score=0;

  questions.forEach((q,i)=>{
    if(answers[`q${i}`]===q.answer) score++;
  });

  await Result.create({
    userId:req.session.user._id,
    score,
    total:questions.length,
    subject,
    warnings:req.body.warnings
  });

  res.send(`<h1>Score: ${score}/${questions.length}</h1><p>Warnings: ${req.body.warnings}</p><a href='/dashboard'>Back</a>`);
});

app.listen(3000,()=>console.log('PREBEN FULL LOCK CBT RUNNING'));
