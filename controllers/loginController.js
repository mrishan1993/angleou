
const config = require('../config');
const constants = require('../constants');
const axios = require('axios');
var _ = require('lodash')
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment')
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client([config.googleClientID]);

const LoginController = {
    UserLoginController: async function(request, h) {
        console.log('inside userLoginController', request)
        var result = {}
        if (request && request.payload && request.payload.response) {
            // handle the request 
            if (request.payload.response.graphDomain === constants.FACEBOOK) {
                // handle the facebook login
                result = await LoginFacebook(request)
                return {
                    success: true,
                    data: result,
                    status: 200,
                }
            } else if (request && request.payload && request.payload.response && request.payload.response.googleId) {
                // handle google request 
                result = await LoginGoogle(request)
                return {
                    success: true,
                    data: result, 
                    status: 200
                }
            } 
        }    
        // check the user id 
        return {
            success: false,
            status: 400,
            data: {}
        }
    },
};
  
// Login through Google 
var LoginGoogle = async (request) => {
    try {
        var userLoginDetails = {}
        const ticket = await client.verifyIdToken({
            idToken: request.payload.response.tokenId,
            audience: [config.googleClientID],  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userID = payload.sub
        userLoginDetails = await IsUserRegistered(request)
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    } catch (e) {
        return {
            result: {}
        }
    }
}

// Login through facebook 
var LoginFacebook = async (request) => {
    var userToken = request.payload.response.accessToken;
    var expiryTime = 0
    var userID = request.payload.response.userID
    var facebookClientID = config.facebookClientID
    var facebookClientKey = config.facebookClientKey
    var appLink = config.facebookAppURL + 'client_id=' + facebookClientID + '&client_secret=' + facebookClientKey + '&grant_type=client_credentials'
    var tokenLink = config.facebookTokenLink
    var oAuthResult = await GetFacebookOAuthResponse(appLink)
    if (oAuthResult && oAuthResult.access_token) {
        var accessToken = oAuthResult.access_token
        var userLoginDetails = {}
        var facebookGraphResult = {}
        tokenLink = tokenLink + 'input_token=' + userToken + '&access_token=' + accessToken
        facebookGraphResult = await GetFacebookGraph(tokenLink)
        console.log('facebookGraph', facebookGraphResult)
        if (facebookGraphResult && facebookGraphResult.data && facebookGraphResult.data.data && userID === facebookGraphResult.data.data.user_id) {
            // OAuth Verified. 
            // Let the user login 
            expiryTime = request.payload.response.data_access_expiration_time
            // check if the user is already in the database. Update the access token and expiration. Else create a new user. 
            userLoginDetails = await IsUserRegistered(request)
            if (userLoginDetails.isRegistered) {
                userLoginDetails = await UpdateUserLogin(request, facebookGraphResult, oAuthResult)
                return userLoginDetails.result
            } else {
                // handle registering of the user
                userLoginDetails = await RegisterUser(request, facebookGraphResult, oAuthResult) 
                return userLoginDetails.result
            }
            

            // create data entry 
        } else {
            // logout user 
            // handle unauthorized use here
        }
    } else {
        return {
            result: {}
        }
    }
    
}
// Get OAuth Token 
var GetFacebookOAuthResponse = async (appLink) => {
    try {
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
    } catch (e) {
        console.log('Error while making request to fetch access token', e)
        return {}
    }
}

// Get User Id and other details for verification
var GetFacebookGraph = async (tokenLink) => {
    try {
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
    } catch (e) {
        console.log('Error while fetching graph', e)
        return {}
    }
}
// Check if the user already exists
var IsUserRegistered = async (request) => {
    try {
        var result = await request.app.db.query('select * from user_login where source_user_id = ' + request.payload.response.userID )
        if (result && result.length > 0) {
            // handle problem if rows are more than 1
            return {
                result : _.head(result),
                isRegistered: true
            }
        } 
        return {
            result: {},
            isRegistered: false
        }
    } catch (e) {
        console.log('Error while finding user', e)
        return {
            result: {},
            isRegistered: false
        }
    }
}
// Register the user 
var RegisterUser = async (request, facebookGraphResult, oAuthResult) => {
    try {
        var result = {}
        var token = jwt.sign({id: request.payload.response.id}, config.jwtSecret, {
            expiresIn: 86400 // in 24 hours
        })
        var timeNow = moment().format('YYYY-MM-DD HH:MM:SS')
        var expirationTime = moment().add(24,'hours').format('YYYY-MM-DD HH:MM:SS')
        var sourceExpiration = moment(facebookGraphResult.data.data.data_access_expiration_time).format('YYYY-MM-DD HH:MM:SS')
        var dbQuery = "insert into user_login (source_user_id, user_type_id, " +
            "email, access_token, access_token_expiry, " +
            "source_access_token, source_access_token_expiry, last_login, " +
            "created_at, updated_at, active, archive) " + 
            "values ('" + request.payload.response.id + "', " + "2, '" + request.payload.response.email + "', '" +
            token + "', '" +  expirationTime + "', '" + oAuthResult.access_token + "', '" + 
            sourceExpiration + "', '" + timeNow + "', '" + timeNow + "', '" + timeNow + "', " + "1, 0" + ")"
        await request.app.db.query(dbQuery)
        result = await request.app.db.query('select * from user_login where source_user_id = ' + request.payload.response.userID )
        return {
            result: _.head(result),
            isRegistered: true
        }
    } catch (e) {
        console.log('Error while adding user', e)
        return {
            result: {},
            isRegistered: false
        }
    }
}
var UpdateUserLogin = async (request, facebookGraphResult, oAuthResult) => {
    try {
        var result = {}
        var token = jwt.sign({id: request.payload.response.id}, config.jwtSecret, {
            expiresIn: 86400 // in 24 hours
        })
        var timeNow = moment().format('YYYY-MM-DD HH:MM:SS')
        var expirationTime = moment().add(24,'hours').format('YYYY-MM-DD HH:MM:SS')
        var sourceExpiration = moment(facebookGraphResult.data.data.data_access_expiration_time).format('YYYY-MM-DD HH:MM:SS')
        var dbQuery = "update user_login set access_token = '" + token + "', access_token_expiry = '" + expirationTime + 
        "', source_access_token = '" + oAuthResult.access_token + "', source_access_token_expiry = '" + sourceExpiration +
        "', last_login = '" + timeNow + "', updated_at = '" + timeNow + "' where source_user_id = '" + request.payload.response.id + "'"
        await request.app.db.query(dbQuery)
        result = await request.app.db.query('select * from user_login where source_user_id = ' + request.payload.response.userID )
        return {
            result : _.head(result),
            isRegistered: true
        }
    } catch (e) {
        console.log('Exception while updating user log', e)
        return {
            result : {},
            isRegistered: true
        }
    }
}
module.exports = LoginController;
  