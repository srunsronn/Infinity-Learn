import express from "express";

import {
    createQuiz,
    getAllQuiz,
    updateQuiz,
    deleteQuiz,
    updateQuizStatus,
    getAllActiveQuiz,
} from '../controllers/api/v1/quizController.js';
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.route("/createQuiz").post(authenticate,verifyRole('admin','teacher'),createQuiz);
router.route("/getAllQuiz").post(authenticate,verifyRole('admin','teacher','student'),getAllQuiz);
router.route('/getAllQuiz/active').post(authenticate,verifyRole('admin','teacher','student'),getAllActiveQuiz);
router.route("/updateQuiz").put(authenticate,verifyRole('admin','teacher'),updateQuiz);
router.route("/updateQuiz/status/:id").patch(authenticate,verifyRole('admin','teacher'),updateQuizStatus);
router.route("/deleteQuiz/:id").deleteauthenticate,verifyRole('admin','teacher'),(deleteQuiz);



export default router;