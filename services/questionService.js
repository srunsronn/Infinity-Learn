import express from "express";
import dotenv from "dotenv";
import BaseService from "../utils/baseService.js";
import Question from "../models/questionModel.js";
import Quiz from "../models/quizModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import Redis from 'ioredis';

dotenv.config();
const redis = new Redis(process.env.REDIS_URL);
class QuestionService extends BaseService {
    constructor(Question){
        super(Question)
    }

    async getQuestionByQuizId(id){
        try{
            const quiz = await Quiz.findById(id);
            if(!quiz){
                throw new ErrorHandler(404,'Quiz not found');
            }
            const qestion = await Question.find({quiz_id:id})
            return {message:"Question founded",qestion};
        }catch(err){
            throw new ErrorHandler(500,err.message)
        }
    }

    async updateQuestion(id,data){
        return await this.update(id,data)
    }

    async deleteAllQuestion(){
        const deleteAll = await Question.deleteMany();
        return deleteAll;
    }
}

export default new QuestionService(Question);