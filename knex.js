const config = require('./config');
var knex = require('knex')({
    client: 'mysql',
    connection: {
      host: config.hostname,
      user: config.mySQLUsername,
      password: config.mySQLPassword,
      database: 'cyberphilan'
    }
  });

  module.exports = knex