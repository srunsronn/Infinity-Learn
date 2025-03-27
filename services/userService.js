import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

class UserService extends BaseService {
    constructor(User) {
        super(User);
    }

    // get user profile
    async getUserProfile(userId) {
        return this.findById(userId);

    }

    //update user profile
    async updateUserProfile(userId, data) {
        try {
            const user = await this.model.findById(userId);

            if (!user) {
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

        } catch (err) {
            throw new ErrorHandler(500, err.message);
        }
    }

    //delete 
    async deleteUser(userId) {
        return this.delete(userId);
    }

    //get all users
    async getAllUsers() {
        return this.findAll();
    }

    // async createQuiz(data){
    //     return this.create(data);
    // }
    async getUsersMonthly() {
        try {
            // Aggregate the users by role and month, ensuring the correct year and month grouping
            const monthlyUsers = await this.model.aggregate([
                // { $match: { role: role } },
                {
                    $project: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        role: 1,
                    }
                },
                {
                    $group: {
                        _id: { year: "$year", month: "$month", role: "$role" },
                        users: { $sum: 1 } // Count users per month
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort by year and month
            ]);

            console.log('Monthly Users:', monthlyUsers); // Add logging to check the aggregation output

            // Months of the year for display
            const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            // // Initialize the trendData with all months set to 0 users
            // const trendData = months.map((month, index) => {
            //     const monthData = monthlyUsers.find(data => data._id.month === index + 1);
            //     return {
            //         month: month,
            //         users: monthData ? monthData.users : 0
            //     };
            // });
            // Initialize an object to store users per role and month
            const trendData = [];

            // Loop through the months
            months.forEach((month, index) => {
                const monthlyData = monthlyUsers.filter(
                    (data) => data._id.month === index + 1
                );

                // Collect data by role for each month
                const roles = ["student", "teacher", "admin"]; // Modify with your roles
                const roleData = roles.map((role) => {
                    const roleCount = monthlyData.find(
                        (data) => data._id.role === role
                    );
                    return {
                        role: role,
                        users: roleCount ? roleCount.users : 0,
                    };
                });
                trendData.push({
                    month: month,
                    data: roleData,
                });
            });
            return trendData;
        } catch (error) {
            console.error('Error:', error); // Add logging for errors
            throw new ErrorHandler(500, error.message); // Handle any errors
        }
    }




}

export default new UserService(User);