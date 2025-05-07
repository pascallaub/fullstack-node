import { useState, useEffect } from 'react';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';

// API URL ist jetzt relativ, da Nginx als Proxy dient.
// Der Build-Arg VITE_API_URL im Dockerfile wird dies setzen.
const API_URL = import.meta.env.VITE_API_URL || '/api'; // Fallback für lokale Entwicklung ohne Proxy

console.log("API URL used by Frontend:", API_URL);

function App() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        // Der Pfad wird jetzt relativ zur Domain sein, z.B. http://localhost:8080/api/notes
        console.log(`Fetching notes from ${API_URL}/notes`);
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNotes(data);
        setError(null);
      } catch (e) {
        console.error("Failed to fetch notes:", e);
        setError(`Failed to load notes: ${e.message}. Is the backend accessible via the proxy at ${API_URL}?`);
        setNotes([]);
      }
    };

    fetchNotes();
  }, []);

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
      if (!response.ok && response.status !== 204) {
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
      <h1>Mini-Notizblock (Full-Stack mit Proxy)</h1>
      <NoteInput onAdd={addNote} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <NoteList notes={notes} onDelete={deleteNote} />
    </div>
  );
}

export default App;
