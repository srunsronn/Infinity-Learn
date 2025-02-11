import asyncHandler from "../../../middlewares/asyncHandler.js";
import OrderService from "../../../services/orderService.js";
import notificationService from "../../../services/notificationService.js";

const createOrder = asyncHandler(async (req, res) => {
  const result = await OrderService.create(req.body);
  await notificationService.create({
    title: "Order Created",
    userId: result.userId,
    message: `Order ${result._id} created successfully`,
  });
  res.status(201).json({ message: "Order created successfully", result });
});

const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const result = await OrderService.findById(orderId);
  res.status(200).json({ message: "Get order successfully", result });
});

const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const result = await OrderService.findByUserId(userId);
  res.status(200).json({ message: "Get user orders successfully", result });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const result = await OrderService.findAll();
  res.status(200).json({ message: "Get all orders successfully", result });
});

const updateOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const updatedOrder = await OrderService.updateOrderById(orderId, req.body);

  await notificationService.createNotification({
    title: "Order Updated",
    userId: updatedOrder.userId,
    message: `Order ${updatedOrder._id} updated successfully`,
  });

  res.status(200).json({ message: "Order updated successfully", updatedOrder });
});

const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const deletedOrder = await OrderService.deleteOrder(orderId);

  await notificationService.createNotification({
    title: "Order Deleted",
    userId: deletedOrder.userId,
    message: `Order ${deletedOrder._id} deleted successfully`,
  });

  res.status(200).json({ message: "Order deleted successfully", deletedOrder });
});
export {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderById,
  deleteOrder,
};
