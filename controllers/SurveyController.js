
var _ = require('lodash')
const knex = require ("../knex")
const SurveyController = {
    GetSurveyQuestions: async function(request, h) {
        console.log('inside GetSurveyQuestions', request)
        var result = {}
        if (request) {
            try {
                var result = {}
                result = await knex.select('id', 'question_one', 'question_two',
                'question_three', 'question_four', 'question_five',
                'question_six',).from('User_Feedback_Questions')
                
                return {
                    result : _.head(result),
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
                    }
                )
                
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
  
module.exports = SurveyController;
  

