# Mini-Notizblock Anwendung: Deployment-Beispiele

Dieses Repository enthält Konfigurationen für das Deployment der "Mini-Notizblock"-Beispielanwendung (Frontend, Backend, Datenbank) unter Verwendung von zwei verschiedenen Container-Orchestrierungsplattformen: Docker Swarm und Kubernetes.

## Projekte

1.  **[Docker Swarm Konfiguration](./docker-swarm/README.md)**

    - Dieses Verzeichnis (`docker-swarm`) enthält eine `docker-compose.yml`-Datei, die für das Deployment der Anwendung auf einem Docker Swarm Cluster konfiguriert ist.
    - Es beschreibt die Services, Netzwerke und Volumes, die für den Betrieb der Anwendung im Swarm-Modus erforderlich sind.

2.  **[Kubernetes Konfiguration](./k8s/README.md)**
    - Dieses Verzeichnis (`k8s`) enthält Kubernetes-Manifestdateien (Deployments, Services, ConfigMaps, Secrets) für das Deployment der Anwendung auf einem Kubernetes-Cluster.
    - Die Konfigurationen sind in Unterverzeichnisse für Backend, Datenbank und Frontend strukturiert.

## Anwendungskomponenten

Die Mini-Notizblock-Anwendung besteht typischerweise aus:

- **Frontend:** Eine Benutzeroberfläche (z.B. React), die mit dem Backend interagiert.
- **Backend:** Eine API (z.B. Node.js), die die Geschäftslogik handhabt und mit der Datenbank kommuniziert.
- **Datenbank:** Ein persistenter Speicher (z.B. PostgreSQL) zum Speichern der Notizen.

## Verwendung

Detaillierte Anweisungen zum Deployment und zur Konfiguration der jeweiligen Plattform finden Sie in den `README.md`-Dateien der entsprechenden Unterverzeichnisse:

- Für Docker Swarm: [`docker-swarm/README.md`](./docker-swarm/README.md)
- Für Kubernetes: [`k8s/README.md`](./k8s/README.md)

Stellen Sie sicher, dass die erforderlichen Docker-Images für das Frontend und Backend (`mephisto1339/frontend-image:latest` und `mephisto1339/backend-image:latest`) verfügbar sind, bevor Sie mit dem Deployment beginnen.
