import mongoose from 'mongoose';

const qualificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    completion: { type: Date },
    isOngoing: { type: Boolean },
    description: { type: String },
    studyPeriod: { type: String },
    institution: { type: String },
    academicStanding: { type: String },
    relevantCourses: { type: String },
    extracurricularActivities: { type: String },
    link: { type: String },
    sourceKey: { type: String }
});

export default mongoose.model('Qualification', qualificationSchema, 'qualifications');