const functions = require("firebase-functions");
const admin = require("firebase-admin");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const surveyController = require('./controllers/surveyController');

const app = express();

app.use(cors({ origin: true }));



app.get("/api/events/:eventId/surveys/:surveyId", surveyController.getSurveyById);

app.post("/api/answers", surveyController.createOrUpdateAnswer);

app.get("/api/events/:eventId/surveys/:surveyId/answers/:userId", surveyController.getAnswerById);

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.survey = functions.https.onRequest(app);
