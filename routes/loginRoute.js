LoginController = require('../controllers/LoginController');

const LoginRoute = {
  UserLoginRoute: {
    method: '*',
    path: '/login',
    handler: LoginController.UserLoginController,
  },
  SignupRoute: {
    method: '*',
    path: '/signup',
    handler: LoginController.UserSignupController
  }
};

module.exports = LoginRoute;
