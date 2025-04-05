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
                    duration: lecture.video.duration,
                  },
                };
              } catch (error) {
                console.error("Error uploading video:", error);
                return res
                  .status(500)
                  .json({ message: "Failed to upload video" });
              }
            }
          } else if (lecture.video?.type === "youtube") {
            return {
              ...lecture,
              video: {
                ...lecture.video,
                duration: lecture.video.duration || 0,
              },
            };
          }
          return lecture;
        })
      );
      return { ...section, lectures: updatedLectures };
    })
  );

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

  if (updateData.price) updateData.price = parseFloat(updateData.price);

  if (updateData.outcomes && typeof updateData.outcomes === "string") {
    try {
      updateData.outcomes = JSON.parse(updateData.outcomes);
    } catch (error) {
      console.error("Error parsing outcomes:", error);
      return res
        .status(400)
        .json({ message: "Invalid JSON format for outcomes" });
    }
  }

  // Parse sections if it's a string
  if (updateData.sections && typeof updateData.sections === "string") {
    try {
      updateData.sections = JSON.parse(updateData.sections); // Parse JSON string into an array
    } catch (error) {
      console.error("Error parsing sections:", error);
      return res
        .status(400)
        .json({ message: "Invalid JSON format for sections" });
    }
  }

  // Ensure sections is an array
  if (updateData.sections && !Array.isArray(updateData.sections)) {
    return res.status(400).json({ message: "Sections must be an array" });
  }

  // Fetch the existing course
  const existingCourse = await CourseService.getCourseById(courseId);
  if (!existingCourse) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Update course fields
  if (updateData.name) existingCourse.name = updateData.name;
  if (updateData.description)
    existingCourse.description = updateData.description;
  if (updateData.price) existingCourse.price = updateData.price;
  if (updateData.courseTopic)
    existingCourse.courseTopic = updateData.courseTopic;
  if (updateData.outcomes) existingCourse.outcomes = updateData.outcomes;

  // Handle course thumbnail upload
  if (req.files && req.files.image) {
    const imageFile = req.files.image;
    const tempImagePath = path.join(__dirname, "../../../temp", imageFile.name);
    await imageFile.mv(tempImagePath);

    try {
      const result = await cloudinary.uploader.upload(tempImagePath, {
        folder: "course_thumbnails",
      });
      existingCourse.courseThumbnail = result.secure_url;
      fs.unlinkSync(tempImagePath); // Remove the temporary file
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(500).json({ message: "Failed to upload image" });
    }
  }

  // Update existing sections and lectures
  if (updateData.sections) {
    updateData.sections.forEach((updatedSection) => {
      const existingSection = existingCourse.sections.id(updatedSection._id);

      if (existingSection) {
        // Update section fields
        if (updatedSection.title) existingSection.title = updatedSection.title;
        if (updatedSection.isOpen !== undefined)
          existingSection.isOpen = updatedSection.isOpen;

        // Update lectures within the section
        if (updatedSection.lectures) {
          updatedSection.lectures.forEach((updatedLecture) => {
            const existingLecture = existingSection.lectures.id(
              updatedLecture._id
            );

            if (existingLecture) {
              // Update lecture fields
              if (updatedLecture.title)
                existingLecture.title = updatedLecture.title;
              if (updatedLecture.video)
                existingLecture.video = updatedLecture.video;
              if (updatedLecture.quiz !== undefined)
                existingLecture.quiz = updatedLecture.quiz;
            }
          });
        }
      }
    });
  }

  // Save the updated course
  await existingCourse.save();

  res.status(200).json({
    message: "Course updated successfully",
    data: existingCourse,
  });
});
const addSectionToCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const { title, isOpen } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Section title is required" });
  }

  const course = await CourseService.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const newSection = {
    title,
    isOpen: isOpen || false,
    lectures: [],
  };

  course.sections.push(newSection);
  await course.save();

  res.status(200).json({
    message: "Section added successfully",
    data: course,
  });
});

const addLectureToSection = asyncHandler(async (req, res) => {
  const courseId = req.params.id;

  const sectionId = req.body.sectionId;
  const title = req.body.title;
  const videoDuration = req.body["video[duration]"];

  console.log("Request body:", req.body);
  console.log("Video duration from form:", videoDuration);

  if (!sectionId || !title) {
    return res.status(400).json({
      message: "Section ID and lecture title are required",
    });
  }

  const course = await CourseService.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const section = course.sections.id(sectionId);
  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  let videoData = null;

  // Handle video upload
  if (req.files?.videoFile) {
    const videoFile = req.files.videoFile;
    const tempVideoPath = path.join(__dirname, "../../../temp", videoFile.name);
    await videoFile.mv(tempVideoPath);

    try {
      const uploadResult = await cloudinary.uploader.upload(tempVideoPath, {
        resource_type: "video",
        folder: "course_videos",
      });
      fs.unlinkSync(tempVideoPath);
      videoData = {
        type: "file",
        data: uploadResult.secure_url,
        duration: parseInt(videoDuration || 0), // Use the correct variable and convert to number
      };

      console.log("Video data being saved:", videoData);
    } catch (error) {
      console.error("Error uploading video:", error);
      return res.status(500).json({ message: "Failed to upload video" });
    }
  } else if (req.body["video[type]"] === "youtube") {
    // Handle YouTube video type - also fix this for FormData
    videoData = {
      type: "youtube",
      data: req.body.video?.data || req.body["video[data]"],
      duration: parseInt(videoDuration || 0),
    };
  }

  const newLecture = {
    title,
    video: videoData || null,
    quiz: req.body.quiz || null,
  };

  section.lectures.push(newLecture);
  await course.save();

  res.status(200).json({
    message: "Lecture added successfully",
    data: course,
  });
});
// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  await CourseService.deleteCourse(courseId);
  res.status(200).json({ message: "Course deleted successfully" });
});
const deleteSectionFromCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const { sectionId } = req.body;

  if (!sectionId) {
    return res.status(400).json({
      message: "Section ID is required",
    });
  }

  const course = await CourseService.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const sectionIndex = course.sections.findIndex(
    (section) => section._id.toString() === sectionId
  );
  if (sectionIndex === -1) {
    return res.status(404).json({ message: "Section not found" });
  }

  // Remove the section using splice
  course.sections.splice(sectionIndex, 1);
  await course.save();

  res.status(200).json({
    message: "Section deleted successfully",
    data: course,
  });
});
const deleteLectureFromSection = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const { sectionId, lectureId } = req.body;

  if (!sectionId || !lectureId) {
    return res.status(400).json({
      message: "Section ID and Lecture ID are required",
    });
  }

  const course = await CourseService.getCourseById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const section = course.sections.id(sectionId);
  if (!section) {
    return res.status(404).json({ message: "Section not found" });
  }

  const lectureIndex = section.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId
  );
  if (lectureIndex === -1) {
    return res.status(404).json({ message: "Lecture not found" });
  }

  section.lectures.splice(lectureIndex, 1);
  await course.save();

  res.status(200).json({
    message: "Lecture deleted successfully",
    data: course,
  });
});

const getCourseDuration = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const totalDuration = await CourseService.calculateCourseDuration(courseId);

  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);
  const seconds = totalDuration % 60;

  const formattedDuration = `${hours}h ${minutes}m ${seconds}s`;

  res.status(200).json({
    totalDurationSeconds: totalDuration,
    formattedDuration,
  });
});

export {
  getAllCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  addSectionToCourse,
  addLectureToSection,
  deleteLectureFromSection,
  deleteSectionFromCourse,
  getCourseDuration,
};
