import { useState } from 'react';
import EditNoteForm from './EditNoteForm'; // Importiere die neue Komponente

function NoteList({ notes, onDelete, onUpdate }) { // Füge onUpdate als Prop hinzu
  const [editingNoteId, setEditingNoteId] = useState(null);

  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
  };

  const handleSaveNote = (id, updatedText) => {
    onUpdate(id, updatedText); // Rufe die von App.jsx übergebene Update-Funktion auf
    setEditingNoteId(null); // Beende den Bearbeitungsmodus
  };

  if (!notes || notes.length === 0) {
    return <p>Keine Notizen vorhanden.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {notes.map(note => (
        <li key={note.id} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
          {editingNoteId === note.id ? (
            <EditNoteForm
              note={note}
              onSave={handleSaveNote}
              onCancel={handleCancelEdit}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ flexGrow: 1, marginRight: '1rem' }}>{note.text}</span>
              <div>
                <button
                  onClick={() => handleEditClick(note)}
                  style={{ marginRight: '0.5rem', backgroundColor: '#3498db', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
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
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default NoteList;
