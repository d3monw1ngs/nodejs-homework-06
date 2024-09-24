const fs = require('fs/promises');
const path = require('path');

const contactsPath = path.join(__dirname, 'contacts.json');

// Lists all contacts
const listContacts = async () => {
  try {
    const data = await fs.readFile(contactsPath, 'utf8');
    const contacts = JSON.parse(data);
    return contacts;
  } catch (error) {
    console.error("Could not read contacts", error);
  }
};

// Retrieves a contact by its ID
const getContactById = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contact = contacts.find(contact => contact.id === contactId);
    return contact || null;
  } catch (error) {
    console.error(`Could not find contact with id ${contactId}`, error);
  }
};

// Removes a contact by its ID
const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
    return updatedContacts;
  } catch (error) {
    console.error(`Could not remove contact with id ${contactId}`, error);
  }
};

// Adds new contact
const addContact = async (body) => {
  try {
    const contacts = await listContacts();
    const { nanoid } = await import('nanoid');
    const newContact = { id: nanoid(), ...body };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return newContact;
  } catch (error) {
    console.error("Could not add contact", error);
  }
};

// Updates an existing contact
const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts();
    const index = contacts.findIndex(contact => contact.id === contactId);
    if (index === -1) return null;
    contacts[index] = { ...contacts[index], ...body };
    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
    return contacts[index];
  } catch (error) {
    console.error(`Could not update contact with id ${contactId}`, error);
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
