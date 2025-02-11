import ErrorHandler from "./errorHandler.js";

class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Create
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Find by Id
  async findById(id) {
    try {
      const record = await this.model.findById(id);
      if (!record) {
        throw new ErrorHandler(404, "Record not found");
      }
      return record;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Find all
  async findAll(filter = {}) {
    try {
      return await this.model.find(filter);
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Find by user Id
  async findByUserId(userId) {
    try {
      const records = await this.model.find({ userId });
      if (!records.length) {
        throw new ErrorHandler(404, "No records found for this user");
      }
      return records;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Update
  async update(id, data) {
    try {
      
      const currentRecord = await this.model.findById(id);
      if (!currentRecord) {
        throw new ErrorHandler(404, "Record not found");
      }

      for (let key in data) {
        if (data[key] && typeof data[key] === "object" && currentRecord[key]) {
          currentRecord[key] = { ...currentRecord[key], ...data[key] };
        } else {
          currentRecord[key] = data[key];
        }
      }

      const updatedRecord = await currentRecord.save();
      return updatedRecord;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }

  // Delete
  async delete(id) {
    try {
      const deletedRecord = await this.model.findByIdAndDelete(id);
      if (!deletedRecord) {
        throw new ErrorHandler(404, "Record not found");
      }
      return deletedRecord;
    } catch (err) {
      throw new ErrorHandler(500, err.message);
    }
  }
}

export default BaseService;
