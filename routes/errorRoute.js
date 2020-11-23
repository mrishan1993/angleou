errorController = require('../controllers/errorController');

const errorRoute = {
  notFoundRoute: {
    method: '*',
    path: '/{any*}',
    handler: errorController.notFoundController,
  },
};

module.exports = errorRoute;
