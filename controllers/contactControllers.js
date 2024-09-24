import { Contact } from '../models/contactsModel.js';
import { contactValidation, favoriteValidation } from '../validations/validation.js';

const getAllContacts = async (_req, res) => {
    try {
      const result = await Contact.find(); // Retrieve all contacts from MongoDB
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const getContactById = async (req, res) => {
    const { contactId } = req.params;
    try {
      const result = await Contact.findById(contactId);
  
      if(!result) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

const addContact = async (req, res) => {
    // Validate the contact data
    const { error } = contactValidation.validate(req.body);

    if (error) {
      return res.status(400).json({ message: 'missing required field' });
    }
    try {
      const result = await Contact.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

const deleteContactById = async (req, res) => {
    const { contactId } = req.params;
    try {
      const result = await Contact.findByIdAndDelete(contactId);
      if (!result) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json({ message: 'Contact deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateContactById = async (req, res) => {
    // Validate the contact data
    const { error } = contactValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'missing fields' });
    }

    const {contactId} = req.params;

    try {
      const result = await Contact.findByIdAndUpdate(contactId, req.body, {
        new: true,
      });
      if (!result) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

const updateStatusContact = async (req, res) => {
    const { contactId } = req.params;
    const { favorite } =req.body;
     // Validate favorite field
  const { error } = favoriteValidation.validate({ favorite });
  if (error) {
    return res.status(400).json({ message: 'missing or invalid field favorite' });
  }
  try {
    const result = await Contact.findByIdAndUpdate(
      contactId,
      {favorite},
      {new: true}
    );

    if (!result) {
      return res.status(404).json({message: 'Not found'});
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

export { getAllContacts,
         getContactById,
         addContact,
         deleteContactById,
         updateContactById,
         updateStatusContact         
 };