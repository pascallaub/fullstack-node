import { useState, useEffect } from 'react';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';

// Read the API URL from environment variables provided during build time
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; // Fallback for local dev

function App() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null); // State for handling errors

  // Fetch notes from backend on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        console.log(`Fetching notes from ${API_URL}/notes`);
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNotes(data);
        setError(null); // Clear previous errors
      } catch (e) {
        console.error("Failed to fetch notes:", e);
        setError(`Failed to load notes: ${e.message}. Is the backend running at ${API_URL}?`);
        setNotes([]); // Clear notes on error
      }
    };

    fetchNotes();
  }, []); // Empty dependency array means this runs once on mount

  const addNote = async (text) => {
    try {
      console.log(`Adding note to ${API_URL}/notes`);
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const newNote = await response.json();
      setNotes(prevNotes => [...prevNotes, newNote]);
      setError(null);
    } catch (e) {
      console.error("Failed to add note:", e);
      setError(`Failed to add note: ${e.message}`);
    }
  };

  const deleteNote = async (id) => {
    try {
      console.log(`Deleting note ${id} from ${API_URL}/notes/${id}`);
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 204) { // 204 No Content is a success
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      setError(null);
    } catch (e) {
      console.error("Failed to delete note:", e);
      setError(`Failed to delete note: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Mini-Notizblock (Full-Stack)</h1>
      <NoteInput onAdd={addNote} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <NoteList notes={notes} onDelete={deleteNote} />
    </div>
  );
}

export default App;
