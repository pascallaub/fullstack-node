const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Define the data directory and the data file path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes-data.json');

// Helper function to ensure data directory exists
const ensureDataDirExists = () => {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`Created data directory at ${DATA_DIR}`);
    } catch (error) {
      console.error('Error creating data directory:', error);
      // If directory creation fails, we might not be able to proceed with file operations.
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
    console.error('Error reading data file:', error);
  }
  // If file doesn't exist or there's an error, return default structure
  return { notes: [], nextId: 1 };
};

// Helper function to write data to file
const writeDataToFile = (data) => {
  ensureDataDirExists(); // Ensure directory exists before trying to write
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); // null, 2 for pretty printing
  } catch (error) {
    console.error('Error writing data file:', error);
  }
};

// Initialize notes and nextId from file
let { notes, nextId } = readDataFromFile();

app.use(cors());
app.use(express.json());

// --- API Endpoints ---
// GET all notes
app.get('/api/notes', (req, res) => {
  console.log('GET /api/notes');
  res.json(notes);
});

// POST a new note
app.post('/api/notes', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Note text is required' });
  }
  const newNote = { id: nextId++, text };
  notes.push(newNote);
  writeDataToFile({ notes, nextId });
  console.log('POST /api/notes - Added:', newNote);
  res.status(201).json(newNote);
});

// DELETE a note by id
app.delete('/api/notes/:id', (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);
  const initialLength = notes.length;
  notes = notes.filter(note => note.id !== idToDelete);

  if (notes.length < initialLength) {
    writeDataToFile({ notes, nextId });
    console.log(`DELETE /api/notes/${idToDelete} - Deleted`);
    res.status(204).send();
  } else {
    console.log(`DELETE /api/notes/${idToDelete} - Not Found`);
    res.status(404).json({ error: 'Note not found' });
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
  // Ensure data file exists on startup or create it with initial empty data
  // The readDataFromFile and writeDataToFile will handle directory creation
  // but we can explicitly ensure the file is initialized if it doesn't exist after reading.
  if (!fs.existsSync(DATA_FILE)) {
    console.log(`Data file not found at ${DATA_FILE}, initializing with empty data.`);
    writeDataToFile({ notes: [], nextId: 1 }); // This will also create the directory if needed
  }
});