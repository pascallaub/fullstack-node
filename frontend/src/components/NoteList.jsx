function NoteList({ notes, onDelete }) {
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {notes.map(note => (
          <li key={note.id} style={{ marginBottom: '0.5rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
            {note.text}
            <button
              onClick={() => onDelete(note.id)}
              style={{ marginLeft: '1rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
            >
              Löschen
            </button>
          </li>
        ))}
      </ul>
    );
  }
  
  export default NoteList;
  