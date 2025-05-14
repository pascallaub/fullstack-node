# Full-Stack Mini-Notizblock (React + Node.js + Docker + PostgreSQL)

Dieses Projekt demonstriert eine einfache Full-Stack-Notizanwendung.

*   **Frontend:** React-Anwendung, erstellt mit Vite, bereitgestellt durch Nginx.
*   **Backend:** Node.js Express API.
*   **Datenbank:** PostgreSQL für persistente Datenspeicherung.
*   **Bereitstellung:** Der gesamte Stack (Frontend, Backend, Datenbank) ist containerisiert und wird mit Docker Compose orchestriert.

## Theoretisches Datenbankmodell (SQL Recap)

Für dieses Projekt wurde als theoretische Übung ein relationales Datenmodell für die Notizen-Funktionalität entworfen. Dieses Modell definiert Tabellen für Benutzer (`users`) und Notizen (`notes`) mit entsprechenden Spalten, Datentypen, Primärschlüsseln und einer Fremdschlüsselbeziehung, um darzustellen, wie die Daten in einer relationalen SQL-Datenbank strukturiert wären. Es beinhaltet auch beispielhafte SQL-CRUD-Abfragen (Create, Read, Update, Delete) für diese Tabellen.
Die detaillierte Ausarbeitung dieses theoretische Datenbankmodells und der SQL-Abfragen finden Sie in der Datei [sql-recap.md](sql-recap.md) im Hauptverzeichnis dieses Repositories.

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

## Finaler Zustand des Stacks & Verifizierung

Der Anwendungsstack ist nun eine vollständige Full-Stack-Anwendung mit Frontend, Backend und einer persistenten Datenbank, die alle über Docker Compose orchestriert werden. Die wichtigsten Merkmale sind:

*   **Frontend:** Eine React-Anwendung (erstellt mit Vite), die von einem Nginx-Server in einem Docker-Container bereitgestellt wird. Sie kommuniziert mit dem Backend über einen Reverse Proxy, der von Nginx gehandhabt wird.
*   **Backend:** Eine Node.js/Express-API, die in einem eigenen Docker-Container läuft. Sie ist verantwortlich für die Geschäftslogik und die Kommunikation mit der Datenbank.
*   **Datenbank:** Ein PostgreSQL-Datenbankserver, der in einem Docker-Container läuft und für die persistente Speicherung der Notizdaten zuständig ist. Die Daten bleiben auch nach einem Neustart der Container erhalten, dank eines benannten Docker-Volumes.
*   **CRUD-Operationen:** Die Anwendung unterstützt vollständige CRUD-Funktionalität (Create, Read, Update, Delete) für Notizen.
*   **Healthchecks:**
    *   Der **Datenbank-Container** hat einen Healthcheck (`pg_isready`), um sicherzustellen, dass er bereit ist, Verbindungen anzunehmen.
    *   Der **Backend-Container** hat einen Healthcheck (`curl` auf einen `/health`-Endpunkt), um sicherzustellen, dass die API-Anwendung läuft und auf Anfragen reagiert.
*   **Abhängigkeitsmanagement:** Docker Compose stellt sicher, dass das Backend erst startet, wenn die Datenbank "healthy" ist, und das Frontend (optional, aber gute Praxis) erst, wenn das Backend "healthy" ist (obwohl in der aktuellen `docker-compose.yml` das Frontend nicht explizit auf den Healthcheck des Backends wartet, was für die meisten Setups mit Nginx als Proxy für statische Dateien und API-Weiterleitung ausreichend ist).

### Stack starten

1.  **Voraussetzung:** Stelle sicher, dass du eine `.env`-Datei im Wurzelverzeichnis des Projekts (`node-container/.env`) mit den notwendigen Datenbank-Zugangsdaten erstellt hast (siehe Abschnitt "Anwendung mit Docker Compose starten").
2.  **Befehl:** Navigiere in deinem Terminal zum Wurzelverzeichnis des Projekts (`node-container/`) und führe folgenden Befehl aus:
    ```bash
    docker-compose up --build -d
    ```
    *   `--build`: Stellt sicher, dass alle Images neu gebaut werden, falls Änderungen an den Dockerfiles oder dem Anwendungscode vorgenommen wurden.
    *   `-d`: Startet die Container im Hintergrund.

### Verifizierung der Funktionalität

#### 1. Healthchecks überprüfen

Nachdem die Container gestartet sind, öffne ein Terminal und führe folgenden Befehl aus:

```bash
docker ps
```

Du solltest eine Ausgabe ähnlich dieser sehen, die anzeigt, dass alle relevanten Dienste laufen und "healthy" sind:

```
CONTAINER ID   IMAGE                     COMMAND                  CREATED          STATUS                    PORTS                    NAMES
<id>           node-container-frontend   "/docker-entrypoint.…"   X seconds/minutes ago   Up X seconds/minutes      0.0.0.0:8080->80/tcp     frontend-app
<id>           node-container-backend    "docker-entrypoint.s…"   X seconds/minutes ago   Up X seconds/minutes (healthy)   3000/tcp                 backend-api
<id>           postgres:17-alpine        "docker-entrypoint.s…"   X seconds/minutes ago   Up X seconds/minutes (healthy)   0.0.0.0:5433->5432/tcp   mini_notizblock_db_service
```

*   Achte auf `(healthy)` in der `STATUS`-Spalte für `backend-api` und `mini_notizblock_db_service`.
*   Der `frontend-app`-Container hat keinen expliziten Healthcheck in dieser Konfiguration, aber sein Laufen (`Up X minutes`) ist ein gutes Zeichen.

#### 2. Ende-zu-Ende Funktionalität (CRUD-Operationen)

1.  **Anwendung öffnen:** Öffne deinen Webbrowser und navigiere zu `http://localhost:8080`. Die Notiz-Anwendung sollte geladen werden.

    *Die laufende Anwendung im Browser, die alle CRUD-Operationen demonstriert:*

    ![Laufende Anwendung mit CRUD-Funktionen](/public/beispiel.png)

2.  **Create (Erstellen):**
    *   Gib einen Text in das Eingabefeld für neue Notizen ein.
    *   Klicke auf "Notiz hinzufügen".
    *   **Verifizierung:** Die neue Notiz sollte in der Liste erscheinen. Überprüfe optional die Backend-Logs (`docker-compose logs -f backend`), um die `POST`-Anfrage zu sehen.

3.  **Read (Lesen):**
    *   **Verifizierung:** Beim Laden der Seite sollten alle zuvor erstellten (und nicht gelöschten) Notizen aus der Datenbank abgerufen und angezeigt werden.

4.  **Update (Aktualisieren):**
    *   Klicke auf den "Bearbeiten"-Button einer bestehenden Notiz.
    *   Ändere den Text im nun erscheinenden Eingabefeld.
    *   Klicke auf "Speichern".
    *   **Verifizierung:** Der Text der Notiz in der Liste sollte sich aktualisiert haben. Überprüfe optional die Backend-Logs für die `PUT`-Anfrage.

5.  **Delete (Löschen):**
    *   Klicke auf den "Löschen"-Button einer bestehenden Notiz.
    *   **Verifizierung:** Die Notiz sollte aus der Liste verschwinden. Überprüfe optional die Backend-Logs für die `DELETE`-Anfrage.

#### 3. Persistenz der Daten überprüfen

1.  Füge einige Notizen hinzu, bearbeite oder lösche welche.
2.  Stoppe den gesamten Stack:
    ```bash
    docker-compose down
    ```
    (Dieser Befehl entfernt die Container, aber **nicht** das benannte Volume `postgres_db_data`, in dem die Datenbankdaten gespeichert sind).
3.  Starte den Stack erneut:
    ```bash
    docker-compose up -d
    ```
    (Ein `--build` ist hier nicht unbedingt nötig, wenn keine Code-Änderungen vorgenommen wurden).
4.  Öffne die Anwendung erneut unter `http://localhost:8080`.
5.  **Verifizierung:** Alle Notizen, die vor dem Stoppen des Stacks vorhanden waren (und nicht gelöscht wurden), sollten immer noch da sein. Dies bestätigt, dass die Daten in der PostgreSQL-Datenbank persistent gespeichert werden.

Wenn alle diese Schritte erfolgreich sind, ist dein Full-Stack-Anwendungsstack mit Datenbankpersistenz und Healthchecks voll funktionsfähig!

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

### Thema: Umstellung auf Datenbank-Persistenz (PostgreSQL)

#### 1. Welche Anpassungen waren im Backend-Code (spezifisch im Service Layer oder den Route-Handlern) notwendig, um von der File-basierten Persistenz auf die Datenbank-Persistenz umzusteigen?

Die Umstellung von File-basierter Persistenz auf Datenbank-Persistenz im Backend erforderte mehrere Kernanpassungen, hauptsächlich in den Route-Handlern (da in diesem Projekt kein expliziter Service-Layer für die CRUD-Logik abgetrennt wurde, sondern diese direkt in den Express-Routen-Handlern lag):

1.  **Entfernung der Dateizugriffslogik:**
    *   Alle Funktionen und Code-Teile, die für das Lesen aus und Schreiben in die JSON-Datei (`notes-data.json`) zuständig waren (z.B. `readDataFromFile`, `writeDataToFile`), wurden entfernt.
    *   Die Initialisierung der `notes`-Variable und `nextId` aus der Datei beim Start entfiel.

2.  **Integration des `pg`-Treibers und Connection Pools:**
    *   Der `pg`-Treiber musste importiert werden (`const { Pool } = require('pg');`).
    *   Ein `Pool`-Objekt wurde mit den Datenbank-Verbindungsparametern (aus Umgebungsvariablen) initialisiert. Dieser Pool verwaltet die Datenbankverbindungen.

3.  **Umschreiben der CRUD-Operationen:**
    *   **`GET /api/notes` (Alle Notizen abrufen):** Statt die `notes`-Variable aus dem Speicher zurückzugeben, wird nun eine SQL `SELECT * FROM notes ORDER BY created_at DESC` Abfrage an die Datenbank gesendet. Das Ergebnis der Datenbank wird an den Client gesendet.
    *   **`POST /api/notes` (Neue Notiz erstellen):** Statt ein neues Objekt zum `notes`-Array hinzuzufügen und in die Datei zu schreiben, wird nun eine SQL `INSERT INTO notes (text_content) VALUES ($1) RETURNING *` Abfrage ausgeführt. Die Benutzereingabe (`text`) wird als Parameter übergeben. Das von der Datenbank zurückgegebene neue Notizobjekt wird an den Client gesendet.
    *   **`DELETE /api/notes/:id` (Notiz löschen):** Statt das Element aus dem `notes`-Array zu filtern und in die Datei zu schreiben, wird nun eine SQL `DELETE FROM notes WHERE id = $1 RETURNING id` Abfrage ausgeführt. Die ID wird als Parameter übergeben.

4.  **Asynchrone Operationen:**
    *   Alle Datenbankoperationen sind asynchron. Daher mussten die Route-Handler zu `async` Funktionen umgeschrieben werden, und `await` wurde verwendet, um auf die Ergebnisse von `pool.query()` zu warten.

5.  **Fehlerbehandlung:**
    *   `try...catch`-Blöcke wurden um die Datenbankabfragen implementiert, um potenzielle Fehler (z.B. Verbindungsfehler, SQL-Syntaxfehler) abzufangen.
    *   Abgefangene Fehler werden geloggt und über `next(err)` an den zentralen Express-Fehlerhandler weitergeleitet, um eine konsistente Fehlerantwort an den Client zu senden (z.B. HTTP 500).

6.  **Datenstruktur-Anpassung:**
    *   Die Struktur der von der Datenbank zurückgegebenen Objekte musste ggf. leicht angepasst werden (z.B. `text_content` aus der DB wurde als `text` an das Frontend gesendet, um die bestehende Frontend-Logik beizubehalten: `SELECT id, text_content AS text, ...`).

#### 2. Warum ist die Nutzung eines Connection Pools (`pg.Pool`) eine Best Practice, wenn deine API viele Datenbankabfragen verarbeiten muss, verglichen mit einer einzelnen `pg.Client`-Instanz?

Die Nutzung eines Connection Pools (`pg.Pool`) anstelle einer einzelnen `pg.Client`-Instanz ist eine Best Practice aus mehreren Gründen, besonders bei APIs mit vielen gleichzeitigen Anfragen:

1.  **Effizienz und Performance:**
    *   **Wiederverwendung von Verbindungen:** Das Aufbauen einer neuen Datenbankverbindung ist ein ressourcenintensiver Vorgang (Netzwerk-Handshake, Authentifizierung etc.). Ein Connection Pool erstellt eine bestimmte Anzahl von Verbindungen im Voraus und hält sie offen. Wenn eine Anfrage eine Datenbankverbindung benötigt, leiht sie sich eine aus dem Pool und gibt sie nach Gebrauch zurück. Dies vermeidet den Overhead des ständigen Auf- und Abbaus von Verbindungen für jede einzelne Anfrage.
    *   **Reduzierte Latenz:** Da Verbindungen bereits bestehen, ist die Latenz für die Ausführung einer Abfrage geringer.

2.  **Ressourcenmanagement:**
    *   **Begrenzung der Verbindungsanzahl:** Datenbankserver können nur eine begrenzte Anzahl gleichzeitiger Verbindungen verwalten. Ohne Pool könnte eine API unter Last versuchen, zu viele Verbindungen zu öffnen, was den Datenbankserver überlasten oder zu Verbindungsfehlern führen kann. Ein Pool limitiert die maximale Anzahl der aktiven Verbindungen zur Datenbank.
    *   **Vermeidung von Connection Leaks:** Der Pool hilft, Verbindungen ordnungsgemäß zu verwalten und freizugeben, was das Risiko von "hängenden" oder nicht geschlossenen Verbindungen reduziert.

3.  **Skalierbarkeit und Robustheit:**
    *   **Bessere Handhabung von Lastspitzen:** Der Pool kann kurzzeitige Lastspitzen besser abfedern, indem Anfragen auf die verfügbaren Verbindungen verteilt werden. Wenn alle Verbindungen im Pool belegt sind, können neue Anfragen entweder warten (bis eine Verbindung frei wird) oder es kann ein Fehler ausgelöst werden, je nach Konfiguration des Pools.
    *   **Automatische Wiederverbindung (teilweise):** Einige Pool-Implementierungen können fehlerhafte Verbindungen erkennen, schließen und versuchen, neue zu öffnen, was die Robustheit der Anwendung erhöht.

Im Gegensatz dazu würde eine einzelne `pg.Client`-Instanz:
*   Entweder für jede API-Anfrage eine neue Verbindung aufbauen und wieder schließen müssen (sehr ineffizient).
*   Oder eine einzige, langlebige Verbindung verwenden, die dann zum Flaschenhals wird, da alle Datenbankabfragen serialisiert über diese eine Verbindung laufen müssten, was die Parallelität stark einschränkt.

#### 3. Erkläre anhand eines Beispiels aus deinem Code, wie du SQL Injection bei einer Abfrage, die Benutzereingaben verwendet (z.B. beim Abrufen eines Items nach ID oder beim Erstellen eines Items), vermieden hast. Warum ist dies wichtig?

SQL Injection wurde durch die Verwendung von **parametrisierten Abfragen** (auch Prepared Statements genannt) vermieden.

**Beispiel aus dem Code (Erstellen einer neuen Notiz):**
```javascript
// filepath: backend/server.js
// ...
app.post('/api/notes', async (req, res, next) => {
  const { text } = req.body; // Benutzereingabe
  if (!text) {
    // ... Fehlerbehandlung ...
  }
  try {
    const result = await pool.query(
      'INSERT INTO notes (text_content) VALUES ($1) RETURNING id, text_content AS text, created_at, updated_at',
      [text] // Die Benutzereingabe wird als separater Parameter übergeben
    );
    const newNote = result.rows[0];
    // ...
  } catch (err) {
    // ...
  }
});
// ...
```
**Erläuterung:**
1.  Der SQL-Befehl `INSERT INTO notes (text_content) VALUES ($1) ...` enthält einen Platzhalter `$1`.
2.  Die tatsächliche Benutzereingabe (`text` aus `req.body`) wird als zweites Argument an `pool.query()` in einem Array übergeben: `[text]`.
3.  Der `pg`-Treiber (oder die Datenbank selbst) behandelt diesen Wert nun als reinen Datenwert und nicht als Teil des SQL-Codes. Selbst wenn `text` bösartigen SQL-Code enthalten würde (z.B. `'); DROP TABLE notes; --`), würde dieser nicht ausgeführt, sondern als Text in die Spalte `text_content` eingefügt.

**Warum ist dies wichtig?**
SQL Injection ist eine der häufigsten und gefährlichsten Sicherheitslücken in Webanwendungen. Wenn Benutzereingaben direkt und unverarbeitet in SQL-Abfragen konkateniert (zusammengefügt) würden, könnte ein Angreifer manipulierte Eingaben senden, um:
*   **Daten zu stehlen:** Zugriff auf sensible Informationen aus der Datenbank erlangen (z.B. Benutzerdaten, Passwörter).
*   **Daten zu modifizieren:** Unbefugt Datensätze ändern oder löschen.
*   **Datenbankstruktur zu zerstören:** Tabellen löschen (`DROP TABLE`) oder die gesamte Datenbank kompromittieren.
*   **Administrative Kontrolle über den Datenbankserver zu erlangen.**

Parametrisierte Abfragen stellen sicher, dass die Datenbank zwischen dem eigentlichen SQL-Befehl und den Daten, die verarbeitet werden sollen, klar unterscheidet. Dies ist die primäre und effektivste Methode, um SQL Injection zu verhindern.

#### 4. Beschreibe den manuellen Prozess, den du in dieser Aufgabe durchgeführt hast, um das initiale Datenbank-Schema zu erstellen. Welche Nachteile siehst du bei diesem manuellen Prozess, wenn sich das Schema in Zukunft ändern würde oder wenn du in einem Team arbeitest?

**Manueller Prozess zur Schema-Erstellung:**

1.  **SQL-Datei schreiben:** Die `CREATE TABLE`-Anweisungen (und ggf. `CREATE FUNCTION`, `CREATE TRIGGER`) wurden in eine lokale `.sql`-Datei geschrieben (z.B. `backend/sql/initial_schema.sql`).
2.  **Datei in den Container kopieren:** Die `.sql`-Datei wurde mit `docker cp backend/sql/initial_schema.sql <container_name>:/tmp/initial_schema.sql` in den laufenden PostgreSQL-Container kopiert.
3.  **SQL-Datei im Container ausführen:** Mit `docker exec -u <db_user_im_container> <container_name> psql -U <db_user_in_db> -d <db_name> -f /tmp/initial_schema.sql` wurde der `psql`-Client im Container aufgerufen, um die zuvor kopierte `.sql`-Datei auszuführen und so die Tabellen zu erstellen. Hierbei mussten der korrekte Datenbankbenutzer und der Pfad zur Datei im Container beachtet werden. Die Umgebungsvariable `MSYS_NO_PATHCONV=1` war in MINGW64 notwendig, um Pfadkonvertierungsprobleme zu umgehen.

**Nachteile des manuellen Prozesses:**

1.  **Fehleranfälligkeit:**
    *   Manuelle Eingaben von Befehlen können leicht zu Tippfehlern führen.
    *   Es ist leicht, einen Schritt zu vergessen oder in der falschen Reihenfolge auszuführen.
    *   Die korrekten Benutzernamen, Datenbanknamen und Pfade müssen jedes Mal genau stimmen.

2.  **Nicht reproduzierbar und inkonsistent:**
    *   Wenn das Setup auf einer neuen Maschine oder von einem anderen Teammitglied wiederholt werden muss, ist es schwierig sicherzustellen, dass genau die gleichen Schritte ausgeführt werden. Dies kann zu inkonsistenten Datenbankzuständen führen.
    *   Es gibt keine automatische Versionierung des Schemas.

3.  **Schwierige Schema-Evolution (Migrationen):**
    *   Wenn sich das Schema ändert (z.B. eine Spalte hinzufügen, eine Tabelle umbenennen), ist der manuelle Prozess noch komplexer. Man müsste `ALTER TABLE`-Befehle schreiben und manuell ausführen.
    *   Es gibt keine einfache Möglichkeit, den aktuellen Stand des Schemas nachzuverfolgen oder zu einer früheren Version zurückzukehren.
    *   Das Risiko, bestehende Daten bei Schemaänderungen zu beschädigen oder zu verlieren, ist hoch.

4.  **Schlechte Teamarbeit:**
    *   Es ist schwer zu koordinieren, wer wann welche Schemaänderungen vornimmt.
    *   Es gibt keine zentrale, versionierte Quelle der Wahrheit für das Datenbankschema.
    *   Neue Teammitglieder müssen den manuellen Prozess erst erlernen.

5.  **Zeitaufwand:** Für wiederholte Setups oder häufige Änderungen ist der manuelle Prozess zeitaufwendig.

**Alternative:** Für diese Probleme gibt es Werkzeuge für **Datenbankmigrationen** (z.B. Flyway, Liquibase, Knex.js Migrations, Sequelize Migrations, TypeORM Migrations). Diese Werkzeuge erlauben es, Schemaänderungen in versionierten Skripten zu definieren, die automatisch und konsistent angewendet werden können.

#### 5. Wie hast du in diesem Setup sichergestellt, dass die Datenbank läuft und (wahrscheinlich) bereit ist, bevor dein Backend-Service startet?

In diesem Setup wurde die Bereitschaft der Datenbank vor dem Start des Backend-Services durch zwei Mechanismen in der `docker-compose.yml`-Datei sichergestellt:

1.  **`depends_on` mit `condition: service_healthy`:**
    Im `backend`-Service wurde eine `depends_on`-Klausel für den `database`-Service hinzugefügt:
    ```yaml
    // filepath: docker-compose.yml
    # ...
    services:
      # ...
      backend:
        # ...
        depends_on:
          database:
            condition: service_healthy # Backend startet erst, wenn DB "healthy" ist
      # ...
    ```

    Diese Konfiguration weist Docker Compose an, den `backend`-Container erst zu starten, nachdem der `database`-Container den Status "healthy" erreicht hat.

2.  **`healthcheck` im `database`-Service:**
    Damit die `condition: service_healthy` funktioniert, muss der `database`-Service einen `healthcheck` definieren. Dieser wurde wie folgt konfiguriert:
    ```yaml
    // filepath: docker-compose.yml
    # ...
    services:
      database:
        # ...
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} -q"]
          interval: 10s
          timeout: 5s
          retries: 5
          start_period: 10s
      # ...
    ```

    *   `test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB} -q"]`: Dieser Befehl wird periodisch im Datenbank-Container ausgeführt. `pg_isready` ist ein PostgreSQL-Utility, das prüft, ob der Server Verbindungen akzeptiert. Die Option `-q` (quiet) sorgt dafür, dass bei Erfolg kein Output erfolgt und der Exit-Code 0 ist (was "healthy" signalisiert).
    *   `interval`, `timeout`, `retries`, `start_period`: Diese Parameter steuern, wie oft der Healthcheck ausgeführt wird, wie lange er auf eine Antwort wartet, wie oft er wiederholt wird, bevor der Container als "unhealthy" markiert wird, und eine anfängliche Wartezeit, bevor die Healthchecks beginnen (um der Datenbank Zeit zum Initialisieren zu geben).
