const FieldValue = require("firebase-admin").firestore.FieldValue;
const FirebaseSingleton = require("./FirebaseSingleton");

class SurveyService{
  constructor() {
    this.db = FirebaseSingleton.instance.db;
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
    const numberOfQuestionAnswered = 1;
    const answers = [newAnswer];
    const answerCollection = this._getAnswersCollection({ OrganizationID, surveyID });
    const createdAt = FieldValue.serverTimestamp();

    await answerCollection.doc(answerId).set({
      answers,
      numberOfQuestionAnswered,
      uid: answerId,
      createdAt,
    });
  }

  async _updateExistedAnswer({ OrganizationID, surveyID, answerId, newAnswer, existedAnswerData }){
    const numberOfQuestionAnswered = existedAnswerData.answers.length;
    const answers = existedAnswerData.answers.map((a) => {
      if (a.questionID === newAnswer.questionID) {
        return {
          ...a,
          ...newAnswer,
        };
      }
      return a;
    });
    const answerCollection = this._getAnswersCollection({ OrganizationID, surveyID });

    await answerCollection.doc(answerId).set(
      {
        answers,
        numberOfQuestionAnswered,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  async _addNewAnswerToExisted({ OrganizationID, surveyID, answerId, newAnswer, existedAnswerData }){
    const answerCollection = this._getAnswersCollection({ OrganizationID, surveyID });
    const numberOfQuestionAnswered = existedAnswerData.answers.length + 1;
    await answerCollection.doc(answerId).update({
      answers: FieldValue.arrayUnion(newAnswer),
      numberOfQuestionAnswered,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async createOrUpdateAnswer({ OrganizationID, surveyID, answerId, answer }) {
    const existedAnswer = await this.getAnswerById({
      OrganizationID,
      surveyID,
      answerId,
    });

    const newAnswer = {
      ...answer,
      createdAt: new Date().getTime(),
    };

    if (!existedAnswer.exists) {
      await this._createNewAnswer({ OrganizationID, surveyID, answerId, newAnswer })
    } else {
      const existedAnswerData = existedAnswer.data();
      const existedAnswerQuestion = existedAnswerData.answers.find(
        (a) => a.questionID === answer.questionID
      );

      if (existedAnswerQuestion) {
        await this._updateExistedAnswer({ OrganizationID, surveyID, answerId, newAnswer, existedAnswerData })
      } else {
        await this._addNewAnswerToExisted({ OrganizationID, surveyID, answerId, newAnswer, existedAnswerData })
      }
    }
  }

  async deleteAnswerById({ OrganizationID, surveyID, answerId}){
    const answerCollection = this._getAnswersCollection({ OrganizationID, surveyID });

    return answerCollection.doc(answerId).delete();
  }
}

module.exports = SurveyService;
