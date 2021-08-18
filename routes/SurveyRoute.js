SurveyController = require('../controllers/SurveyController');

const SurveyRoute = {
  GetSurveyQuestions: {
    method: '*',
    path: '/survey/questions',
    handler: SurveyController.GetSurveyQuestions,
  },
  PostSurveyQuestionAnswers: {
      method: "*",
      path:'/survey/answers',
      handler: SurveyController.PostSurveyQuestionAnswers
  }
};

module.exports = SurveyRoute;
