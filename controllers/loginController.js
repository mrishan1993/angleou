
const config = require('../config');
const constants = require('../constants');
const helper = require("../lib/helper")
const axios = require('axios');
var _ = require('lodash')
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var moment = require('moment')
const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');
const client = new OAuth2Client([config.googleClientID]);
const knex = require ("../knex")
const USER_TYPE = {
    NATIVE: 1,
    FACEBOOK: 2,
    GOOGLE: 3
}
const LoginController = {
    UserLoginController: async function(request, h) {
        console.log('inside userLoginController', request)
        var result = {}
        if (request && request.payload) {
            // handle the request 
            if (request.payload && request.payload.graphDomain === constants.FACEBOOK) {
                // handle the facebook login
                result = await LoginFacebook(request)
                if (result.error) {
                    return {
                        success: false,
                        status: 400,
                        msg: result.msg || ""
                    }
                } else {
                    return {
                        success: true,
                        data: result,
                        status: 200,
                    }
                }
                
            } else if (request && request.payload && request.payload.code) {
                // handle google request 
                result = await LoginGoogle(request)
                if (result.error) {
                    return {
                        success: false,
                        status: 400,
                        msg: result.msg || ""
                    }
                } else {
                    return {
                        success: true,
                        data: result,
                        status: 200,
                    }
                }
            } else {
                // native login 
                var validateKeys = helper.checkRequiredKeysExists(["email", "password"], request.payload) 
                if (!validateKeys.exists) {
                    return {
                        success: false,
                        status: 400,
                        msg: "Missing key " + validateKeys.key
                    }
                } 
                result = await LoginNative(request)
                if (result.error) {
                    return {
                        success: false,
                        status: 400,
                        msg: result.msg || ""
                    }
                } else {
                    return {
                        success: true,
                        data: result,
                        status: 200
                    }
                }

            }
        }    
        // check the user id 
        return {
            success: false,
            status: 400,
            msg: "Something went wrong!"
        }
    },

    UserSignupController: async function (request, h) {
        console.log("Inside Signup Controller")
        var result = {}
        if (request && request.payload) {
            var email = request.payload.email
            var password = request.payload.password
            var confirmPassword = request.payload.confirmPassword
            var userLoginDetails = {}
            var validateKeys = helper.checkRequiredKeysExists(["email", "password", "confirmPassword"], request.payload)
            if (!validateKeys.exists) {
                return {
                    success: false,
                    status: 400,
                    msg: "Missing key " + validateKeys.key
                }
            }
            if (!helper.validateEmail(email)) {
                return {
                    success: false,
                    status: 400,
                    msg: "Invalid email"
                }
            }
            if (password !== confirmPassword) {
                return {
                    success: false,
                    status: 400,
                    msg: "Passwords do not match"
                }
            }
            userLoginDetails = await IsUserRegisteredByEmail(email)
            if (userLoginDetails.error) {
                return {
                    success: false,
                    status: 400,
                    msg: "Something went wrong!"
                }
            }
            if (userLoginDetails.isRegistered) {
                return {
                    success: false,
                    status: 400,
                    msg: "User is already registered"
                }
            } else {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(password, salt)
                var token = jwt.sign({id: request.payload.email}, config.jwtSecret, {
                    expiresIn: 86400 // in 24 hours
                })
                var expirationTime = moment().add(1,'hours').format("YYYY-MM-DD HH:MM:ss")
                var timeNow = moment().format("YYYY-MM-DD HH:MM:ss")
                userObject = {
                    user_type_id: USER_TYPE.NATIVE,
                    email: email,
                    password: hash,
                    salt: salt,
                    access_token: token,
                    access_token_expiry: expirationTime,
                    last_login: timeNow,
                    created_at: timeNow,
                    updated_at: timeNow,
                    active: 1,
                    archive: 0
                }
                userLoginDetails = await RegisterUser(userObject) 
                if (userLoginDetails.error) {
                    return {
                        success: false,
                        status: 400,
                        msg: "Something went wrong!"
                    }
                }
                return {
                    success: true,
                    data: userLoginDetails.result,
                    status: 200,
                }
            }

        } else {
            return {
                success: false,
                status: 400,
                msg: "Something went wrong!"
            }
        }
    }
};
  
// Login natively
var LoginNative = async (request) => {
    var email = request.payload.email
    var password = request.payload.password
    userLoginDetails = await IsUserRegisteredByEmail(email)
    if (userLoginDetails.error) {
        return {
            error: true,
            msg: userLoginDetails.msg
        }
    }
    if (userLoginDetails.isRegistered) {
        var hash = bcrypt.hashSync(password, userLoginDetails.result.salt);
        if (hash === userLoginDetails.result.password) {
            // pass validation 
            // let the user login 
            return userLoginDetails.result
        } else {
            return {
                error: true,
                msg: "Incorrect Username or Password"

            }
        }
    } else {
        return {
            error: true,
            msg: "No user found"
        }
    }
}
// Login through Google 
var LoginGoogle = async (request) => {
    var userObject = {}
    var ticket = {}
    var timeNow = moment().format("YYYY-MM-DD HH:MM:ss")
    var expirationTime = moment().add(1,'hours').format("YYYY-MM-DD HH:MM:ss")
    var token = jwt.sign({id: request.payload.id}, config.jwtSecret, {
        expiresIn: 86400 // in 24 hours
    })
    var userID;
    var userLoginDetails = {}
    // get access token and refresh token
    try {
        var obj = {
            client_id: config.googleClientID,
            client_secret: config.googleClientSecret,
            code: request.payload.code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectURL
        }
        await axios
        .post(
            config.googleOAuth2EndPoint
        , obj)
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
        ticket = await client.getTokenInfo(
            result.access_token
        )
        userID = ticket.sub
        userLoginDetails = await IsUserRegistered(userID)
        if (userLoginDetails.error) {
            return {
                error: true,
                msg: userLoginDetails.msg
            }
        }
        if (userLoginDetails.isRegistered) {
            userObject = {
                access_token: token,
                source_user_id: userID,
                access_token_expiry: expirationTime,
                source_access_token: result.refresh_token ? result.refresh_token : undefined, 
                source_access_token_expiry: undefined,
                last_login: timeNow,
                updated_at: timeNow,
            }
            userLoginDetails = await UpdateUserLogin(userObject)
            if (userLoginDetails.error) {
                return {
                    error: true,
                    msg: userLoginDetails.msg
                }
            }
            return userLoginDetails.result
        } else {
            userObject = {
                source_user_id: userID, 
                user_type_id: USER_TYPE.GOOGLE,
                email: ticket.email, 
                access_token: token, 
                access_token_expiry: expirationTime, 
                source_access_token: ticket.refresh_token ? ticket.refresh_token : undefined, 
                source_access_token_expiry: undefined, 
                last_login : timeNow,
                created_at: timeNow, 
                updated_at: timeNow, 
                active: 1,
                archive: 0
            }
            userLoginDetails = await RegisterUser(userObject) 
            if (userLoginDetails.error) {
                return {
                    error: true,
                    msg: userLoginDetails.msg
                }
            }
            return userLoginDetails.result
        }
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    } catch (e) {
        return {
            error: true,
            msg: "Something went wrong"
        }
    }
}

// Login through facebook 
var LoginFacebook = async (request) => {
    var userToken = request.payload.accessToken;
    var userID = request.payload.userID
    var facebookClientID = config.facebookClientID
    var timeNow = moment().format('YYYY-MM-DD HH:MM:ss')
    var expirationTime = moment().add(24,'hours').format('YYYY-MM-DD HH:MM:ss')
    var sourceExpiration
    var facebookClientKey = config.facebookClientKey
    var token = jwt.sign({id: request.payload.id}, config.jwtSecret, {
        expiresIn: 86400 // in 24 hours
    })
    var userObject = {}
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
        sourceExpiration = moment(facebookGraphResult.data.data.data_access_expiration_time).format('YYYY-MM-DD HH:MM:ss')
        if (facebookGraphResult && facebookGraphResult.data && facebookGraphResult.data.data && userID === facebookGraphResult.data.data.user_id) {
            // OAuth Verified. 
            // Let the user login 
            expiryTime = request.payload.data_access_expiration_time
            // check if the user is already in the database. Update the access token and expiration. Else create a new user. 
            userLoginDetails = await IsUserRegistered(userID)
            if (userLoginDetails.error) {
                return {
                    error: true,
                    msg: userLoginDetails.msg
                }
            }
            if (userLoginDetails.isRegistered) {
                userObject = {
                    source_user_id: userID,
                    access_token: token,
                    access_token_expiry: expirationTime,
                    source_access_token: oAuthResult.access_token,
                    source_access_token_expiry: sourceExpiration,
                    last_login: timeNow,
                    updated_at: timeNow,
                }
                userLoginDetails = await UpdateUserLogin(userObject)
                if (userLoginDetails.error) {
                    return {
                        error: true,
                        msg: userLoginDetails.msg
                    }
                }
                return userLoginDetails.result
            } else {
                // handle registering of the user
                userObject = {
                    source_user_id: request.payload.id, 
                    user_type_id: USER_TYPE.FACEBOOK,
                    email: request.payload.email, 
                    access_token: token, 
                    access_token_expiry: expirationTime, 
                    source_access_token: oAuthResult.access_token, 
                    source_access_token_expiry: sourceExpiration, 
                    last_login : timeNow,
                    created_at: timeNow, 
                    updated_at: timeNow, 
                    active: 1,
                    archive: 0
                }
                userLoginDetails = await RegisterUser(userObject) 
                if (userLoginDetails.error) {
                    return {
                        error: true,
                        msg: userLoginDetails.msg
                    }
                }
                return userLoginDetails.result
            }
            

            // create data entry 
        } else {
            return {
                error: true,
                msg: "Unauthorized user"
            }
            // logout user 
            // handle unauthorized use here
        }
    } else {
        return {
            error: true,
            msg: "Unauthorized user"
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

var IsUserRegisteredByEmail = async (email) => {
    var email = email
    try {
        var result = await knex('user_login').where({
                            email: email,
                            active: 1,
                            archive: 0
                        })
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
        console.log("Exception is ", e)
        return {
            error: true,
            msg: e
        }
    }
}
// Check if the user already exists
var IsUserRegistered = async (userID) => {
    var userID = userID;
    try {
        var result = await knex('user_login').where({
                                source_user_id: userID,
                                active: 1,
                                archive: 0
                            })
        // var result = await request.app.db.query('select * from user_login where source_user_id = ' + userID )
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
            error: true,
            msg: e
        }
    }
}
// Register the user 
var RegisterUser = async (userObject) => {
    var result = {}
    
    try {
        await knex("user_login").insert({
            source_user_id: userObject.source_user_id,
            user_type_id: userObject.user_type_id,
            email: userObject.email,
            password: userObject.password,
            salt: userObject.salt,
            access_token: userObject.access_token, 
            access_token_expiry: userObject.access_token_expiry,
            source_access_token: userObject.source_access_token, 
            source_access_token_expiry: userObject.source_access_token_expiry, 
            last_login: userObject.last_login, 
            created_at: userObject.created_at, 
            updated_at: userObject.updated_at, 
            active: userObject.active, 
            archive: userObject.archive
        }) 
        if (userObject.source_user_id) {
            result = await knex('user_login').where({
                source_user_id: userObject.source_user_id,
                active: 1,
                archive: 0
            })
        } else {
            result = await knex('user_login').where({
                email: userObject.email,
                active: 1,
                archive: 0
            })
        }
        
        return {
            result: _.head(result),
            isRegistered: true
        }
    } catch (e) {
        console.log('Error while adding user', e)
        return {
            error: true,
            msg: e
        }
    }
}
var UpdateUserLogin = async (userObject) => {
    try {
        var result = {}
        await knex("user_login")
            .where({source_user_id: userObject.source_user_id})
            .update({
                user_type_id: userObject.user_type_id,
                email: userObject.email,
                access_token: userObject.access_token, 
                access_token_expiry: userObject.access_token_expiry,
                source_access_token: userObject.source_access_token, 
                source_access_token_expiry: userObject.source_access_token_expiry, 
                last_login: userObject.last_login, 
                created_at: userObject.created_at, 
                updated_at: userObject.updated_at, 
                active: userObject.active, 
                archive: userObject.archive
            })
        result = await knex('user_login').where({
                    source_user_id: userObject.source_user_id,
                    active: 1,
                    archive: 0
                })
        return {
            result : _.head(result),
            isRegistered: true
        }
    } catch (e) {
        console.log('Exception while updating user log', e)
        return {
            error: true,
            msg: e
        }
    }
}


var CreateSession = async (userObject) => {
    try {
        var result = {}
        // var user_id = userObject.userID
        var user_id = 1
        // creating user lives session
        await knex("User_Lives_Session").insert({
            user_id: user_id,
            created_date: moment().format("YYYY-MM-DD HH:mm:ss")
        })
        await knex("User_Score_Session").insert({
            user_id: user_id,
            created_date: moment().format("YYYY-MM-DD HH:mm:ss")
        })
        // check if user exists 
        if (IsUserRegistered().isRegistered) {
            // leave
        } else {
            // create user scoreboard
            await knex("User_Scoreboard").insert({
                user_id: user_id,
            })
        }
        return true
    } catch (e) {
        return false
    }
}

CreateSession()
module.exports = LoginController;
  

