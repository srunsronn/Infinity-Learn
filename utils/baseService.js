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

  // Update
  async update(id, data) {
    try {
      const updatedRecord = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!updatedRecord) {
        throw new ErrorHandler(404, "Record not found");
      }
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
