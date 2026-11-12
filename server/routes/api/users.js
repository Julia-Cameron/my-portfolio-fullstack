import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser, deleteAllUsers } from '../../controllers/users.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

// Get all users
router.get('/', getUsers);

// Get a user by ID
router.get('/:id', getUserById);

// Create a new user
router.post('/', createUser);

// Update a user by ID
router.put('/:id', updateUser);

// Delete a user by ID
router.delete('/:id', deleteUser);

// Delete all users
router.delete('/', deleteAllUsers);

export default router;  