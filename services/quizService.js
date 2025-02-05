import dotenv from 'dotenv';
import Redis from 'ioredis';
import BaseService from '../utils/baseService.js';
import Quiz from "../models/quizModel.js";
import ErrorHandler from '../utils/errorHandler.js';

dotenv.config();
const redis = new Redis(process.env.REDIS_URL);

class QuizService extends BaseService{
    constructor(Quiz){
        super(Quiz)
    }

    // create quiz

    async create(data) {
        try {
            const {lesson_id, title, description, time_limit, is_active} = data;
            if(!lesson_id || !title || !time_limit) {
                throw new ErrorHandler(400,'Missing required fields: lesson_id, title, time_limit');
            }

            const newQuiz = await Quiz.create({
                lesson_id,
                title,
                description,
                time_limit,
                is_active:is_active??true,
            });
            return newQuiz;
        } catch (err) {
            throw new ErrorHandler(500,err.message);
        }
    }

    // get all quiz

    async findAll(filter={}){
        try{
            return await this.model.find(filter);
        } catch (err){
            throw new ErrorHandler(500,err.message);
        }

    }

    //update quiz

    // async update(id,data){
        
    // }

    // delete quiz
    async deleteQuiz(id){
        return await this.delete(id);
    }
}

export default new QuizService(Quiz);
