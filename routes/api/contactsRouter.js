import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { getAllContacts, getContactById, addContact, deleteContactById, updateContactById, updateStatusContact } from '../../controllers/contactControllers.js';

const router = express.Router();

// PATCH: update the 'favorite' status of a contact
router.patch('/contacts/:contactId/favorite', authMiddleware, updateStatusContact);

// GET: this is to get all contacts
router.get('/', authMiddleware, getAllContacts);

// GET: Get a contact by ID
router.get('/:contactId', authMiddleware, getContactById);

// POST: Add a new contact
router.post('/', authMiddleware, addContact);

// DELETE: Delete a contact by ID
router.delete('/:contactId', authMiddleware, deleteContactById);

// PUT: Update a contact by ID
router.put('/:contactId', authMiddleware, updateContactById);

export { router };
