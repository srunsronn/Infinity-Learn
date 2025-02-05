import asyncHandler from "../../../middlewares/asyncHandler.js";
import UserService from "../../../services/userService.js";

const getUserProfile = asyncHandler(async (req, res) => {
  const result = await UserService.getUserProfile(req.user._id);
  res.status(200).json({message: "Get user successfully", result});
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const result = await UserService.updateUserProfile(req.user._id, req.body);
    res.status(200).json({ message: "User updated successfully", result });
}); 

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const result = await UserService.deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully", result });	
});

const getAllUsers = asyncHandler(async (req, res) => {
    const result = await UserService.findAll();
    res.status(200).json({ message: "Get all users successfully", result });
}) ;


export { getUserProfile, updateUserProfile, deleteUser, getAllUsers };
