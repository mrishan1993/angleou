LoginController = require('../controllers/LoginController');

const LoginRoute = {
  UserLoginRoute: {
    method: '*',
    path: '/login',
    handler: LoginController.UserLoginController,
  },
};

module.exports = LoginRoute;
