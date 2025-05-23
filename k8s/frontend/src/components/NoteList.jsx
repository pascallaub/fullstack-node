import { useState } from 'react';
import EditNoteForm from './EditNoteForm';

function NoteList({ notes, onDelete, onUpdate }) {
  const [editingNoteId, setEditingNoteId] = useState(null);

  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
  };

  const handleSaveNote = (id, updatedText) => {
    onUpdate(id, { text: updatedText }); // Nur Text aktualisieren
    setEditingNoteId(null);
  };

  const toggleDoneStatus = (note) => {
    onUpdate(note.id, { is_done: !note.is_done });
  };

  if (!notes || notes.length === 0) {
    return <p>Keine Notizen vorhanden oder Filter/Suche ergab keine Treffer.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {notes.map(note => (
        <li key={note.id} style={{
          marginBottom: '0.5rem',
          borderBottom: '1px solid #ccc',
          paddingBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          // Beispiel für durchgestrichenen Text, wenn erledigt
          textDecoration: note.is_done ? 'line-through' : 'none',
          opacity: note.is_done ? 0.7 : 1,
        }}>
          <input
            type="checkbox"
            checked={note.is_done || false}
            onChange={() => toggleDoneStatus(note)}
            style={{ marginRight: '1rem', transform: 'scale(1.2)' }}
          />
          <div style={{ flexGrow: 1 }}>
            {editingNoteId === note.id ? (
              <EditNoteForm
                note={note}
                onSave={handleSaveNote}
                onCancel={handleCancelEdit}
              />
            ) : (
              <span style={{ flexGrow: 1, marginRight: '1rem' }}>{note.text}</span>
            )}
          </div>
          {editingNoteId !== note.id && (
             <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleEditClick(note)}
                style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
              >
                Bearbeiten
              </button>
              <button
                onClick={() => onDelete(note.id)}
                style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
              >
                Löschen
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default NoteList;
