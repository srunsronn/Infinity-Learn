class BaseService {
  constructor(model) {
    this.model = model;
  }

  //create
  async create(data) {
    try {
      return await this.model.create(data);
    } catch (err) {
      throw new Error(err);
    }
  }

  //find by Id
  async findById(id) {
    try {
      const record = await this.model.findById(id);
      if (!record) {
        throw new Error("Record not found");
      }
      return record;
    } catch (err) {
      throw new Error(err);
    }
  }

  // find all
  async findAll(filter = {}) {
    try {
      return await this.model.find(filter);
    } catch (err) {
      throw new Error(err);
    }
  }

  // update
  async update(id, data) {
    try {
      const updatedRecord = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      if (!updatedRecord) {
        throw new Error("Record not found");
      }
      return updatedRecord;
    } catch (err) {
      throw new Error(err);
    }
  }

  //delete
  async delete(id) {
    try {
      const deleteRecord =  await this.model.findByIdAndDelete(id);
        if (!deleteRecord) {
            throw new Error("Record not found");
        }
        return deleteRecord;
    } catch (err) {
      throw new Error(err);
    }
  }
}
export default BaseService;
