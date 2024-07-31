import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";

const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "quiz",
});

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to the database and load quiz data
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database", err.stack);
    return;
  }

  db.query("SELECT * FROM capitals", (err, results) => {
    if (err) {
      console.error("Error executing query", err.stack);
    } else {
      quiz = results;
    }
  });
});

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;

  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  if (quiz.length > 0) {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
  } else {
    console.error("Quiz array is empty");
    currentQuestion = { country: "No questions available", capital: "" };
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
