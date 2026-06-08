const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

/**
 * Basic MCQ Parser Logic
 * Extracts questions based on patterns like "1. Question text" and "A) Option"
 */
function parseMCQs(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQuestion = null;

  lines.forEach((line) => {
    // Lenient Question Match: "1. text", "1) text", "Q1. text", "1 . text"
    const questionMatch = line.match(/^(?:Q|Question)?\s*(\d+)\s*[\.\):-]\s*(.*)/i);
    if (questionMatch) {
      if (currentQuestion && Object.keys(currentQuestion.options).length > 0) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        id: questionMatch[1],
        text: questionMatch[2],
        options: {},
        correctAnswer: ""
      };
      return;
    }

    // Lenient Option Match: "A) text", "A. text", "(A) text", "a) text"
    const optionMatch = line.match(/^[\(]?([A-E])[\.\)]?\s+(.*)/i);
    if (optionMatch && currentQuestion) {
      const label = optionMatch[1].toUpperCase();
      currentQuestion.options[label] = optionMatch[2];
      return;
    }

    // Lenient Answer Match: "Answer: A", "Ans: A", "Correct Answer: (A)"
    const answerMatch = line.match(/(?:Answer|Correct|Ans|Correct Answer)[^\w]*([A-E])/i);
    if (answerMatch && currentQuestion) {
      currentQuestion.correctAnswer = answerMatch[1].toUpperCase();
      return;
    }

    // Append text to the current question if no option is found yet
    if (currentQuestion && Object.keys(currentQuestion.options).length === 0) {
      currentQuestion.text += " " + line;
    } else if (currentQuestion && Object.keys(currentQuestion.options).length > 0) {
      // If we are currently parsing an option, append to the last parsed option
      const keys = Object.keys(currentQuestion.options);
      const lastKey = keys[keys.length - 1];
      currentQuestion.options[lastKey] += " " + line;
    }
  });

  if (currentQuestion && Object.keys(currentQuestion.options).length > 0) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

app.post("/api/parse-pdf", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    
    const parsedQuestions = parseMCQs(data.text);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      questions: parsedQuestions,
      text: data.text // Returning raw text for debugging if needed
    });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Exam Backend listening at http://localhost:${port}`);
});
