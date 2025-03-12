import CourseService from "../../../services/courseService.js";
import asyncHandler from "../../../middlewares/asyncHandler.js";
import cloudinary from "../../../utils/cloudinary.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Course from "../../../models/courseModel.js";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all courses
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await CourseService.getAllCourses();
  res
    .status(200)
    .json({ message: "Get all courses successfully", data: courses });
});

//instructor get course
const getCoursesByInstructor = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;
  const courses = await CourseService.getCoursesByInstructor(instructorId);
  res
    .status(200)
    .json({ message: "Get all courses successfully", data: courses });
});

// Create a new course
const createCourse = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    instructor,
    outcomes,
    sections,
    courseTopic,
  } = req.body;

  console.log("req.files:", req.files);
  console.log("req.body:", req.body);

  // Validate required fields
  if (!name || !description || !price || !instructor || !courseTopic) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const parsedPrice = parseFloat(price);
  const parsedOutcomes = JSON.parse(outcomes);
  let parsedSections = [];
  try {
    parsedSections = JSON.parse(sections);
  } catch (error) {
    console.error("Error parsing sections:", error);
  }

  // **Handle course thumbnail upload**
  let courseThumbnail = "";
  if (req.files?.courseThumbnail) {
    const imageFile = req.files.courseThumbnail;
    const tempImagePath = path.join(__dirname, "../../../temp", imageFile.name);
    await imageFile.mv(tempImagePath);

    try {
      const result = await cloudinary.uploader.upload(tempImagePath, {
        folder: "course_thumbnails",
      });
      courseThumbnail = result.secure_url;
      fs.unlinkSync(tempImagePath);
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: "Failed to upload image" });
    }
  }

  // **Handle video uploads dynamically**
  const updatedSections = await Promise.all(
    parsedSections.map(async (section, sectionIndex) => {
      const updatedLectures = await Promise.all(
        section.lectures.map(async (lecture, lectureIndex) => {
          if (lecture.video?.type === "file") {
            const videoKey = `videoFile_${sectionIndex}_${lectureIndex}`;
            const videoFile = req.files?.[videoKey];

            if (videoFile) {
              const tempVideoPath = path.join(
                __dirname,
                "../../../temp",
                videoFile.name
              );
              await videoFile.mv(tempVideoPath);

              try {
                const uploadResult = await cloudinary.uploader.upload(
                  tempVideoPath,
                  {
                    resource_type: "video",
                    folder: "course_videos",
                  }
                );
                fs.unlinkSync(tempVideoPath);
                return {
                  ...lecture,
                  video: {
                    type: "file",
                    data: uploadResult.secure_url,
                  },
                };
              } catch (error) {
                console.error("Error uploading video:", error);
                return res
                  .status(500)
                  .json({ message: "Failed to upload video" });
              }
            }
          }
          return lecture;
        })
      );
      return { ...section, lectures: updatedLectures };
    })
  );

  // **Save course in DB**
  const course = new Course({
    name,
    description,
    price: parsedPrice,
    instructor,
    outcomes: parsedOutcomes,
    sections: updatedSections,
    courseTopic,
    courseThumbnail,
  });

  await course.save();
  res
    .status(201)
    .json({ message: "Course created successfully", data: course });
});

// Get course by ID
const getCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const course = await CourseService.getCourseById(courseId);
  res
    .status(200)
    .json({ message: "Get course by ID successfully", data: course });
});

// Update course
const updateCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const updateData = req.body;

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({ message: "No data provided for update" });
  }

  // Parse fields correctly
  if (updateData.price) updateData.price = parseFloat(updateData.price);
  if (updateData.outcomes)
    updateData.outcomes = JSON.parse(updateData.outcomes);
  if (updateData.sections) {
    try {
      updateData.sections = JSON.parse(updateData.sections);
    } catch (error) {
      console.error("Error parsing sections:", error);
    }
  }

  // Handle course thumbnail upload
  if (req.files && req.files.image) {
    const imageFile = req.files.image; // Use the image file
    const tempImagePath = path.join(__dirname, "../../../temp", imageFile.name);
    await imageFile.mv(tempImagePath);

    try {
      const result = await cloudinary.uploader.upload(tempImagePath, {
        folder: "course_thumbnails",
      });
      updateData.courseThumbnail = result.secure_url;
      fs.unlinkSync(tempImagePath); // Remove the temporary file
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: "Failed to upload image" });
    }
  }

  if (updateData.sections) {
    updateData.sections = await Promise.all(
      updateData.sections.map(async (section) => {
        const updatedLectures = await Promise.all(
          section.lectures.map(async (lecture) => {
            if (lecture.video.type === "file" && req.files?.videoFile) {
              const videoFile = req.files.videoFile;
              const tempVideoPath = path.join(
                __dirname,
                "../../../temp",
                videoFile.name
              );
              await videoFile.mv(tempVideoPath);

              try {
                const result = await cloudinary.uploader.upload(tempVideoPath, {
                  folder: "course_videos",
                  resource_type: "video",
                });
                lecture.video.data = result.secure_url;
                fs.unlinkSync(tempVideoPath); // Remove the temporary file
              } catch (error) {
                console.error("Error uploading video:", error);
              }
            } else if (lecture.video.type === "youtube") {
              // Directly store the YouTube URL
              lecture.video.data = lecture.video.data;
            }
            return lecture;
          })
        );
        section.lectures = updatedLectures;
        return section;
      })
    );
  }

  const updatedCourse = await CourseService.updateCourse(courseId, updateData);
  res
    .status(200)
    .json({ message: "Course updated successfully", data: updatedCourse });
});

// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  await CourseService.deleteCourse(courseId);
  res.status(200).json({ message: "Course deleted successfully" });
});



export {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  
};
