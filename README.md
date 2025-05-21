# Mini-Notizblock Anwendung: Deployment-Beispiele und Kubernetes Einführung

Dieses Repository enthält Konfigurationen für das Deployment der "Mini-Notizblock"-Beispielanwendung (Frontend, Backend, Datenbank) unter Verwendung von zwei verschiedenen Container-Orchestrierungsplattformen: Docker Swarm und Kubernetes. Zusätzlich beinhaltet es Materialien und Reflexionen zur Einführung in Kubernetes.

## Projekte & Inhalte

1.  **[Docker Swarm Konfiguration](./docker-swarm/README.md)**

    - Dieses Verzeichnis (`docker-swarm`) enthält eine `docker-compose.yml`-Datei, die für das Deployment der Anwendung auf einem Docker Swarm Cluster konfiguriert ist.
    - Es beschreibt die Services, Netzwerke und Volumes, die für den Betrieb der Anwendung im Swarm-Modus erforderlich sind.

2.  **[Kubernetes Anwendungsdeployment Konfiguration](./k8s/README.md)**

    - Dieses Verzeichnis (`k8s`) enthält Kubernetes-Manifestdateien (Deployments, Services, ConfigMaps, Secrets) für das Deployment der Mini-Notizblock-Anwendung auf einem Kubernetes-Cluster.
    - Die Konfigurationen sind in Unterverzeichnisse für Backend, Datenbank und Frontend strukturiert.

3.  **[Kubernetes Einführung & Reflexion](./kubernetes/k8s-intro-reflection.md)**
    - Dieses Verzeichnis (`kubernetes`) ist der Bearbeitung und Dokumentation der Aufgaben zur Einführung in Kubernetes gewidmet.
    - Die Datei `k8s-intro-reflection.md` enthält eine Reflexion und Antworten zu grundlegenden Kubernetes-Konzepten, dem Setup eines lokalen Clusters und der Interaktion mittels `kubectl`.

## Anwendungskomponenten (für Deployment-Beispiele)

Die Mini-Notizblock-Anwendung besteht typischerweise aus:

- **Frontend:** Eine Benutzeroberfläche (z.B. React), die mit dem Backend interagiert.
- **Backend:** Eine API (z.B. Node.js), die die Geschäftslogik handhabt und mit der Datenbank kommuniziert.
- **Datenbank:** Ein persistenter Speicher (z.B. PostgreSQL) zum Speichern der Notizen.

## Verwendung

Detaillierte Anweisungen zum Deployment und zur Konfiguration der jeweiligen Plattform finden Sie in den `README.md`-Dateien der entsprechenden Unterverzeichnisse:

- Für Docker Swarm: [`docker-swarm/README.md`](./docker-swarm/README.md)
- Für das Kubernetes Anwendungsdeployment: [`k8s/README.md`](./k8s/README.md)
- Für die Kubernetes Einführung und Reflexion: [`kubernetes/k8s-intro-reflection.md`](./kubernetes/k8s-intro-reflection.md)

Stellen Sie sicher, dass die erforderlichen Docker-Images für das Frontend und Backend (`mephisto1339/frontend-image:latest` und `mephisto1339/backend-image:latest`) verfügbar sind, bevor Sie mit dem Deployment der Anwendung beginnen.
