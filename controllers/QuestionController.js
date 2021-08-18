
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
const QuestionController = {
    GetAllQuestions: async function(request, h) {
        console.log('inside GetAllQuestions', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                result = await knex.select().from('Questions').where({
                    active: 1,
                    archive: 0
                })
                
                return {
                    result : result,
                    success: true,
                }
            } catch (e) {
                console.log('Exception while updating user log', e)
                return {
                    error: true,
                    success: false,
                    msg: e
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
    PostSurveyQuestionAnswers: async function(request, h) {
        console.log('inside PostSurveyQuestionAnswers', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                var user_id = request.payload.user_id
                var question_one = request.payload.question_one
                var question_two = request.payload.question_two
                var question_three = request.payload.question_three
                var question_four = request.payload.question_four
                var question_five = request.payload.question_five
                var question_six = request.payload.question_six
                var experience = request.payload.experience
                await knex('User_Feedback').insert(
                    {
                        user_id: user_id, 
                        question_one: question_one, 
                        question_two: question_two,
                        question_three: question_three,
                        question_four: question_four,
                        question_five: question_five,
                        question_six: question_six,
                        experience: experience
                    })
                
                return {
                    success: true,
                }
            } catch (e) {
                console.log('Exception while updating user log', e)
                return {
                    error: true,
                    msg: e,
                    success: false,
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

};
  
module.exports = QuestionController;
  

