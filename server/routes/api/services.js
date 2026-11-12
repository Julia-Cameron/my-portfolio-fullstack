import express from 'express';
import { getServices, getServiceById, createService, updateService, deleteService, deleteAllServices } from '../../controllers/services.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authenticate, requireAdmin, createService);
router.put('/:id', authenticate, requireAdmin, updateService);
router.delete('/:id', authenticate, requireAdmin, deleteService);
router.delete('/', authenticate, requireAdmin, deleteAllServices);

export default router;
