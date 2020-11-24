'use strict';

const Hapi = require('@hapi/hapi');
var ErrorRoute = require('./routes/ErrorRoute.js');
var LoginRoute = require('./routes/LoginRoute.js');
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
        database: 'angelou'
    }
  });
  await server.register({
    plugin: auth,
  });
  server.route(ErrorRoute.NotFoundRoute);
  server.route(LoginRoute.UserLoginRoute);

  await server.start();

  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
