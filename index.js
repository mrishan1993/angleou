'use strict';

const Hapi = require('@hapi/hapi');
var ErrorRoute = require('./routes/ErrorRoute.js');
var LoginRoute = require('./routes/LoginRoute.js');
var SurveyRoute = require('./routes/SurveyRoute.js');
var QuestionRoute = require('./routes/QuestionRoute.js');
var auth = require('./middleware/auth.js');
const config = require('./config')

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      cors: true,
    },
  });
  // await server.register({
  //   plugin: require('hapi-mongodb'),
  //   options: {
  //     url:
  //       'mongodb+srv://admin:admin@whatscooking.pbvbr.mongodb.net/sample_airbnb?retryWrites=true&w=majority',
  //     settings: {
  //       useUnifiedTopology: true,
  //     },
  //     decorate: true,
  //   },
  // });
  // connect to mysql 
  await server.register({
    plugin: require('hapi-plugin-mysql'),
    options: {
        host: config.hostname,
        user: config.mySQLUsername,
        password: config.mySQLPassword,
        database: 'cyberphilan'
    }
  });
  
  await server.register({
    plugin: auth,
  });
  server.route(ErrorRoute.NotFoundRoute);
  server.route(LoginRoute.UserLoginRoute);
  server.route(LoginRoute.SignupRoute);
  server.route(SurveyRoute.GetSurveyQuestions);
  server.route(SurveyRoute.PostSurveyQuestionAnswers);
  server.route(QuestionRoute.GetAllQuestions);
  server.route(QuestionRoute.GetQuestionByID);
  server.route(QuestionRoute.AnswerQuestionByID);
  server.route(QuestionRoute.RefreshLives);
  server.route(QuestionRoute.DeductPoints);

  await server.start();

  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
