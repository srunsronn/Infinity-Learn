import BaseService from "../utils/baseService.js";
import Engagement from "../models/engagementModel.js";

class EngagementService extends BaseService {
  constructor() {
    super(Engagement);
  }

  async trackLogin(studentId, courseId) {
    let engagement = await Engagement.findOne({
      student: studentId,
      course: courseId,
    });
    if (engagement) {
      engagement.logins += 1;
    } else {
      engagement = new Engagement({
        student: studentId,
        course: courseId,
        logins: 1,
      });
    }
    await engagement.save();
  }

  async trackTimeSpent(studentId, courseId, duration) {
    let engagement = await Engagement.findOne({
      student: studentId,
      course: courseId,
    });
    if (engagement) {
      engagement.timeSpent += duration;
    } else {
      engagement = new Engagement({
        student: studentId,
        course: courseId,
        timeSpent: duration,
      });
    }
    await engagement.save();
  }

  async trackParticipation(studentId, courseId) {
    let engagement = await Engagement.findOne({
      student: studentId,
      course: courseId,
    });
    if (engagement) {
      engagement.participation += 1;
    } else {
      engagement = new Engagement({
        student: studentId,
        course: courseId,
        participation: 1,
      });
    }
    await engagement.save();
  }

  async trackQuizCompletion(studentId, courseId) {
    let engagement = await Engagement.findOne({
      student: studentId,
      course: courseId,
    });
    if (engagement) {
      engagement.quizzesCompleted += 1;
    } else {
      engagement = new Engagement({
        student: studentId,
        course: courseId,
        quizzesCompleted: 1,
      });
    }
    await engagement.save();
  }

  async getCourseEngagementScores(courseId) {
    const engagements = await Engagement.find({ course: courseId });

    const totalEngagementScore = engagements.reduce((acc, engagement) => {
      const engagementScore = this.calculateEngagementScore(
        engagement.logins,
        engagement.timeSpent,
        engagement.participation,
        engagement.quizzesCompleted
      );
      return acc + engagementScore;
    }, 0);

    const averageEngagementScore = totalEngagementScore / engagements.length;
    return averageEngagementScore;
  }

  calculateEngagementScore(logins, timeSpent, participation, quizzesCompleted) {
    return (
      logins * 0.25 +
      timeSpent * 0.25 +
      participation * 0.25 +
      quizzesCompleted * 0.25
    );
  }
}

export default new EngagementService();
