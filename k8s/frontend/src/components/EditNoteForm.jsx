import { useState, useEffect } from 'react';

function EditNoteForm({ note, onSave, onCancel }) {
  const [editText, setEditText] = useState('');

  // Wenn sich die 'note'-Prop ändert (z.B. wenn eine andere Notiz zum Bearbeiten ausgewählt wird),
  // aktualisiere den editText State.
  useEffect(() => {
    if (note) {
      setEditText(note.text);
    }
  }, [note]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim()) {
      alert('Notiztext darf nicht leer sein.');
      return;
    }
    // onSave erwartet jetzt die ID und den Text
    onSave(note.id, editText); // Hier wird nur der Text übergeben
  };

  if (!note) {
    return null; // Rendere nichts, wenn keine Notiz zum Bearbeiten übergeben wurde
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        style={{ flexGrow: 1, marginRight: '0.5rem', padding: '0.3rem', minHeight: '30px' }}
        rows="2"
      />
      <button
        type="submit"
        style={{ marginRight: '0.5rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
      >
        Speichern
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
      >
        Abbrechen
      </button>
    </form>
  );
}

export default EditNoteForm;