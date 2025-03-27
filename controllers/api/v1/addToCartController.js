import AddToCartService from "../../../services/addToCartService.js";
import asyncHandler from "../../../middlewares/asyncHandler.js";
const addToCart = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.body;

  const result = await AddToCartService.addToCartToggle(userId, courseId);
  res.status(200).json({ message: "Save course succesfully", result });
});

const getCart = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const result = await AddToCartService.getCart(userId);
  res.status(200).json(result);
});

const removeCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await AddToCartService.delete(id);
  res.status(200).json(result);
});

export { addToCart, getCart, removeCart };
