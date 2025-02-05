import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

class UserService extends BaseService {
    constructor(User) {
        super(User);
    }

    // get user profile
    async getUserProfile(userId){
        return this.findById(userId);

    }

    //update user profile
    async updateUserProfile(userId, data){
        try {
            const user = await this.model.findById(userId);

            if(!user){
                throw new ErrorHandler(404, "User not found");
            }

            user.name = data.name || user.name;
            user.email = data.email || user.email;

            if (data.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(data.password, salt);
            }

            await user.save();
            return user;

        }catch(err){
            throw new ErrorHandler(500, err.message);
        }
    }

    //delete 
    async deleteUser(userId){
        return this.delete(userId);
    }

    //get all users
    async getAllUsers(){
        return this.findAll();
    }

    // async createQuiz(data){
    //     return this.create(data);
    // }
}

export default new UserService(User);