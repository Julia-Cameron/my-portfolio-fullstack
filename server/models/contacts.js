import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    firstname: { type: String },
    lastname: { type: String },
    name: { type: String, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, maxlength: 254 },
    message: { type: String, trim: true, maxlength: 5000 }
});

export default mongoose.model('Contact', contactSchema, 'contacts');