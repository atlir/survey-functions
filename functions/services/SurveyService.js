const FieldValue = require("firebase-admin").firestore.FieldValue;
const FirebaseService = require("./FirebaseService");

class SurveyService extends FirebaseService {
  constructor() {
    super();
  }

  _getSurveysCollection({ eventId }) {
    return this.db.collection("events").doc(eventId).collection("surveys");
  }

  _getAnswersCollection({ eventId, surveyId }) {
    const surveyCollection = this._getSurveysCollection({ eventId });

    return surveyCollection.doc(surveyId).collection("answers");
  }

  async _getSurveyQuestions({ eventId, surveyId }) {
    const surveyCollection = this._getSurveysCollection({ eventId });

    const survey = await surveyCollection.doc(surveyId);

    if (!survey.exists) {
      return [];
    }

    return survey.questions || [];
  }

  async getSurveyById({ eventId, surveyId }) {
    const document = this._getSurveysCollection({ eventId }).doc(surveyId);

    const survey = await document.get();

    if (!survey.exists) {
      return false;
    }

    return survey;
  }

  async getAnswerById({ eventId, surveyId, answerId }) {
    const document = this._getAnswersCollection({ eventId, surveyId }).doc(
      answerId
    );

    const answer = await document.get();

    if (!answer.exists) {
      return false;
    }

    return answer;
  }

  async createOrUpdateAnswer({ eventId, surveyId, answerId, answer }) {
    const answerCollection = this._getAnswersCollection({ eventId, surveyId });
    const surveyQuestions = await this._getSurveyQuestions({
      eventId,
      surveyId,
    });
    const existedAnswer = await this.getAnswerById({
      eventId,
      surveyId,
      answerId,
    });

    let numberOfQuestionAnswered = 0;
    let answers = [];
    let createdAt = FieldValue.serverTimestamp();

    const newAnswer = {
      ...answer,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (!existedAnswer.exists) {
      numberOfQuestionAnswered = 1;
      answers = [
        newAnswer
      ];
    } else {
      const existedAnswerData = existedAnswer.data();
      createdAt = existedAnswerData.createdAt;
      const existedAnswerQuestion = existedAnswerData.answers.find(a => a.questionID === answer.questionID)

      if(existedAnswerQuestion){
        numberOfQuestionAnswered = existedAnswerData.answers.length;
        answers = existedAnswerData.answers.map(a => {
          if(a.questionID === answer.questionID){
            return {
              ...answer,
              createdAt: a.createdAt || createdAt,
            }
          }
          return a;
        })
      }else{
        numberOfQuestionAnswered = existedAnswerData.answers.length + 1;
        answers = [
          ...existedAnswerData.answers,
          newAnswer
        ]
      }
    }
    console.log('DATA', {
      answers,
      numberOfQuestionAnswered,
      uid: answerId,
      createdAt,
    })
    answerCollection.doc(answerId).set({
      answers,
      numberOfQuestionAnswered,
      uid: answerId,
      createdAt,
    });
  }
}

module.exports = SurveyService;
