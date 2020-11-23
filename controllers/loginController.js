
const config = require('../config');
const axios = require('axios');

const LoginController = {
    UserLoginController: async function(request, h) {
        console.log('inside userLoginController', request)
        var userToken = request.payload.response.accessToken;
        var accessToken = ''
        var facebookClientID = config.facebookClientID
        var facebookClientKey = config.facebookClientKey
        var appLink = config.facebookAppURL + 'client_id=' + facebookClientID + '&client_secret=' + facebookClientKey + '&grant_type=client_credentials'
        var tokenLink = config.facebookTokenLink
        // get the access token
        await axios
        .get(
            appLink
        )
        .then(function(response) {
        // handle success
            accessToken = response.data.access_token
            console.log(response);
        
        })
        .catch(function(error) {
        // handle error
            console.log(error);
        })
        .then(function() {
        // always executed
        });

        // check the user id 
        tokenLink = tokenLink + 'input_token=' + userToken + '&access_token=' + accessToken
        await axios
        .get(
            tokenLink
        )
        .then(function(response) {
        // handle success
            console.log(response);
        
        })
        .catch(function(error) {
        // handle error
            console.log(error);
        })
        .then(function() {
        // always executed
        });
        return 'something went wrong'
    },
  };
  
  module.exports = LoginController;
  