import express from "express";

import { createQuestion,getAllQuestion, getQuestionById , updateQuestion, deleteQuestion,getQuestionByQuizId,deleteAll} from "../controllers/api/v1/questionController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import verifyRole from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.route("/create-question").post(authenticate,verifyRole('admin','teacher'), createQuestion);
router.route("/:id").get(authenticate,verifyRole('admin','teacher','student'), getQuestionById);


//admin 
router.route("/get-all-questions").post(authenticate, verifyRole("admin","teacher"), getAllQuestion);
router.route("/quiz/:quiz_id").post(authenticate, verifyRole("admin","teacher"), getQuestionByQuizId);
router.route("/:id/update").put(authenticate, verifyRole("admin","teacher"), updateQuestion);
router.route('/deleteAll').delete(authenticate,verifyRole('admin'),deleteAll);

router.route("/delete/:id").delete(authenticate,verifyRole("teacher", "admin"), deleteQuestion);



export default router;
