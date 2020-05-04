const functions = require("firebase-functions");
require("dotenv").config();
const express = require("express");
const cors = require('cors')({origin: true});
const bodyParser = require('body-parser')
const surveyController = require('./controllers/surveyController');

const app = express();

app.use(cors);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


app.get("/api/events/:eventId/surveys/:surveyId", surveyController.getSurveyById);

app.post("/api/answers", surveyController.createOrUpdateAnswer);

app.get("/api/events/:eventId/surveys/:surveyId/answers/:userId", surveyController.getAnswerById);

app.delete("/api/events/:eventId/surveys/:surveyId/answers/:userId", surveyController.deleteAnswerById);


app.use((req, res, next) => {
  res.status(404).send("This method is unsupported");
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.survey = functions.https.onRequest(app);
