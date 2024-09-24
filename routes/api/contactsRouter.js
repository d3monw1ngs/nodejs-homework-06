import express from 'express';
import { getAllContacts, getContactById, addContact, deleteContactById, updateContactById, updateStatusContact } from '../../controllers/contactControllers.js';

const router = express.Router();

// PATCH: update the 'favorite' status of a contact
router.patch('/contacts/:contactId/favorite', updateStatusContact);

// GET: this is to get all contacts
router.get('/', getAllContacts);

// GET: Get a contact by ID
router.get('/:contactId', getContactById);

// POST: Add a new contact
router.post('/', addContact);

// DELETE: Delete a contact by ID
router.delete('/:contactId', deleteContactById);

// PUT: Update a contact by ID
router.put('/:contactId', updateContactById);

export { router };
