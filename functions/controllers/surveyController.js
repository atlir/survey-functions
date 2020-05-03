const SurveyService = require("./../services/SurveyService");

module.exports = {
  createOrUpdateAnswer: async (req, res) => {
    try {
      const { eventId, surveyId, uid: answerId, ...answer } = req.body;

      const service = new SurveyService();

      await service.createOrUpdateAnswer({ eventId, surveyId, answerId, answer });
      return res.status(200).send();
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  },

  getSurveyById: async (req, res) => {
    try {
      const { eventId, surveyId } = req.params;

      if (!eventId || !surveyId) {
        return res
          .status(400)
          .send(
            "Bad request. Request must have eventId and surveyId parameters"
          );
      }

      const service = new SurveyService();
      const surveyFromService = await service.getSurveyById({
        eventId,
        surveyId,
      });

      if (!surveyFromService.exists) {
        return res
          .status(400)
          .send("Bad request. There no survey with ID => ", surveyId);
      }

      return res.status(200).send(surveyFromService.data());
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  },

  getAnswerById: async (req, res) => {
    try {
      const { eventId, surveyId, userId: answerId } = req.params;

      const service = new SurveyService();

      const existedAnswer = await service.getAnswerById({
        eventId,
        surveyId,
        answerId,
      });

      if (!existedAnswer.exists) {
        return res
          .status(400)
          .send("Bad request. There no answer with ID => ", answerId);
      }

      return res.status(200).send(existedAnswer.data());

    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }
  },
};
