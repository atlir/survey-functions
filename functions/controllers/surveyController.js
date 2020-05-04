const SurveyService = require("./../services/SurveyService");

const _answerFields = ["uid", "surveyID", "OrganizationID", "questionID", "questionLabel", "answer"];

function _validateAnswerBody(body){
  const fields = Object.keys(body).map(key =>{
    return _answerFields.includes(key)
  })

  return fields.reduce((acc, field) => {
    return acc && field
  }, true)
}


module.exports = {

  createOrUpdateAnswer: async (req, res) => {
    try {
      const isAnswerValid = _validateAnswerBody(req.body)

      if(!isAnswerValid){
        return res.status(400).send("Bad request");
      }
      const { OrganizationID, surveyID, uid: answerId, ...answer } = req.body;

      const service = new SurveyService();

      await service.createOrUpdateAnswer({
        OrganizationID,
        surveyID,
        answerId,
        answer,
      });
      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  },

  getSurveyById: async (req, res) => {
    try {
      const { OrganizationID, surveyID } = req.params;

      if (!OrganizationID || !surveyID) {
        return res
          .status(400)
          .send(
            "Bad request. Request must have OrganizationID and surveyID parameters"
          );
      }

      const service = new SurveyService();
      const surveyFromService = await service.getSurveyById({
        OrganizationID,
        surveyID,
      });

      if (!surveyFromService.exists) {
        return res
          .status(400)
          .send("Bad request. There no survey with ID => ", surveyID);
      }

      return res.status(200).send(surveyFromService.data());
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  },

  getAnswerById: async (req, res) => {
    try {
      const { OrganizationID, surveyID, userID: answerId } = req.params;

      const service = new SurveyService();

      const existedAnswer = await service.getAnswerById({
        OrganizationID,
        surveyID,
        answerId,
      });

      if (!existedAnswer.exists) {
        return res.status(200).send({});
      }

      return res.status(200).send(existedAnswer.data());
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  },

  deleteAnswerById: async (req, res) => {
    const { OrganizationID, surveyID, userID: answerId } = req.params;

    const service = new SurveyService();
    
    await service.deleteAnswerById({
      OrganizationID,
      surveyID,
      answerId,
    });

    return res.status(201).send();
  },
};
