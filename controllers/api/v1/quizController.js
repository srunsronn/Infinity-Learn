import express from "express";
import asyncHandler from "../../../middlewares/asyncHandler.js";
import quizService from "../../../services/quizService.js";
import req from "express/lib/request.js";

const createQuiz = asyncHandler(async(req,res)=>{
    const result = await quizService.create(req.body);
    res.status(201).json(result);
});

const getAllQuiz = asyncHandler(async(req,res)=>{
    const result = await quizService.findAll();
    res.status(200).json(result);
});

const updateQuiz = asyncHandler(async(req,res)=>{
    const {id, ...updateData} = req.body;
    if(!id){
        return res.status(400).json({message:"Quiz ID is required"});
    }
    const result = await quizService.update(id,updateData);
    res.status(200).json(result);
});

const updateQuizStatus = asyncHandler(async(req,res)=>{
    const id = req.params.id;
    const result  = await quizService.updateQuizStatus(id);
    res.status(200).json(result)
})

const getAllActiveQuiz = asyncHandler(async(req,res)=>{
    const result = await quizService.getAllActiveQuiz();
    res.status(200).json(result);
})
    


const deleteQuiz = asyncHandler(async(req,res)=>{
    const{id} = req.params;
    if(!id){
        return res.status(400).json({message:"Quiz ID is required"});
    }
    const result = await quizService.delete(id);
    res.status(200).json(result);
});

export {
    createQuiz,
    getAllQuiz,
    updateQuiz,
    deleteQuiz,
    updateQuizStatus,
    getAllActiveQuiz,
}
