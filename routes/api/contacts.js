const express = require('express');
const { contactSchema } = require('../../validation/contactsValidation');
const router = express.Router();
const contacts = require('../../models/contacts')

// List all contacts
router.get('/', async (req, res, next) => {
  try {
    const allContacts = await contacts.listContacts();
    res.json(allContacts);
  } catch (error) {
    next(error);
  }
});

// Get a contact by ID
router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await contacts.getContactById(req.params.contactId);
    if (contact) {
      res.json(contact);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Add a new contact
router.post('/', async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newContact = await contacts.addContact(req.body);
    res.status(201).json(newContact);   
  } catch (error) {
    next(error);
  }
});

// Remove a contact by ID
router.delete('/:contactId', async (req, res, next) => {
  try {
    const updatedContacts = await contacts.removeContact(req.params.contactId);
    res.json({ message: 'Contact removed', contacts: updatedContacts });
  } catch (error) {
    next(error);
  }
});

// Update a contact by ID
router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const updatedContact = await contacts.updateContact(req.params.contactId, req.body);
    if (updatedContact) {
      res.json(updatedContact);
    } else {
      res.status(404).json({ message: 'Contact not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
