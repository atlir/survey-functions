class SurveyService {
  constructor(db) {
    this.db = db;
  }

  async getSurveyById({ eventId, surveyId }) {
    const document = this.db
      .collection("events")
      .doc(eventId)
      .collection("surveys")
      .doc(surveyId);

    const survey = await document.get();

    if (!survey.exists) {
      return false;
    }

    return survey.data()
  }
}

module.exports = SurveyService;
