import BaseService from "../utils/baseService.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import ErrorHandler from "../utils/errorHandler.js";

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
      user.bio = data.bio ?? user.bio; // update bio if provided
      user.profile = data.profile ?? user.profile; // update profile picture URL if provided

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

  // delete
  async deleteUser(userId) {
    return this.delete(userId);
  }

  // get all users
  async getAllUsers() {
    return this.findAll();
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

  async getUsersMonthly() {
    try {
    
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

      // Months of the year for display
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

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

  // update role

  async updateUserRole(userId, role) {
    try {
      const user = await this.model.findById(userId);

      if (!user) {
        throw new ErrorHandler(404, "User not found");
      }
      // Check if the role is valid
      const validRoles = ["student", "teacher", "admin"];
      if (!validRoles.includes(role)) {
        throw new ErrorHandler(400, "Invalid role");
      }

      user.role = role || user.role;
      await user.save();
      return user;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async createUserByAdmin(data) {
    try {
      const { firstName, lastName, email, password, role } = data;
      console.log("user", firstName);
      console.log("last name",lastName);

      if (!firstName || !lastName || !email || !password || !role) {
        throw new ErrorHandler(400, "All fields are required");
      }
      const existingUser = await this.model.findOne({ email });
      if (existingUser) {
        throw new ErrorHandler(400, "User already exists");
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUserByAdmin = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      });

      await newUserByAdmin.save();
      return newUserByAdmin;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.model.findById(userId);
      if (!user) {
        throw new ErrorHandler(404, "User not found");
      }
      return user;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  async updateUserByAdmin(userId, data) {
    try {
      const user = await this.model.findById(userId);

      if (!user) {
        throw new ErrorHandler(404, "User not found");
      }

      user.firstName = data.firstName || user.firstName;
      user.lastName = data.lastName || user.lastName;
      user.email = data.email || user.email;
      user.role = data.role || user.role;

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


}

export default new UserService(User);
