import asyncHandler from "../../../middlewares/asyncHandler.js";
import BannerService from "../../../services/bannerService.js";

const getAllBanners = asyncHandler(async (req, res) => {
  const result = await BannerService.findAll();
  res
    .status(200)
    .json({ message: "Get all banners successfully", result });
});

const createBanner = asyncHandler(async (req, res) => {
    if (!req.body.mainTitle){
        req.body.mainTitle = "Defualt main title"; // Default if no provides title
    }
    if (!req.body.subTitle){
        req.body.subTitle = "Defualt sub title"; // Default if no provides title
    }
  const result = await BannerService.createBanner(req.body);
  res
    .status(201)
    .json({ message: "Banner created successfully", result });
});

const updateBanner = asyncHandler(async (req, res) => { 
  const result = await BannerService.updateBanner(req.params.id, req.body);
  res
    .status(200)
    .json({ message: "Banner updated successfully", result });
});

export {
    getAllBanners,
    createBanner,
    updateBanner
}