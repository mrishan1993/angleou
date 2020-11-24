
const config = require('../config');
const constants = require('../constants');
const axios = require('axios');

const LoginController = {
    UserLoginController: async function(request, h) {
        console.log('inside userLoginController', request)
        if (request && request.payload && request.payload.response) {
            // handle the request 
            if (request.payload.response.graphDomain === constants.FACEBOOK) {
                // handle the facebook login
                await LoginFacebook(request)
            }
        }    
        // check the user id 
        return 'something went wrong'
    },
};
  
// Login through facebook 
var LoginFacebook = async (request) => {
    var userToken = request.payload.response.accessToken;
    var expiryTime = 0
    var userID = request.payload.response.userID
    var facebookClientID = config.facebookClientID
    var facebookClientKey = config.facebookClientKey
    var appLink = config.facebookAppURL + 'client_id=' + facebookClientID + '&client_secret=' + facebookClientKey + '&grant_type=client_credentials'
    var tokenLink = config.facebookTokenLink
    var OAuthResult = await GetFacebookOAuthResponse(appLink)
    var accessToken = OAuthResult.access_token
    var facebookGraphResult = {}
    tokenLink = tokenLink + 'input_token=' + userToken + '&access_token=' + accessToken
    facebookGraphResult = await GetFacebookGraph(tokenLink)
    console.log('facebookGraph', facebookGraphResult)
    if (userID === facebookGraphResult.data.data.user_id) {
        // OAuth Verified. 
        // Let the user login 
        expiryTime = request.payload.response.data_access_expiration_time
        // check if the user is already in the database. Update the access token and expiration. Else create a new user. 
        if (await IsUserRegistered(request)) {
            await RegisterUser(request) 
        } else {
            // handle registering of the user
        }
        

        // create data entry 
    } else {
        // logout user 
        // handle unauthorized use here
    }
}
// Get OAuth Token 
var GetFacebookOAuthResponse = async (appLink) => {
    var result = {}
    // get the access token
    await axios
    .get(
        appLink
    )
    .then(function(response) {
    // handle success
        result = response.data
        console.log(response);
    
    })
    .catch(function(error) {
    // handle error
        console.log(error);
    })
    .then(function() {
    // always executed
    });
    return result
}

// Get User Id and other details for verification
var GetFacebookGraph = async (tokenLink) => {
    var result = {}
    await axios
    .get(
        tokenLink
    )
    .then(function(response) {
        // handle success
        result = response
        console.log(response);
    
    })
    .catch(function(error) {
    // handle error
        console.log(error);
    })
    .then(function() {
    // always executed
    });
    return result
}
// Check if the user already exists
var IsUserRegistered = async (request) => {
    var result = await request.app.db.query('select * from user_login where source_user_id = ' + request.payload.response.userID )
    if (result.length > 0) {
        return true
    } 
    return false
}
// Register the user 
var RegisterUser = async () => {

}
module.exports = LoginController;
  