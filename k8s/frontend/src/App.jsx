import { useState, useEffect, useCallback } from "react";
import NoteInput from "./components/NoteInput";
import NoteList from "./components/NoteList";

const API_URL = import.meta.env.VITE_API_URL || "/api";

console.log("API URL used by Frontend:", API_URL);

function App() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'open', 'done'
  const [sortCriteria, setSortCriteria] = useState({
    field: "created_at",
    order: "desc",
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const fetchNotes = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }
      if (filterStatus !== "all") {
        queryParams.append("status", filterStatus);
      }
      queryParams.append("sortBy", sortCriteria.field);
      queryParams.append("sortOrder", sortCriteria.order);

      const url = `${API_URL}/notes?${queryParams.toString()}`;
      console.log(`Fetching notes from ${url}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotes(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch notes:", e);
      setError(
        `Failed to load notes: ${e.message}. Is the backend accessible via the proxy at ${API_URL}?`
      );
      setNotes([]);
    }
  }, [searchTerm, filterStatus, sortCriteria]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (text) => {
    try {
      console.log(`Adding note to ${API_URL}/notes`);
      const response = await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchNotes(); // Reload notes to apply current sort/filter
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
        method: "DELETE",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchNotes(); // Reload notes
      setError(null);
    } catch (e) {
      console.error("Failed to delete note:", e);
      setError(`Failed to delete note: ${e.message}`);
    }
  };

  const handleUpdateNote = async (id, updatedData) => {
    // updatedData can be { text } or { is_done } or both
    try {
      console.log(
        `Updating note ${id} at ${API_URL}/notes/${id} with data:`,
        updatedData
      );
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: `HTTP error! status: ${response.status}` }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      fetchNotes(); // Reload notes
      setError(null);
    } catch (e) {
      console.error("Failed to update note:", e);
      setError(`Failed to update note: ${e.message}`);
    }
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchNotes();
    }, 500); // Fetch notes 500ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchNotes]);

  return (
    <div
      style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}
      className={darkMode ? "dark-theme-container" : ""}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Mini Notizblock</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ padding: "0.5rem" }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <NoteInput onAdd={addNote} />

      <div
        style={{
          margin: "1rem 0",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Notizen durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "0.5rem", flexGrow: 1 }}
        />
      </div>

      <div
        style={{
          margin: "1rem 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <span>Filtern: </span>
          {["all", "open", "done"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: "0.5rem",
                marginLeft: "0.5rem",
                fontWeight: filterStatus === status ? "bold" : "normal",
                backgroundColor:
                  filterStatus === status
                    ? darkMode
                      ? "#555"
                      : "#ddd"
                    : darkMode
                    ? "#333"
                    : "#f0f0f0",
                color: darkMode ? "#fff" : "#000",
                border: darkMode ? "1px solid #555" : "1px solid #ccc",
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div>
          <span>Sortieren: </span>
          <select
            value={sortCriteria.field + "_" + sortCriteria.order}
            onChange={(e) => {
              const [field, order] = e.target.value.split("_");
              setSortCriteria({ field, order });
            }}
            style={{
              padding: "0.5rem",
              marginLeft: "0.5rem",
              backgroundColor: darkMode ? "#333" : "#fff",
              color: darkMode ? "#fff" : "#000",
            }}
          >
            <option value="created_at_desc">Neueste zuerst</option>
            <option value="created_at_asc">Älteste zuerst</option>
            <option value="text_asc">Text (A-Z)</option>
            <option value="text_desc">Text (Z-A)</option>
            {/* Add more sort options if needed, e.g., by updated_at */}
          </select>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <NoteList
        notes={notes}
        onDelete={deleteNote}
        onUpdate={handleUpdateNote}
      />
    </div>
  );
}

export default App;
