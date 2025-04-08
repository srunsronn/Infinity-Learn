import asyncHandler from "../../../middlewares/asyncHandler.js";
import UserService from "../../../services/userService.js";

const getUserProfile = asyncHandler(async (req, res) => {
    const result = await UserService.getUserProfile(req.user._id);
    res.status(200).json({ message: "Get user successfully", result });
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
});

const getUsersMonthly = asyncHandler(async (req, res) => {
    // const role = req.user.role;
    const result = await UserService.getUsersMonthly();
    res.status(200).json({ message: "Get users monthly successfully", result });
})

const updateUserRole = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    const result = await UserService.updateUserRole(userId, role);
    res.status(200).json({ message: "User role updated successfully", result });
})

const createUserByAdmin = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    const result = await UserService.createUserByAdmin({ firstName, lastName, email, password, role });
    res.status(201).json({ message: "User created successfully", result });
})

const getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const result = await UserService.getUserById(userId);
    res.status(200).json({ message: "Get user successfully", result });
})

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email, password, role } = req.body;
    const result = await UserService.updateUserByAdmin(userId, { firstName, lastName, email, password, role });
    res.status(200).json({ message: "User updated successfully", result });
});

export { getUserProfile, updateUserProfile, deleteUser, getAllUsers, getUsersMonthly, updateUserRole, createUserByAdmin, getUserById, updateUserByAdmin };
