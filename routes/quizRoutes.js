import express from "express";

import {
    createQuiz,
    getAllQuiz,
    updateQuiz,
    deleteQuiz
} from '../controllers/api/v1/quizController.js';
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.route("/createQuiz").post(createQuiz);
router.route("/getAllQuiz").post(getAllQuiz);
router.route("/updateQuiz").put(updateQuiz);
router.route("/deleteQuiz").delete(deleteQuiz);

//protect routes

router.route('/admin').get(authenticate,verifyRole('admin'),(req,res)=>{
    res.json({
        message:'Admin page',
    });
});

router.route('/teacher').get(authenticate,verifyRole('teacher'),(req,res)=>{
    res.json({
        message:'Teacher page',
    });
});

router.route('/student').get(authenticate,verifyRole('student'),(req,res)=>{
    res.json({
        message:'Student page',
    });
});

export default router;