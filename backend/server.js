const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const logger = require('./config/logger'); // Winston Logger importieren
const { Pool } = require('pg'); // pg importieren

const app = express();
const port = process.env.PORT || 3000;

// --- Database Connection Pool ---
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

const pool = new Pool(dbConfig);

pool.on('connect', () => {
  logger.info('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client in PostgreSQL pool', { error: err.message, stack: err.stack });
  // Optional: process.exit(-1) oder andere Fehlerbehandlung, wenn die DB-Verbindung kritisch ist
});

// Test query to ensure connection is working
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Error connecting to PostgreSQL or executing test query:', { error: err.message, stack: err.stack });
  } else {
    logger.info(`PostgreSQL connected: Test query result: ${res.rows[0].now}`);
  }
});

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

app.use(cors());
app.use(express.json());

// --- Health Check Endpoint ---
app.get('/health', (req, res) => {
  logger.info('GET /health - Health check successful');
  res.status(200).json({ status: 'UP' });
});

// --- API Endpoints ---
// GET all notes
app.get('/api/notes', async (req, res, next) => {
  logger.info('GET /api/notes - Request received');
  try {
    const result = await pool.query('SELECT id, text_content AS text, created_at, updated_at FROM notes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    logger.error('Error fetching notes from DB', { error: err.message, stack: err.stack });
    next(err); // An den zentralen Fehlerhandler weiterleiten
  }
});

// POST a new note
app.post('/api/notes', async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    logger.warn('POST /api/notes - Bad Request: Note text is required');
    return res.status(400).json({ error: 'Note text is required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO notes (text_content) VALUES ($1) RETURNING id, text_content AS text, created_at, updated_at',
      [text]
    );
    const newNote = result.rows[0];
    logger.info(`POST /api/notes - Added new note:`, { noteId: newNote.id });
    res.status(201).json(newNote);
  } catch (err) {
    logger.error('Error adding note to DB', { error: err.message, stack: err.stack });
    next(err);
  }
});

// PUT (update) an existing note by id
app.put('/api/notes/:id', async (req, res, next) => {
  const idToUpdate = parseInt(req.params.id, 10);
  const { text } = req.body;

  if (isNaN(idToUpdate)) {
    logger.warn(`PUT /api/notes/${req.params.id} - Invalid ID format`);
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  if (!text) {
    logger.warn(`PUT /api/notes/${idToUpdate} - Bad Request: Note text is required for update`);
    return res.status(400).json({ error: 'Note text is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE notes SET text_content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, text_content AS text, created_at, updated_at',
      [text, idToUpdate]
    );

    if (result.rowCount > 0) {
      const updatedNote = result.rows[0];
      logger.info(`PUT /api/notes/${idToUpdate} - Note updated successfully`, { noteId: updatedNote.id });
      res.json(updatedNote);
    } else {
      logger.warn(`PUT /api/notes/${idToUpdate} - Note not found for update`);
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    logger.error(`Error updating note ${idToUpdate} in DB`, { error: err.message, stack: err.stack });
    next(err);
  }
});

// DELETE a note by id
app.delete('/api/notes/:id', async (req, res, next) => {
  const idToDelete = parseInt(req.params.id, 10);
  if (isNaN(idToDelete)) {
    logger.warn(`DELETE /api/notes/${req.params.id} - Invalid ID format`);
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING id', [idToDelete]);
    if (result.rowCount > 0) {
      logger.info(`DELETE /api/notes/${idToDelete} - Note deleted successfully`);
      res.status(204).send();
    } else {
      logger.warn(`DELETE /api/notes/${idToDelete} - Note not found`);
      res.status(404).json({ error: 'Note not found' });
    }
  } catch (err) {
    logger.error('Error deleting note from DB', { error: err.message, stack: err.stack });
    next(err);
  }
});

// --- Central Error Handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

// --- Server Start ---
app.listen(port, () => {
  logger.info(`Backend server listening on port ${port}`);
});