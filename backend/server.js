const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const logger = require('./config/logger'); // Winston Logger importieren

const app = express();
const port = process.env.PORT || 3000;

// --- Log Database Environment Variables on startup ---
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD_EXISTS = process.env.DB_PASSWORD ? '[REDACTED]' : 'NOT SET'; // Passwort redigieren

logger.info('Attempting to load Database Configuration...');
if (DB_HOST && DB_PORT && DB_USER && DB_NAME) {
    logger.info('Database Configuration Loaded from Environment Variables:');
    logger.info(`DB_HOST: ${DB_HOST}`);
    logger.info(`DB_PORT: ${DB_PORT}`);
    logger.info(`DB_USER: ${DB_USER}`);
    logger.info(`DB_NAME: ${DB_NAME}`);
    logger.info(`DB_PASSWORD: ${DB_PASSWORD_EXISTS}`);
} else {
    logger.warn('Database configuration environment variables are not fully set or not found. Ensure DB_HOST, DB_PORT, DB_USER, DB_NAME are defined.');
}
// --- End Database Environment Variables Logging ---


// Define the data directory and the data file path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes-data.json');

// Helper function to ensure data directory exists
const ensureDataDirExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      logger.info(`Created data directory at ${DATA_DIR}`);
    } catch (error) {
      logger.error('Error creating data directory:', { error: error.message, stack: error.stack });
      // Depending on the desired robustness, you might want to throw the error or handle it.
    }
  }
};

// Helper function to read data from file
const readDataFromFile = () => {
  ensureDataDirExists(); // Ensure directory exists before trying to read
  try {
    if (fs.existsSync(DATA_FILE)) {
      const jsonData = fs.readFileSync(DATA_FILE);
      return JSON.parse(jsonData);
    }
  } catch (error) {
    logger.error('Error reading data file:', { error: error.message, stack: error.stack });
  }
  // If file doesn't exist or there's an error, return default structure
  logger.info(`Data file not found or unreadable at ${DATA_FILE}, returning default structure.`);
  return { notes: [], nextId: 1 };
};

// Helper function to write data to file
const writeDataToFile = (data) => {
  ensureDataDirExists(); // Ensure directory exists before trying to write
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); // null, 2 for pretty printing
    logger.debug('Data written to file successfully.');
  } catch (error) {
    logger.error('Error writing data file:', { error: error.message, stack: error.stack });
  }
};

// Initialize notes and nextId from file
let { notes, nextId } = readDataFromFile();

app.use(cors());
app.use(express.json());

// --- API Endpoints ---
// GET all notes
app.get('/api/notes', (req, res) => {
  logger.info('GET /api/notes - Request received');
  res.json(notes);
});

// POST a new note
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  if (!text) {
    logger.warn('POST /api/notes - Bad Request: Note text is required');
    return res.status(400).json({ error: 'Note text is required' });
  }
  const newNote = { id: nextId++, text };
  notes.push(newNote);
  writeDataToFile({ notes, nextId });
  logger.info(`POST /api/notes - Added new note:`, { noteId: newNote.id });
  res.status(201).json(newNote);
});

// DELETE a note by id
app.delete('/api/notes/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);
  const initialLength = notes.length;
  notes = notes.filter(note => note.id !== idToDelete);

  if (notes.length < initialLength) {
    writeDataToFile({ notes, nextId });
    logger.info(`DELETE /api/notes/${idToDelete} - Note deleted successfully`);
    res.status(204).send();
  } else {
    logger.warn(`DELETE /api/notes/${idToDelete} - Note not found`);
    res.status(404).json({ error: 'Note not found' });
  }
});

// --- Server Start ---
app.listen(port, () => {
  logger.info(`Backend server listening on port ${port}`);
  // Ensure data file exists on startup or create it with initial empty data
  // The readDataFromFile and writeDataToFile will handle directory creation
  // but we can explicitly ensure the file is initialized if it doesn't exist after reading.
  if (!fs.existsSync(DATA_FILE)) {
    logger.info(`Data file not found at ${DATA_FILE}, initializing with empty data.`);
    writeDataToFile({ notes: [], nextId: 1 }); // This will also create the directory if needed
  }
});