const functions = require("firebase-functions");
const admin = require("firebase-admin");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: true }));

const serviceAccount = require("./firebase-secret.json");
const SurveyService = require("./services/survey");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});

const db = admin.firestore();

app.get("/api/events/:eventId/surveys/:surveyId", (req, res) => {
  (async () => {
    try {
      const { eventId, surveyId } = req.params;

      if (!eventId || !surveyId) {
        return res
          .status(400)
          .send(
            "Bad request. Request must have eventId and surveyId parameters"
          );
      }
      
      const service = new SurveyService(db);
      const surveyFromService = await service.getSurveyById({
        eventId,
        surveyId,
      });

      if (!surveyFromService) {
        return res
          .status(400)
          .send("Bad request. There no survey with ID => ", surveyId);
      }

      return res.status(200).send(surveyFromService);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  })();
});

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.survey = functions.https.onRequest(app);