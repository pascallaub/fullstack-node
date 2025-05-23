const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const logger = require("./config/logger"); // Winston Logger importieren
const { Pool } = require("pg"); // pg importieren

const app = express();
const port = process.env.PORT || 3000;

// --- Database Connection Pool ---
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
};

const pool = new Pool(dbConfig);

pool.on("connect", () => {
  logger.info("Successfully connected to the PostgreSQL database.");
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle client in PostgreSQL pool", {
    error: err.message,
    stack: err.stack,
  });
  // Optional: process.exit(-1) oder andere Fehlerbehandlung, wenn die DB-Verbindung kritisch ist
});

// Test query to ensure connection is working
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    logger.error("Error connecting to PostgreSQL or executing test query:", {
      error: err.message,
      stack: err.stack,
    });
  } else {
    logger.info(`PostgreSQL connected: Test query result: ${res.rows[0].now}`);
  }
});

// --- Log Database Environment Variables on startup ---
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD_EXISTS = process.env.DB_PASSWORD ? "[REDACTED]" : "NOT SET"; // Passwort redigieren

logger.info("Attempting to load Database Configuration...");
if (DB_HOST && DB_PORT && DB_USER && DB_NAME) {
  logger.info("Database Configuration Loaded from Environment Variables:");
  logger.info(`DB_HOST: ${DB_HOST}`);
  logger.info(`DB_PORT: ${DB_PORT}`);
  logger.info(`DB_USER: ${DB_USER}`);
  logger.info(`DB_NAME: ${DB_NAME}`);
  logger.info(`DB_PASSWORD: ${DB_PASSWORD_EXISTS}`);
} else {
  logger.warn(
    "Database configuration environment variables are not fully set or not found. Ensure DB_HOST, DB_PORT, DB_USER, DB_NAME are defined."
  );
}
// --- End Database Environment Variables Logging ---

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(
    `Request received: ${req.method} ${req.originalUrl} (Path: ${req.path})`
  );
  next();
});

// --- Health Check Endpoint ---
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    logger.info("Health check passed");
    res.status(200).json({ status: "UP", database: "connected" });
  } catch (dbError) {
    logger.error("Health check failed", {
      error: dbError.message,
      stack: dbError.stack,
    });
    res.status(500).json({
      status: "DOWN",
      database: "not connected",
      error: dbError.message,
    });
  }
});

// --- API Endpoints ---
// GET all notes (with filtering, searching, and sorting)
app.get("/api/notes", async (req, res, next) => {
  logger.info("GET /api/notes - Fetching notes with query params:", req.query);
  try {
    let query = "SELECT id, text_content AS text, is_done, created_at, updated_at FROM notes";
    const queryParams = [];
    let paramIndex = 1;
    const whereClauses = [];

    // Search
    if (req.query.search) {
      whereClauses.push(`text_content ILIKE $${paramIndex++}`);
      queryParams.push(`%${req.query.search}%`);
    }

    // Filter by status
    if (req.query.status) {
      if (req.query.status === "done") {
        whereClauses.push(`is_done = TRUE`);
      } else if (req.query.status === "open") {
        whereClauses.push(`is_done = FALSE`);
      }
      // 'all' needs no specific clause for is_done unless combined with other filters
    }

    if (whereClauses.length > 0) {
      query += " WHERE " + whereClauses.join(" AND ");
    }

    // Sorting
    const sortBy = req.query.sortBy || "created_at";
    const sortOrder = req.query.sortOrder === "asc" ? "ASC" : "DESC"; // Default to DESC

    // Whitelist sortBy columns to prevent SQL injection
    const validSortColumns = ["created_at", "updated_at", "text_content", "is_done"];
    if (validSortColumns.includes(sortBy)) {
      query += ` ORDER BY ${sortBy} ${sortOrder}`;
    } else {
      query += ` ORDER BY created_at ${sortOrder}`; // Default sort
    }
    
    logger.info(`Executing query: ${query} with params: ${JSON.stringify(queryParams)}`);
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    logger.error("Error fetching notes from DB", {
      error: err.message,
      stack: err.stack,
      query: req.query
    });
    next(err);
  }
});

// POST a new note
app.post("/api/notes", async (req, res, next) => {
  const { text } = req.body;
  if (!text) {
    logger.warn("POST /api/notes - Bad Request: Note text is required");
    return res.status(400).json({ error: "Note text is required" });
  }
  try {
    // is_done defaults to FALSE in the DB
    const result = await pool.query(
      "INSERT INTO notes (text_content) VALUES ($1) RETURNING id, text_content AS text, is_done, created_at, updated_at",
      [text]
    );
    const newNote = result.rows[0];
    logger.info(`POST /api/notes - Added new note:`, { noteId: newNote.id });
    res.status(201).json(newNote);
  } catch (err) {
    logger.error("Error adding note to DB", {
      error: err.message,
      stack: err.stack,
    });
    next(err);
  }
});

// PUT (update) an existing note by id
app.put("/api/notes/:id", async (req, res, next) => {
  const idToUpdate = parseInt(req.params.id, 10);
  const { text, is_done } = req.body;

  if (isNaN(idToUpdate)) {
    logger.warn(`PUT /api/notes/${req.params.id} - Invalid ID format`);
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (typeof text === 'undefined' && typeof is_done === 'undefined') {
    logger.warn(`PUT /api/notes/${idToUpdate} - Bad Request: text or is_done is required for update`);
    return res.status(400).json({ error: "Either text or is_done must be provided for update" });
  }
  
  try {
    let updateQuery = "UPDATE notes SET ";
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    if (typeof text !== 'undefined') {
      updateFields.push(`text_content = $${paramIndex++}`);
      queryParams.push(text);
    }
    if (typeof is_done === 'boolean') {
      updateFields.push(`is_done = $${paramIndex++}`);
      queryParams.push(is_done);
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateQuery += updateFields.join(", ") + ` WHERE id = $${paramIndex++} RETURNING id, text_content AS text, is_done, created_at, updated_at`;
    queryParams.push(idToUpdate);

    const result = await pool.query(updateQuery, queryParams);

    if (result.rowCount > 0) {
      const updatedNote = result.rows[0];
      logger.info(`PUT /api/notes/${idToUpdate} - Note updated successfully`, {
        noteId: updatedNote.id,
      });
      res.json(updatedNote);
    } else {
      logger.warn(`PUT /api/notes/${idToUpdate} - Note not found for update`);
      res.status(404).json({ error: "Note not found" });
    }
  } catch (err) {
    logger.error(`Error updating note ${idToUpdate} in DB`, {
      error: err.message,
      stack: err.stack,
    });
    next(err);
  }
});

// DELETE a note by id
app.delete("/api/notes/:id", async (req, res, next) => {
  const idToDelete = parseInt(req.params.id, 10);
  if (isNaN(idToDelete)) {
    logger.warn(`DELETE /api/notes/${req.params.id} - Invalid ID format`);
    return res.status(400).json({ error: "Invalid ID format" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 RETURNING id",
      [idToDelete]
    );
    if (result.rowCount > 0) {
      logger.info(
        `DELETE /api/notes/${idToDelete} - Note deleted successfully`
      );
      res.status(204).send();
    } else {
      logger.warn(`DELETE /api/notes/${idToDelete} - Note not found`);
      res.status(404).json({ error: "Note not found" });
    }
  } catch (err) {
    logger.error("Error deleting note from DB", {
      error: err.message,
      stack: err.stack,
    });
    next(err);
  }
});

// --- Central Error Handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res.status(500).json({ error: "Internal Server Error" });
});

// --- Server Start ---
app.listen(port, () => {
  logger.info(`Backend server listening on port ${port}`);
});
