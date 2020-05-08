const functions = require("firebase-functions");
require("dotenv").config();
const helmet = require("helmet")();
const cors = require('cors')({origin: true});
const surveyController = require('./controllers/surveyController');

const pathMethodStrategy = {
  '/survey-GET': surveyController.getSurveyById,
  '/answer-GET': surveyController.getAnswerById,
  '/answer-POST': surveyController.createOrUpdateAnswer,
  '/answer-DELETE': surveyController.deleteAnswerById,
};

const defaultResponseMethod = (req, res) => {
  res.status(404).send("This method is unsupported");
}

const getPathMethod = (req) => {
  const {path, method} = req;
  return `${path}-${method}`
}

const onRequestHandler = (req, res) => {
  return cors(req, res, () => {
    return helmet(req, res, async () => {
      const pathMethod = getPathMethod(req);

      const contollerMethod = pathMethodStrategy[pathMethod] || defaultResponseMethod;

      try{
        contollerMethod(req, res);
      } catch (e) {
        console.error(e);
        res.status(500).send("Internal server error");
      }
    })
  })
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.survey = functions.https.onRequest(onRequestHandler);
