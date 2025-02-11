import dotenv from 'dotenv';
import Redis from 'ioredis';
import BaseService from '../utils/baseService.js';
import Quiz from "../models/quizModel.js";
import ErrorHandler from '../utils/errorHandler.js';
import Question from "../models/questionModel.js";

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

    // get all active quiz

    async getAllActiveQuiz(){
        return await this.findAll({is_active:true});
    }

    //update quiz stautus (activate,disactivate)

    async updateQuizStatus(id){
        try {
            const quiz = await this.findById(id);
            if(!quiz){
                return new ErrorHandler(404, "quiz not found");
            }
            const updateStatus = await this.update(id,{is_active:!quiz.is_active});
            return { message: "Quiz stautus update successfully",quiz:updateStatus};
        } catch (err){
            throw new ErrorHandler(500,err.message)
        }
    }

    // delete quiz
    async deleteQuiz(id){
        try{
            const deleteQuiz =  await this.delete(id);
        if(!deleteQuiz){
            throw new ErrorHandler(404,'Quiz not Found')
        }
        await Question.deleteMany({quiz_id:id});
        return {message: 'Quiz and all related question are deleted'}
        } catch(err){
            throw new ErrorHandler(500,err.message)
        }
        

    }
}

export default new QuizService(Quiz);
