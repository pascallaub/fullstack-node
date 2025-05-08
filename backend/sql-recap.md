# SQL Recap: Datenmodell und CRUD-Abfragen für Mini-Notizblock

Dieses Dokument beschreibt ein einfaches relationales Datenmodell für die Notizen-Anwendung und die dazugehörigen grundlegenden SQL-CRUD-Operationen.

## 1. Kontext

Die gewählte Datenstruktur sind die "Notizen" (Notes) aus dem Mini-Notizblock-Projekt.
Informationen, die zu einer einzelnen Notiz gespeichert werden sollen:
*   Eindeutige ID der Notiz
*   Der Textinhalt der Notiz
*   Ein Zeitstempel, wann die Notiz erstellt wurde
*   Ein Zeitstempel, wann die Notiz zuletzt aktualisiert wurde
*   (Optional) Eine Verknüpfung zu einem Benutzer, dem die Notiz gehört.

## 2. Datenmodell entwerfen (Schema)

Wir entwerfen zwei Tabellen: `users` für die Benutzer und `notes` für die Notizen, mit einer Fremdschlüsselbeziehung von `notes` zu `users`.

### Tabelle: `users`

*   **Name der Tabelle:** `users`
*   **Beschreibung:** Speichert Informationen über die Benutzer der Anwendung.

| Spaltenname | Datentyp        | Constraints / Hinweise                                  |
| :---------- | :-------------- | :------------------------------------------------------ |
| `user_id`   | `INTEGER`       | `PRIMARY KEY`, `AUTOINCREMENT` (oder `SERIAL` in PostgreSQL) |
| `username`  | `VARCHAR(255)`  | `NOT NULL`, `UNIQUE`                                    |
| `email`     | `VARCHAR(255)`  | `NOT NULL`, `UNIQUE`                                    |
| `created_at`| `TIMESTAMP`     | `DEFAULT CURRENT_TIMESTAMP`                             |

*   **Primärschlüssel (`user_id`):** Diese Spalte ist als Primärschlüssel geeignet, da sie für jeden Benutzer einen eindeutigen, numerischen Identifikator bereitstellt, der typischerweise von der Datenbank automatisch generiert und inkrementiert wird. Dies ermöglicht eine effiziente und eindeutige Referenzierung jeder Zeile.

### Tabelle: `notes`

*   **Name der Tabelle:** `notes`
*   **Beschreibung:** Speichert die einzelnen Notizen.

| Spaltenname     | Datentyp        | Constraints / Hinweise                                               |
| :-------------- | :-------------- | :------------------------------------------------------------------- |
| `note_id`       | `INTEGER`       | `PRIMARY KEY`, `AUTOINCREMENT` (oder `SERIAL` in PostgreSQL)          |
| `user_id_fk`    | `INTEGER`       | `NOT NULL`, `FOREIGN KEY` verweist auf `users(user_id)`              |
| `text_content`  | `TEXT`          | `NOT NULL` (oder `VARCHAR` mit ausreichender Länge)                   |
| `created_at`    | `TIMESTAMP`     | `DEFAULT CURRENT_TIMESTAMP`                                          |
| `updated_at`    | `TIMESTAMP`     | `DEFAULT CURRENT_TIMESTAMP` (oft mit `ON UPDATE CURRENT_TIMESTAMP` in MySQL, oder anwendungsseitig aktualisiert) |

*   **Primärschlüssel (`note_id`):** Ähnlich wie `user_id` ist `note_id` ein eindeutiger, automatisch generierter numerischer Identifikator für jede Notiz.
*   **Fremdschlüssel (`user_id_fk`):** Diese Spalte stellt die Beziehung zur `users`-Tabelle her. Jede Notiz gehört zu genau einem Benutzer. Das `NOT NULL` stellt sicher, dass jede Notiz einem Benutzer zugeordnet ist. Die `FOREIGN KEY`-Beschränkung sorgt für referentielle Integrität (d.h., es kann nur eine `user_id` eingetragen werden, die auch in der `users`-Tabelle existiert).

## 3. Grundlegende SQL-Abfragen formulieren (CRUD)

### Tabelle: `users`

**CREATE (Benutzer einfügen)**
```sql
INSERT INTO users (username, email)
VALUES ('beispiel_benutzer', 'benutzer@example.com');
```

**READ (Alle Benutzer abrufen)**
```sql
SELECT user_id, username, email, created_at
FROM users;
```

**READ (Einen Benutzer anhand seiner `user_id` abrufen)**
```sql
SELECT user_id, username, email, created_at
FROM users
WHERE user_id = 1; -- Platzhalter für die spezifische ID
```

**UPDATE (Benutzerdaten ändern)**
```sql
UPDATE users
SET email = 'neue_email@example.com', username = 'neuer_username'
WHERE user_id = 1; -- Platzhalter für die spezifische ID
```

**DELETE (Benutzer löschen)**
```sql
DELETE FROM users
WHERE user_id = 1; -- Platzhalter für die spezifische ID
-- Achtung: Löschen eines Benutzers kann kaskadierende Effekte auf Notizen haben,
-- je nach Definition der Fremdschlüssel-Constraints (z.B. ON DELETE CASCADE).
```

### Tabelle: `notes`

**CREATE (Notiz einfügen)**
```sql
INSERT INTO notes (user_id_fk, text_content)
VALUES (1, 'Dies ist der Inhalt meiner ersten Notiz.'); -- Platzhalter für user_id_fk und Text
```

**READ (Alle Notizen abrufen)**
```sql
SELECT note_id, user_id_fk, text_content, created_at, updated_at
FROM notes;
```

**READ (Alle Notizen eines bestimmten Benutzers abrufen)**
```sql
SELECT note_id, text_content, created_at, updated_at
FROM notes
WHERE user_id_fk = 1; -- Platzhalter für die user_id_fk
```

**READ (Eine einzelne Notiz anhand ihrer `note_id` abrufen)**
```sql
SELECT note_id, user_id_fk, text_content, created_at, updated_at
FROM notes
WHERE note_id = 1; -- Platzhalter für die spezifische note_id
```

**READ (Optional: Notizen mit bestimmtem Inhalt suchen)**
```sql
SELECT note_id, user_id_fk, text_content, created_at, updated_at
FROM notes
WHERE text_content LIKE '%wichtiges Wort%'; -- Sucht nach Notizen, die "wichtiges Wort" enthalten
```

**UPDATE (Notiz ändern)**
```sql
UPDATE notes
SET text_content = 'Aktualisierter Inhalt der Notiz.', updated_at = CURRENT_TIMESTAMP -- oder spezifischer Zeitstempel
WHERE note_id = 1; -- Platzhalter für die spezifische note_id
```

**DELETE (Notiz löschen)**
```sql
DELETE FROM notes
WHERE note_id = 1; -- Platzhalter für die spezifische note_id
```

## 4. SQL-Befehle zum Erstellen der Tabellen (Schema Definition)

Diese Befehle würden verwendet, um die oben definierten Tabellen in einer SQL-Datenbank zu erstellen (Syntax kann je nach DBMS leicht variieren, z.B. `AUTOINCREMENT` vs. `SERIAL`).

**Erstellen der `users` Tabelle:**
```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT, -- In PostgreSQL: user_id SERIAL PRIMARY KEY
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Erstellen der `notes` Tabelle:**
```sql
CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT, -- In PostgreSQL: note_id SERIAL PRIMARY KEY
    user_id_fk INTEGER NOT NULL,
    text_content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Für automatisches Update: ON UPDATE CURRENT_TIMESTAMP (MySQL-spezifisch)
    FOREIGN KEY (user_id_fk) REFERENCES users(user_id) ON DELETE CASCADE -- Optional: ON DELETE CASCADE löscht Notizen, wenn der zugehörige Benutzer gelöscht wird
);
```
**Hinweis zu `ON DELETE CASCADE`:** Wenn ein Benutzer aus der `users`-Tabelle gelöscht wird, werden durch `ON DELETE CASCADE` automatisch alle Notizen dieses Benutzers aus der `notes`-Tabelle ebenfalls gelöscht. Alternativen sind `ON DELETE SET NULL` (wenn `user_id_fk` `NULL` erlauben würde) oder `ON DELETE RESTRICT` (verhindert das Löschen des Benutzers, solange noch Notizen existieren). Die Wahl hängt von den Anforderungen der Anwendung ab.