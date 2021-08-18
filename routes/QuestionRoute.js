QuestionController = require('../controllers/QuestionController');

const QuestionRoute = {
  GetAllQuestions: {
    method: '*',
    path: '/questions',
    handler: QuestionController.GetAllQuestions,
  },
};

module.exports = QuestionRoute;
