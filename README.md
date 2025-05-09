# Full-Stack Mini-Notizblock (React + Node.js + Docker + PostgreSQL)

Dieses Projekt demonstriert eine einfache Full-Stack-Notizanwendung.

*   **Frontend:** React-Anwendung, erstellt mit Vite, bereitgestellt durch Nginx.
*   **Backend:** Node.js Express API.
*   **Datenbank:** PostgreSQL für persistente Datenspeicherung.
*   **Bereitstellung:** Der gesamte Stack (Frontend, Backend, Datenbank) ist containerisiert und wird mit Docker Compose orchestriert.

## Theoretisches Datenbankmodell (SQL Recap)

Für dieses Projekt wurde als theoretische Übung ein relationales Datenmodell für die Notizen-Funktionalität entworfen. Dieses Modell definiert Tabellen für Benutzer (`users`) und Notizen (`notes`) mit entsprechenden Spalten, Datentypen, Primärschlüsseln und einer Fremdschlüsselbeziehung, um darzustellen, wie die Daten in einer relationalen SQL-Datenbank strukturiert wären. Es beinhaltet auch beispielhafte SQL-CRUD-Abfragen (Create, Read, Update, Delete) für diese Tabellen.
Die detaillierte Ausarbeitung dieses theoretischen Datenbankmodells und der SQL-Abfragen finden Sie in der Datei [sql-recap.md](sql-recap.md) im Hauptverzeichnis dieses Repositories.

## Anwendung mit Docker Compose starten

Dies ist die empfohlene Methode, um den gesamten Anwendungsstack auszuführen.

**Voraussetzungen:**
*   Docker Desktop muss installiert sein und laufen.
*   Git (um das Repository zu klonen, falls noch nicht geschehen).

**1. Umgebungskonfiguration (`.env`-Datei):**

   Vor dem Start müssen Sie eine `.env`-Datei im Wurzelverzeichnis des Projekts (`node-container/.env`) erstellen. Diese Datei speichert die Zugangsdaten für die PostgreSQL-Datenbank.

   Erstellen Sie eine Datei namens `.env` mit folgendem Inhalt und ersetzen Sie die Platzhalterwerte durch Ihre gewünschten Zugangsdaten:

   ```env
   # node-container/.env
   POSTGRES_USER=ihr_db_benutzer
   POSTGRES_PASSWORD=ihr_sicheres_db_passwort
   POSTGRES_DB=ihr_db_name
   ```
   **Wichtig:** Übertragen Sie die `.env`-Datei NICHT in Ihr Git-Repository, wenn sie sensible Passwörter enthält. Stellen Sie sicher, dass `.env` in Ihrer `.gitignore`-Datei aufgeführt ist.

**2. Anwendungsstack erstellen und starten:**

   Navigieren Sie in Ihrem Terminal zum Wurzelverzeichnis des Projekts (`node-container/`) und führen Sie den folgenden Befehl aus:

   ```bash
   docker-compose up --build -d
   ```

   *   `docker-compose up`: Erstellt, (erneuert,) startet Container für einen Service und hängt sich optional an deren Ausgabe an.
   *   `--build`: Zwingt Docker Compose, die Images vor dem Starten der Container neu zu erstellen. Dies ist nützlich, wenn Sie Änderungen an Ihrem `Dockerfile` oder Anwendungscode vorgenommen haben.
   *   `-d` (Detached-Modus): Führt Container im Hintergrund aus und gibt die Namen der neuen Container aus.

**3. Zugriff auf die Anwendung:**

   Sobald die Container gestartet sind und laufen, öffnen Sie Ihren Webbrowser und navigieren Sie zu:
   [http://localhost:8080](http://localhost:8080)

   Die Frontend-Anwendung wird bereitgestellt, und API-Aufrufe werden an das Backend weitergeleitet, das (schließlich) mit der PostgreSQL-Datenbank interagieren wird.

**4. Logs anzeigen:**

   Wenn Sie die Container im Detached-Modus (`-d`) gestartet haben, können Sie die Logs für alle Services mit folgendem Befehl anzeigen:
   ```bash
   docker-compose logs
   ```
   Um die Logs in Echtzeit zu verfolgen (Live-Ansicht):
   ```bash
   docker-compose logs -f
   ```
   Um Logs für einen bestimmten Service anzuzeigen (z.B. Backend):
   ```bash
   docker-compose logs -f backend
   ```
   (Ersetzen Sie `backend` bei Bedarf durch `frontend` oder `database`).

**5. Anwendung stoppen:**

   Um alle laufenden Services zu stoppen, die in der `docker-compose.yml`-Datei definiert sind, navigieren Sie zum Wurzelverzeichnis des Projekts und führen Sie folgenden Befehl aus:
   ```bash
   docker-compose down
   ```
   Dieser Befehl stoppt und entfernt die Container, Netzwerke und (standardmäßig) benannte Volumes, sofern nicht anders angegeben. Wenn Sie das benannte Volume `postgres_db_data` beibehalten möchten (was typischerweise für Datenbankdaten der Fall ist), wird `docker-compose down` es standardmäßig nicht entfernen. Um auch Volumes zu entfernen, verwenden Sie `docker-compose down -v`.

## Projektstruktur
```
node-container/
├── backend/                  # Node.js Express API
│   ├── config/
│   │   └── logger.js         # Winston Logger-Konfiguration
│   ├── data/                 # (Wurde in früheren Phasen für JSON-Dateipersistenz verwendet)
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js             # API-Logik
│   ├── Dockerfile
│   └── .dockerignore
├── vite-project/             # React Frontend (oder 'frontend/', falls so benannt)
│   ├── public/
│   ├── src/
│   ├── .dockerignore
│   ├── Dockerfile            # Frontend Docker-Konfiguration (Nginx)
│   ├── nginx.conf            # Nginx-Konfiguration für Reverse Proxy
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env                      # Für Datenbank-Zugangsdaten (DIESE DATEI MUSS ERSTELLT WERDEN)
├── .gitignore
├── docker-compose.yml        # Docker Compose-Konfiguration für alle Services
├── README.md                 # Diese Datei
└── sql-recap.md              # Theoretisches SQL-Schema und Abfragen
```

## Entwicklung (Ohne Docker - Veraltet)

Dieser Abschnitt beschreibt, wie Frontend und Backend separat ohne Docker ausgeführt werden können, hauptsächlich für isolierte Entwicklung oder falls Docker nicht verfügbar ist. Beachten Sie, dass dieses Setup die in Docker Compose definierte PostgreSQL-Datenbank nicht verwendet.

**1. Backend starten:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   (API läuft standardmäßig auf http://localhost:3000. Der Mechanismus zur Datenpersistenz hängt von der aktuellen Backend-Implementierung ab - anfangs JSON-Datei, später PostgreSQL über Docker Compose).

**2. Frontend starten:**
   ```bash
   cd ../vite-project # oder cd ../frontend
   npm install
   # Stellen Sie sicher, dass VITE_API_URL in App.jsx oder einer .env-Datei für das lokale Backend auf http://localhost:3000/api zeigt
   npm run dev
   ```
   (Frontend läuft standardmäßig auf http://localhost:5173)

## Konfigurationsdetails (über Docker Compose)

*   **Datenbank-Service (`database`):**
    *   Image: `postgres:17-alpine`
    *   Zugangsdaten: Konfiguriert über `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` in der `.env`-Datei.
    *   Datenpersistenz: Verwendet ein benanntes Docker-Volume `postgres_db_data`, gemappt auf `/var/lib/postgresql/data`.
    *   Port: Exponiert `5432` intern. Gemappt auf Host-Port `5433` für optionalen externen Zugriff.
*   **Backend-Service (`backend`):**
    *   Build: Aus `./backend/Dockerfile`.
    *   Umgebungsvariablen:
        *   `PORT`: 3000 (interner Port für die API).
        *   `DB_HOST`: `database` (Service-Name des PostgreSQL-Containers).
        *   `DB_PORT`: `5432`.
        *   `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Werden aus der `.env`-Datei übernommen.
    *   Abhängig von: `database`-Service.
*   **Frontend-Service (`frontend`):**
    *   Build: Aus `./vite-project/Dockerfile` (oder `./frontend/Dockerfile`).
    *   Build-Argument `VITE_API_URL`: Auf `/api` gesetzt für Nginx Reverse Proxy.
    *   Ports: Mappt Host-Port `8080` auf Container-Port `80` (Nginx).
    *   Abhängig von: `backend`-Service.

## Reflexionen

Dieser Abschnitt fasst die Reflexionsfragen und -antworten zu verschiedenen Aspekten des Projekts zusammen.

### Thema: Netzwerk & Reverse Proxy

#### 1. Erkläre den Weg einer API-Anfrage vom Browser bis zum Backend-Container in diesem Setup.

Der Weg einer API-Anfrage (z.B. `GET /api/notes`) sieht wie folgt aus:

1.  **Browser:** Der Benutzer interagiert mit der React-Anwendung, die im Browser unter `http://localhost:8080` läuft. Die JavaScript-Anwendung initiiert einen `fetch`-Aufruf an `http://localhost:8080/api/notes`.
2.  **Host (Netzwerk-Stack):** Die Anfrage geht vom Browser an den Netzwerk-Stack des Host-Betriebssystems, gerichtet an `localhost` auf Port `8080`.
3.  **Frontend-Container (Nginx):** Docker Compose leitet die Anfrage vom Host-Port `8080` an den internen Port `80` des `frontend`-Containers weiter. Dort nimmt der Nginx-Webserver die Anfrage entgegen.
4.  **Nginx (Reverse Proxy):** Die Nginx-Konfiguration im `frontend`-Container hat einen `location /api/`-Block. Dieser Block fängt die Anfrage an `/api/notes` ab. Nginx leitet die Anfrage (dank `proxy_pass http://backend:3000;`) intern weiter.
5.  **Docker Netzwerk (Compose):** Nginx versucht nun, den Hostnamen `backend` aufzulösen. Da sich sowohl der `frontend`- als auch der `backend`-Container im selben von Docker Compose erstellten Netzwerk befinden, kann Docker die interne DNS-Auflösung nutzen, um `backend` zur internen IP-Adresse des `backend`-Containers auf Port `3000` aufzulösen.
6.  **Backend-Container (Node.js/Express API):** Die Anfrage erreicht den Node.js/Express-Server, der im `backend`-Container auf Port `3000` lauscht. Der Express-Router verarbeitet die Anfrage an den Endpunkt `/api/notes`.
7.  **Rückweg:** Die Antwort des Backend-Containers geht denselben Weg zurück.

#### 2. Warum kann der Browser `backend:3000` nicht direkt auflösen, Nginx im Frontend-Container aber schon?

*   **Browser:** Läuft auf dem Host und kennt die internen Docker-Netzwerk-Hostnamen (`backend`) nicht. Der Hostname `backend` ist nur innerhalb des von Docker Compose erstellten Netzwerks gültig.
*   **Nginx im Frontend-Container:** Ist Teil des Docker-Compose-Netzwerks und kann andere Services über deren Service-Namen (`backend`) via Docker DNS auflösen.

#### 3. Welche Rolle spielt die benutzerdefinierte Nginx-Konfiguration für das Reverse Proxy Muster? Beschreibe den Zweck des relevanten `location` Blocks.

Die benutzerdefinierte Nginx-Konfiguration ist zentral für das Reverse Proxy Muster. Der relevante `location` Block (typischerweise `location /api/ { ... }`) hat folgenden Zweck:
*   **Anfragen abfangen:** Er fängt alle Anfragen ab, deren Pfad mit `/api/` beginnt.
*   **Weiterleiten (`proxy_pass`):** Die Direktive `proxy_pass http://backend:3000;` leitet diese abgefangenen Anfragen an den `backend`-Service (der auf Port `3000` im Docker-Netzwerk lauscht) weiter.
*   **Header-Manipulation:** Oft werden hier auch Header gesetzt (z.B. `proxy_set_header Host $host;`, `proxy_set_header X-Real-IP $remote_addr;`), um dem Backend-Service korrekte Informationen über die ursprüngliche Anfrage zu geben.
Nginx agiert also als Vermittler, der Anfragen vom Client empfängt und an den entsprechenden Backend-Service weiterleitet, ohne dass der Client direkt mit dem Backend kommunizieren muss.

#### 4. Wie hat sich der Wert des Build-Arguments `VITE_API_URL` für das Frontend im Vergleich zur vorherigen Aufgabe geändert und warum (`http://localhost:PORT` vs. `/api`)?

*   **Vorher (ohne Proxy auf gleichem Host):** `VITE_API_URL` war eine absolute URL (z.B. `http://localhost:3001/api` oder `http://backend:3000/api`, falls der Frontend-Code direkt im Browser lief und auf einen anderen Host/Port zugreifen musste). Der Browser musste wissen, unter welcher genauen Adresse das Backend erreichbar ist.
*   **Jetzt (mit Proxy):** `VITE_API_URL` ist ein relativer Pfad wie `/api`. Die React-Anwendung sendet Anfragen an denselben Host und Port, von dem sie ausgeliefert wird (z.B. `http://localhost:8080/api`). Nginx, das auf `http://localhost:8080` lauscht, fängt diese Anfragen unter dem Pfad `/api` ab und leitet sie intern an das Backend weiter. Dies vereinfacht die Konfiguration der Frontend-Anwendung, da sie sich nicht um den genauen Standort des Backends kümmern muss.

#### 5. Welche Vorteile bietet dieses Reverse Proxy Muster (abgesehen von der DNS-Auflösung) im Vergleich dazu, wenn der Browser direkt mit dem Backend-Container auf einem gemappten Host-Port kommunizieren würde (z.B. in Bezug auf CORS)?

Das Reverse Proxy Muster bietet mehrere Vorteile:
*   **Single Point of Entry:** Alle Anfragen gehen an einen einzigen Host und Port (z.B. `http://localhost:8080`), was die URL-Struktur für den Client vereinfacht.
*   **CORS-Problematik umgangen:** Da alle Anfragen (sowohl für Frontend-Assets als auch für API-Daten) scheinbar vom selben Ursprung (`localhost:8080`) kommen, treten keine Cross-Origin Resource Sharing (CORS) Probleme auf, die sonst konfiguriert werden müssten, wenn Frontend und Backend auf unterschiedlichen Ports/Domains laufen.
*   **Load Balancing:** Ein Reverse Proxy kann Anfragen auf mehrere Instanzen eines Backend-Services verteilen.
*   **SSL/TLS-Terminierung:** HTTPS kann zentral am Reverse Proxy implementiert werden, sodass die internen Services unverschlüsselt kommunizieren können.
*   **Caching:** Häufig angeforderte Inhalte können vom Reverse Proxy zwischengespeichert werden, um das Backend zu entlasten.
*   **Verbesserte Sicherheit/Isolation:** Das Backend ist nicht direkt aus dem Internet erreichbar, sondern nur über den Proxy.
*   **Path-basiertes Routing:** Anfragen können basierend auf dem Pfad an unterschiedliche Backend-Services weitergeleitet werden.

### Thema: Relationale Datenbanken & SQL

#### 1. Warum ist die Speicherung von Anwendungsdaten in einer strukturierten Datenbank (mit Tabellen, Spalten, Datentypen, Schlüsseln) besser als die einfache Speicherung in einer JSON-Datei auf dem Dateisystem? Nenne mindestens drei Vorteile.

1.  **Datenintegrität und -konsistenz:** Datenbanken erzwingen Datentypen, Constraints (z.B. `NOT NULL`, `UNIQUE`), Primär- und Fremdschlüssel. Dies sichert die Datenqualität und verhindert Inkonsistenzen. Transaktionen (ACID-Eigenschaften) gewährleisten, dass Daten auch bei Fehlern konsistent bleiben.
2.  **Effiziente Datenabfrage und -manipulation:** SQL ermöglicht komplexe Abfragen (Filtern, Sortieren, Gruppieren, JOINs). Indizes beschleunigen Suchvorgänge erheblich. Selektive Updates sind möglich, ohne die gesamte Datenmenge neu schreiben zu müssen.
3.  **Skalierbarkeit und Nebenläufigkeit (Concurrency):** Datenbanken sind für den gleichzeitigen Zugriff vieler Benutzer ausgelegt und verwalten Konflikte durch Sperrmechanismen. Sie skalieren besser für große Datenmengen und bieten robuste Backup- und Recovery-Mechanismen.

#### 2. Was ist der Hauptzweck eines Primärschlüssels in einer Tabelle, und wie hast du dieses Konzept in deinem Entwurf umgesetzt?

Der Hauptzweck eines Primärschlüssels ist es, jede Zeile (jeden Datensatz) in einer Tabelle eindeutig zu identifizieren. Er stellt sicher, dass es keine Duplikate gibt und dient als Referenzpunkt.
**Umsetzung im Entwurf:**
*   Tabelle `users`: Spalte `user_id` (INTEGER, PRIMARY KEY, typischerweise AUTOINCREMENT).
*   Tabelle `notes`: Spalte `note_id` (INTEGER, PRIMARY KEY, typischerweise AUTOINCREMENT).

#### 3. Was ist der Zweck eines Fremdschlüssels, und welche Beziehung modelliert dein Fremdschlüssel?

Der Zweck eines Fremdschlüssels ist es, eine Beziehung zwischen zwei Tabellen herzustellen und die referentielle Integrität sicherzustellen (d.h. es gibt keine verwaisten Datensätze).
**Modellierte Beziehung im Entwurf:**
*   In der Tabelle `notes` verweist die Spalte `user_id_fk` (Fremdschlüssel) auf die Spalte `user_id` (Primärschlüssel) in der Tabelle `users`.
*   Dies modelliert eine **Eins-zu-Viele-Beziehung**: Ein Benutzer kann viele Notizen haben, aber jede Notiz gehört zu genau einem Benutzer.

#### 4. Wie würden die API-Endpunkte deiner Backend-Anwendung (GET /items, GET /items/:id, POST /items, DELETE /items/:id) theoretisch auf die von dir formulierten SQL-Abfragen abgebildet werden? (Bezogen auf "notes" statt "items")

*   **`GET /api/notes`**: `SELECT * FROM notes;` (ggf. mit `WHERE user_id_fk = ?` für benutzerspezifische Notizen).
*   **`GET /api/notes/:id`**: `SELECT * FROM notes WHERE note_id = ?;`
*   **`POST /api/notes`**: `INSERT INTO notes (user_id_fk, text_content, ...) VALUES (?, ?, ...);`
*   **`PUT /api/notes/:id`** (Aktualisieren): `UPDATE notes SET text_content = ?, ... WHERE note_id = ?;`
*   **`DELETE /api/notes/:id`**: `DELETE FROM notes WHERE note_id = ?;`

#### 5. Warum ist die Nutzung einer Datenbank für persistente Daten wichtig im Kontext von containerisierten Anwendungen und DevOps?

1.  **Lebenszyklus-Entkopplung:** Daten bleiben erhalten, auch wenn zustandslose Anwendungscontainer neu gestartet, aktualisiert oder skaliert werden.
2.  **Datenpersistenz:** Gewährleistet, dass Daten über Deployments und Updates hinweg bestehen bleiben.
3.  **Skalierbarkeit:** Mehrere Instanzen von Anwendungscontainern können auf dieselbe zentrale Datenbank zugreifen.
4.  **Zuverlässigkeit:** Datenbanken bieten Features wie Replikation, Failover und Backup.
5.  **Zentralisierte Datenverwaltung:** Ermöglicht einheitliche Verwaltung von Zugriff, Schema und Monitoring.

### Thema: Docker Compose & Multi-Container Orchestrierung

#### 1. Was sind die Hauptvorteile der Nutzung von Docker Compose, um alle Services (Frontend, Backend, Datenbank) gemeinsam zu definieren und zu starten, verglichen mit dem manuellen Starten jedes Containers mit `docker run`?

1.  **Deklarative Konfiguration:** Eine `docker-compose.yml`-Datei beschreibt den gesamten Stack (Services, Netzwerke, Volumes), was übersichtlicher und versionierbar ist.
2.  **Vereinfachtes Management:** Befehle wie `docker-compose up`, `down`, `logs` verwalten den gesamten Stack.
3.  **Netzwerk-Management:** Automatische Erstellung eines Netzwerks, in dem Services sich über Namen finden.
4.  **Volume-Management:** Einfache Definition und Verwaltung von Volumes für persistente Daten.
5.  **Abhängigkeitsmanagement:** `depends_on` steuert die Startreihenfolge.
6.  **Umgebungsvariablen-Management:** Zentrale Definition von Umgebungsvariablen, auch aus `.env`-Dateien.
7.  **Reproduzierbarkeit:** Konsistente Umgebungen auf verschiedenen Maschinen.

#### 2. Beschreibe, wie die Zugangsdaten zur PostgreSQL-Datenbank in dieser Aufgabe an den Backend-Container übergeben werden. Welchen Mechanismus nutzt Docker Compose dafür und in welchem Abschnitt der `docker-compose.yml` wird dies konfiguriert?

Die Zugangsdaten werden als **Umgebungsvariablen** an den Backend-Container übergeben.
*   **Mechanismus:** Docker Compose verwendet den `environment`-Schlüssel innerhalb der Service-Definition.
*   **Konfiguration:** Im `backend`-Service der `docker-compose.yml`:
    ```yaml
    environment:
      DB_HOST: database
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
    ```
    Die `${VARIABLE}`-Werte werden aus einer `.env`-Datei im Projektwurzelverzeichnis geladen.

#### 3. Warum ist es eine Best Practice, sensible Daten wie Datenbank-Passwörter als Umgebungsvariablen an Container zu übergeben, anstatt sie direkt in den Code oder das Dockerfile zu schreiben?

1.  **Sicherheit:** Vermeidet Hardcoding von Secrets im Code oder Docker-Image, die bei Zugriff auf das Repository oder Image einsehbar wären. Umgebungsvariablen werden erst zur Laufzeit gesetzt.
2.  **Flexibilität:** Dieselbe Codebasis/Image kann in verschiedenen Umgebungen (Dev, Test, Prod) mit unterschiedlichen Credentials verwendet werden.
3.  **Einfache Änderung:** Secrets können geändert werden, ohne Code oder Image neu bauen zu müssen.
4.  **Trennung von Konfiguration und Code:** Folgt Best Practices wie den "Twelve-Factor App"-Richtlinien.

#### 4. Warum ist es wichtig, das Datenbank-Passwort, selbst wenn es als Umgebungsvariable im Container verfügbar ist, nicht auf die Konsole zu loggen?

1.  **Sicherheitsrisiko durch Log-Aggregation:** Logs werden oft zentral gesammelt; Passwörter in Logs wären dort einsehbar.
2.  **Unbeabsichtigte Exposition:** Entwickler/Admins könnten Passwörter beim Log-Review sehen.
3.  **Compliance:** Viele Sicherheitsstandards verbieten das Loggen von Secrets.
4.  **Schwierige Bereinigung:** Einmal geloggte Passwörter sind schwer zu entfernen.
Stattdessen sollte ein Platzhalter (z.B. `[REDACTED]`) geloggt werden.

#### 5. Wie kommuniziert der Backend-Container theoretisch mit dem Datenbank-Container in diesem Compose-Setup (wenn die Verbindung später aufgebaut wird)? Nenne den Hostnamen und Port, den das Backend verwenden würde.

*   **Hostname:** Der Service-Name des Datenbank-Containers, also `database` (gemäß `docker-compose.yml`).
*   **Port:** Der interne Port, auf dem PostgreSQL im Datenbank-Container lauscht, also `5432`.
Die Verbindungszeichenfolge im Backend wäre etwa: `postgresql://<DB_USER>:<DB_PASSWORD>@database:5432/<DB_NAME>`.

#### 6. Warum wird in diesem Setup das `ports` Mapping für den Backend-Service in der `docker-compose.yml` optional (oder weggelassen), während das `expose` Feld wichtig ist?

*   **`ports` Mapping (z.B. `- "3001:3000"`):** Veröffentlicht einen Container-Port auf dem Host-System. Für das Backend hier optional, da der Zugriff über den Frontend-Nginx-Proxy erfolgt und kein direkter Zugriff vom Host nötig ist.
*   **`expose` Feld (z.B. `- "3000"`):** Deklariert einen Port, auf dem der Container lauscht, macht ihn aber nur für andere Container im selben Docker-Netzwerk zugänglich (nicht für den Host). Dies ist wichtig, damit der Frontend-Container (Nginx) den Backend-Container auf Port `3000` erreichen kann.
