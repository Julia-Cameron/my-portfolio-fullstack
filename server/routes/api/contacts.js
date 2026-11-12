import express from 'express';
import {
    getContacts,
    getContactById,
    createContact,
    updateContact,
    deleteContact,
    deleteAllContacts
} from '../../controllers/contacts.controller.js';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, requireAdmin, getContacts);
router.get('/:id', authenticate, requireAdmin, getContactById);
router.post('/', createContact);
router.put('/:id', authenticate, requireAdmin, updateContact);
router.delete('/:id', authenticate, requireAdmin, deleteContact);
router.delete('/', authenticate, requireAdmin, deleteAllContacts);

export default router;