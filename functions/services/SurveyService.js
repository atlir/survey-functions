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

  async _createNewAnswer({ eventId, surveyId, answerId, newAnswer }) {
    let numberOfQuestionAnswered = 1;
    answers = [newAnswer];
    await answerCollection.doc(answerId).set({
      answers,
      numberOfQuestionAnswered,
      uid: answerId,
      createdAt,
    });
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
      createdAt: new Date().getTime(),
    };

    if (!existedAnswer.exists) {
      // await this._createNewAnswer({ eventId, surveyId, answerId, answer })
      numberOfQuestionAnswered = 1;
      answers = [newAnswer];
      await answerCollection.doc(answerId).set({
        answers,
        numberOfQuestionAnswered,
        uid: answerId,
        createdAt,
      });
    } else {
      const existedAnswerData = existedAnswer.data();
      createdAt = existedAnswerData.createdAt;
      const existedAnswerQuestion = existedAnswerData.answers.find(
        (a) => a.questionID === answer.questionID
      );
      numberOfQuestionAnswered = existedAnswerData.answers.length + 1;

      if (existedAnswerQuestion) {
        numberOfQuestionAnswered = existedAnswerData.answers.length;
        answers = existedAnswerData.answers.map((a) => {
          if (a.questionID === answer.questionID) {
            return {
              ...a,
              ...answer,
            };
          }
          return a;
        });
        await answerCollection.doc(answerId).set(
          {
            answers,
            numberOfQuestionAnswered,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        numberOfQuestionAnswered = existedAnswerData.answers.length + 1;
        await answerCollection.doc(answerId).update({
          answers: FieldValue.arrayUnion(newAnswer),
          numberOfQuestionAnswered,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }
  }

  async deleteAnswerById({ eventId, surveyId, answerId}){
    const answerCollection = this._getAnswersCollection({ eventId, surveyId });

    return answerCollection.doc(answerId).delete();
  }
}

module.exports = SurveyService;
