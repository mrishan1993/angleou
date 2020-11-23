loginController = require('../controllers/loginController');

const loginRoute = {
  userLoginRoute: {
    method: '*',
    path: '/login',
    handler: loginController.userLoginController,
  },
};

module.exports = loginRoute;
