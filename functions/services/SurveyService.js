const FieldValue = require("firebase-admin").firestore.FieldValue;
const FirebaseService = require("./FirebaseService");

class SurveyService extends FirebaseService {
  constructor() {
    super();
  }

  _getSurveysCollection({ OrganizationID }) {
    return this.db.collection("events").doc(OrganizationID).collection("surveys");
  }

  _getAnswersCollection({ OrganizationID, surveyID }) {
    const surveyCollection = this._getSurveysCollection({ OrganizationID });

    return surveyCollection.doc(surveyID).collection("answers");
  }

  async _getSurveyQuestions({ OrganizationID, surveyID }) {
    const surveyCollection = this._getSurveysCollection({ OrganizationID });

    const survey = await surveyCollection.doc(surveyID);

    if (!survey.exists) {
      return [];
    }

    return survey.questions || [];
  }

  async getSurveyById({ OrganizationID, surveyID }) {
    const document = this._getSurveysCollection({ OrganizationID }).doc(surveyID);

    const survey = await document.get();

    if (!survey.exists) {
      return false;
    }

    return survey;
  }

  async getAnswerById({ OrganizationID, surveyID, answerId }) {
    const document = this._getAnswersCollection({ OrganizationID, surveyID }).doc(
      answerId
    );

    const answer = await document.get();

    if (!answer.exists) {
      return false;
    }

    return answer;
  }

  async _createNewAnswer({ OrganizationID, surveyID, answerId, newAnswer }) {
    let numberOfQuestionAnswered = 1;
    answers = [newAnswer];
    await answerCollection.doc(answerId).set({
      answers,
      numberOfQuestionAnswered,
      uid: answerId,
      createdAt,
    });
  }

  async createOrUpdateAnswer({ OrganizationID, surveyID, answerId, answer }) {
    const answerCollection = this._getAnswersCollection({ OrganizationID, surveyID });
    const surveyQuestions = await this._getSurveyQuestions({
      OrganizationID,
      surveyID,
    });
    const existedAnswer = await this.getAnswerById({
      OrganizationID,
      surveyID,
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
      // await this._createNewAnswer({ OrganizationID, surveyID, answerId, answer })
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

  async deleteAnswerById({ OrganizationID, surveyID, answerId}){
    const answerCollection = this._getAnswersCollection({ OrganizationID, surveyID });

    return answerCollection.doc(answerId).delete();
  }
}

module.exports = SurveyService;
