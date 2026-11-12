import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    completion: { type: Date },
    description: { type: String },
    role: { type: String },
    outcome: { type: String },
    behindTheScenes: { type: String },
    tech: { type: [String], default: undefined },
    link: { type: String },
    imageKey: { type: String },
    sourceKey: { type: String }
});

export default mongoose.model('Project', projectSchema, 'projects');