import express from "express";
import asyncHandler from "../../../middlewares/asyncHandler.js";
import quizService from "../../../services/quizService.js";

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

const deleteQuiz = asyncHandler(async(req,res)=>{
    const{id, ...resOfData} = req.body;
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
}
