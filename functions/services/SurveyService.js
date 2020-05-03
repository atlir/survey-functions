const FieldValue = require('firebase-admin').firestore.FieldValue;
const FirebaseService = require('./FirebaseService');

class SurveyService extends FirebaseService {
  constructor() {
    super()
  }

  _getSurveysCollection({eventId}){
    return this.db
      .collection("events")
      .doc(eventId)
      .collection("surveys")
  }

  _getAnswersCollection({eventId, surveyId}){
    const surveyCollections = this._getSurveysCollection({eventId})

    return surveyCollections.doc(surveyId)
      .collection("answers")
  }

  async getSurveyById({ eventId, surveyId }) {
    const document = this._getSurveysCollection({eventId}).doc(surveyId);

    const survey = await document.get();

    if (!survey.exists) {
      return false;
    }

    return survey
  }

  async getAnswerById({eventId, surveyId, answerId}){
    const document = this._getAnswersCollection({eventId, surveyId}).doc(answerId);

    const answer = await document.get();

    if(!answer.exists){
        return false;
    }

    return answer;
  }

  async createAnswer({eventId, surveyId, answerId, answer}) {
    const collection = this._getAnswersCollection({eventId, surveyId})
    collection.doc(answerId).set({
        ...answer,
        createdAt: FieldValue.serverTimestamp()
    })
  }
}

module.exports = SurveyService;
