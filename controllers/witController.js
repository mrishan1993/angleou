'use strict';
let Wit = null;
let interactive = null;
var async = require('async');
const config = require('../config');
const helperFunc = require('../lib/helper');
const _ = require('lodash');
const axios = require('axios');
// import wit libraries
try {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
} catch (e) {
  console.log('Excpetion while fetching the note wit library', e);
}

const accessToken = config.witAccessToken;
const client = new Wit({
  accessToken: accessToken,
});

var witController = {
  witProcessController: async function(request, h) {
    var returnObject = {};
    var entity = {};
    var entities = [];
    var intent = {};
    var statement = request.query.statement;
    var result = await client
      .message(statement)
      .then(data => {
        console.log('data', data);
        // callback(null, data);
        return data;
      })
      .catch(error => {
        console.log('error', error);
        return error;
      });

    // find the intent with max confidence

    if (result && result.intents && result.intents.leth > 0) {
      intent = _.maxBy(result.intents, function(o) {
        return o.confidence;
      });
    }

    if (result && result.entities) {
      _.forEach(result.entities, function(value, key) {
        entities.push(value);
      });
    }
    entities = _.flatten(entities);
    if (entities && entities.length > 0) {
      entity = _.maxBy(entities, function(o) {
        return o.confidence;
      });
    }
    returnObject = await handleIntents(intent, entity);

    // const movie = await request.mongo.db
    //   .collection('listingsAndReviews')
    //   .find({})
    //   .limit(20)
    //   .toArray();
    return returnObject;
  },
};

var handleIntents = (intent, entity) => {
  var returnObject = {};
  switch (intent.name) {
    case 'Get_Recipe':
      returnObject = handleGetRecipe(intent, entity);
    default:
  }
  return returnObject;
};

var handleGetRecipe = async (intent, entity) => {
  // generate random number
  var randomNumber = helperFunc.generateRandom(100 - 3);
  var mealType = '';
  var returnObject = {};
  var recipes = [];
  var q = 'indian';
  // get 3 random recipes
  if (entity.name === 'cook_time') {
    mealType = entity.value;
  } else {
    q = entity.value || 'indian';
  }
  await axios
    .get(
      'https://api.edamam.com/search?q=' +
        q +
        '&app_id=' +
        config.edamamApiID +
        '&app_key=' +
        config.edamamApiKey +
        '&from=' +
        randomNumber +
        '&to=' +
        (randomNumber + 3) +
        '&Health=' +
        'vegetarian',
    )
    .then(function(response) {
      // handle success
      console.log(response);
      if (
        response.data &&
        response.data.hits &&
        response.data.hits.length > 0
      ) {
        recipes = response.data.hits;
        returnObject = {
          success: true,
          data: recipes,
          status: 200,
        };
      }
    })
    .catch(function(error) {
      // handle error
      console.log(error);
      returnObject = {
        success: false,
        error: error.message,
      };
    })
    .then(function() {
      // always executed
    });
  return returnObject;
};

module.exports = witController;
