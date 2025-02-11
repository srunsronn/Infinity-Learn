import BaseService from "../utils/baseService.js";
import Order from "../models/orderModel.js";

class OrderServices extends BaseService {
  constructor(Order) {
    super(Order);
  }
}

export default new OrderServices(Order);
