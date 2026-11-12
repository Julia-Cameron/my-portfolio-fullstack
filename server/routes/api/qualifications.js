import express from 'express';
import { getQualifications, getQualificationById, createQualification, updateQualification, deleteQualification, deleteAllQualifications } from '../../controllers/qualifications.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Get all qualifications
router.get('/', getQualifications);

// Get a qualification by ID
router.get('/:id', getQualificationById);

// Create a new qualification
router.post('/', authenticate, requireAdmin, createQualification);

// Update a qualification by ID
router.put('/:id', authenticate, requireAdmin, updateQualification);

// Delete a qualification by ID
router.delete('/:id', authenticate, requireAdmin, deleteQualification);

// Delete all qualifications
router.delete('/', authenticate, requireAdmin, deleteAllQualifications);

export default router;  
