import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    sourceKey: { type: String }
});

export default mongoose.model('Service', serviceSchema, 'services');
