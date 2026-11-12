import express from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject, deleteAllProjects } from '../../controllers/projects.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Get all projects
router.get('/', getProjects);

// Get a project by ID
router.get('/:id', getProjectById);

// Create a new project
router.post('/', authenticate, requireAdmin, createProject);

// Update a project by ID
router.put('/:id', authenticate, requireAdmin, updateProject);

// Delete a project by ID
router.delete('/:id', authenticate, requireAdmin, deleteProject);

// Delete all projects
router.delete('/', authenticate, requireAdmin, deleteAllProjects);

export default router;  