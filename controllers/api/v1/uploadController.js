import cloudinary from "../../../utils/cloudinary.js";

export const uploadImage = (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded",
        });
    }

    // Upload the file to Cloudinary
    cloudinary.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: false,
                message: "Error uploading image",
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: result.secure_url
        });
    });
};