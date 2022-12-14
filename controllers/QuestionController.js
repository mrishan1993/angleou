
var _ = require('lodash')
const knex = require ("../knex")
const SCORE_ADDED = 10
const LIFE_DEDUCTED = 1
const DEFAULT_LIVES = 3
const DEDUCT_POINTS = 10
const QuestionController = {
    GetAllQuestions: async function(request, h) {
        console.log('inside GetAllQuestions', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                result = await knex.select("id", "question", "option_one", "option_two", "option_three", "option_four").from('Questions').where({
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
    GetQuestionByID: async function(request, h) {
        console.log('inside GetQuestionByID', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                var id = request.payload.question_id
                result = await knex.select("id", "question", "option_one", "option_two", "option_three", "option_four").from('Questions').where({
                    active: 1,
                    archive: 0,
                    id: id
                })
                
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
    RefreshLives: async function(request, h) {
        console.log('inside GetQuestionByID', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                var session_id = request.payload.session_id
                var user_live_session
                user_live_session = await knex.select().from('User_Lives_Session').where({
                    active: 1,
                    archive: 0,
                    id: session_id
                })
                user_live_session = _.head(user_live_session)
                user_live_session.lives_remaining = DEFAULT_LIVES
                await knex('User_Lives_Session').update(
                    {
                        lives_remaining: user_live_session.lives_remaining
                    }
                ).where ({
                    id: session_id
                })
                
                return {
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
    DeductPoints: async function(request, h) {
        console.log('inside DeductPoints', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                var session_id = request.payload.session_id
                var user_id = request.payload.user_id
                var user_score_session
                var user_scorecard
                user_score_session = await knex.select().from('User_Score_Session').where({
                    active: 1,
                    archive: 0,
                    id: session_id
                })
                user_score_session = _.head(user_score_session)
                user_score_session.score = user_score_session.score - DEDUCT_POINTS

                
                user_scorecard = await knex.select().from('User_Scoreboard').where({
                    active: 1,
                    archive: 0,
                    id: session_id
                })
                user_scorecard = _.head(user_scorecard)
                user_scorecard.total_score = user_scorecard.total_score - DEDUCT_POINTS
                await knex('User_Score_Session').update(
                    {
                        score: user_score_session.score
                    }
                ).where ({
                    id: session_id
                })

                await knex('User_Scoreboard').update(
                    {
                        total_score: user_scorecard.total_score
                    }
                ).where ({
                    user_id: user_id
                })
                
                return {
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
    AnswerQuestionByID: async function(request, h) {
        console.log('inside AnswerQuestionByID', request)
        var result = {}
        if (request && request.payload) {
            try {
                var result = {}
                var user_scoreboard;
                var user_score_session;
                var user_live_session
                var question_id = request.payload.question_id
                var user_id = request.payload.user_id
                var answer = request.payload.answer
                var session_id = request.payload.session_id
                result = await knex.select().from('Questions').where({
                    active: 1,
                    archive: 0,
                    id: question_id
                })
                result = _.head(result)
                if (result.answer === answer) {
                    // give points
                    user_score_session = await knex.select().from('User_Score_Session').where({
                        active: 1,
                        archive: 0,
                        id: session_id
                    })
                    user_score_session = _.head(user_score_session)
                    user_score_session.score = user_score_session.score + SCORE_ADDED
                    await knex('User_Score_Session').update(
                        {
                            score: user_score_session.score
                        }
                    ).where ({
                        id: session_id
                    })

                    // update the scoreboard
                    user_scoreboard = await knex.select().from('User_Scoreboard').where({
                        active: 1,
                        archive: 0,
                        user_id: user_id
                    })
                    user_scoreboard = _.head(user_scoreboard)
                    user_scoreboard.total_score = user_scoreboard.total_score + SCORE_ADDED
                    await knex('User_Scoreboard').update(
                        {
                            total_score: user_scoreboard.total_score
                        }
                    ).where ({
                        user_id: user_id
                    })
                } else {
                    // deduce lives 
                    user_live_session = await knex.select().from('User_Lives_Session').where({
                        active: 1,
                        archive: 0,
                        id: session_id
                    })
                    user_live_session = _.head(user_live_session)
                    user_live_session.lives_used = user_live_session.lives_used + LIFE_DEDUCTED
                    user_live_session.lives_remaining = user_live_session.lives_remaining - LIFE_DEDUCTED
                    await knex('User_Lives_Session').update(
                        {
                            lives_used: user_live_session.lives_used,
                            lives_remaining: user_live_session.lives_remaining
                        }
                    ).where ({
                        id: session_id
                    })

                    // update the scoreboard
                    user_scoreboard = await knex.select().from('User_Scoreboard').where({
                        active: 1,
                        archive: 0,
                        user_id: user_id
                    })
                    user_scoreboard = _.head(user_scoreboard)
                    user_scoreboard.total_lives_used = user_scoreboard.total_lives_used + LIFE_DEDUCTED
                    await knex('User_Scoreboard').update(
                        {
                            total_lives_used: user_scoreboard.total_lives_used
                        }
                    ).where ({
                        user_id: user_id
                    })
                }
                return {
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

};
  
module.exports = QuestionController;
  

