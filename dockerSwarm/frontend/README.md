# Mini-Notizblock

Eine einfache Notizblock-Anwendung, erstellt mit React und Vite.

## Funktionen

*   Hinzufügen neuer Notizen
*   Löschen bestehender Notizen

## Verwendete Technologien

*   React
*   Vite
*   JavaScript
*   HTML
*   CSS (Inline-Styles)

## Setup und Installation

1.  **Klone das Repository:**
    ```bash
    git clone <repository-url>
    cd vite-project
    ```
2.  **Installiere die Abhängigkeiten:**
    ```bash
    npm install
    ```

## Verfügbare Skripte

Im Projektverzeichnis kannst du folgende Befehle ausführen:

*   **`npm run dev`**
    Startet die Anwendung im Entwicklungsmodus.
    Öffne [http://localhost:5173](http://localhost:5173) (oder den in der Konsole angezeigten Port), um sie im Browser anzuzeigen.

*   **`npm run build`**
    Erstellt die Anwendung für die Produktion im `dist`-Ordner.

*   **`npm run lint`**
    Führt ESLint aus, um Code-Stil-Probleme zu finden.

*   **`npm run preview`**
    Startet einen lokalen Server, um den Produktionsbuild (`dist`-Ordner) zu testen.

## Docker Deployment

Das Projekt enthält ein [Dockerfile](c:\Users\nutri\TechstarterWorkspace\node-container\vite-project\Dockerfile) zur einfachen Bereitstellung mit Nginx.

1.  **Erstelle den Produktionsbuild:**
    ```bash
    npm run build
    ```
2.  **Baue das Docker-Image:**
    ```bash
    docker build -t mini-notizblock .
    ```
3.  **Starte den Docker-Container:**
    ```bash
    docker run -d -p 8080:80 mini-notizblock
    ```
    Die Anwendung ist dann unter [http://localhost:8080](http://localhost:8080) erreichbar.
