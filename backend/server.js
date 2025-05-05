const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// In-memory storage for notes (replace with a database in a real application)
let notes = [
    { id: 1, text: 'Backend Note 1' },
    { id: 2, text: 'Backend Note 2' }
];
let nextId = 3;

app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse JSON bodies

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
  console.log('POST /api/notes - Added:', newNote);
  res.status(201).json(newNote);
});

// DELETE a note by id
app.delete('/api/notes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const initialLength = notes.length;
  notes = notes.filter(note => note.id !== id);
  if (notes.length < initialLength) {
    console.log(`DELETE /api/notes/${id} - Deleted`);
    res.status(204).send(); // No Content
  } else {
    console.log(`DELETE /api/notes/${id} - Not Found`);
    res.status(404).json({ error: 'Note not found' });
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});