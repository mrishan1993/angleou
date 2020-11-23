ErrorController = require('../controllers/ErrorController');

const ErrorRoute = {
  NotFoundRoute: {
    method: '*',
    path: '/{any*}',
    handler: ErrorController.NotFoundController,
  },
};

module.exports = ErrorRoute;
