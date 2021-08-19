QuestionController = require('../controllers/QuestionController');

const QuestionRoute = {
  GetAllQuestions: {
    method: '*',
    path: '/questions',
    handler: QuestionController.GetAllQuestions,
  },
  GetQuestionByID: {
      method: "*",
      path: "/question",
      handler: QuestionController.GetQuestionByID
  },
  AnswerQuestionByID: {
    method: "*",
    path: "/answer",
    handler: QuestionController.AnswerQuestionByID
  },
  RefreshLives: {
    method: "*",
    path: "/refreshlives",
    handler: QuestionController.RefreshLives
  },
  DeductPoints: {
    method: "*",
    path: "/deductpoints",
    handler: QuestionController.DeductPoints
  },
};

module.exports = QuestionRoute;
