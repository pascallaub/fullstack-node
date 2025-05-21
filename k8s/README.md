# Kubernetes-Konfiguration für die Mini-Notizblock-Anwendung

Dieses Verzeichnis enthält die Kubernetes-Manifeste für das Deployment der Mini-Notizblock-Anwendung, bestehend aus einem Frontend, einem Backend und einer PostgreSQL-Datenbank.

## Voraussetzungen

- Ein laufender Kubernetes-Cluster (z.B. Docker Desktop, Minikube, GKE, AKS, EKS).
- `kubectl` CLI konfiguriert für den Zugriff auf deinen Cluster.
- Die Docker-Images für Frontend (`mephisto1339/frontend-image:latest`) und Backend (`mephisto1339/backend-image:latest`) müssen in einer Registry verfügbar sein, auf die dein Cluster zugreifen kann (oder lokal im Cluster, falls z.B. Docker Desktop verwendet wird).

## Verzeichnisstruktur

```
k8s/
├── backend/
│   ├── deployment.yaml
│   └── service.yaml
├── database/
│   ├── configmap.yaml  # Enthält das initial_schema.sql
│   ├── deployment.yaml
│   ├── secret.yaml     # Enthält die Datenbank-Credentials
│   └── service.yaml
├── frontend/
│   ├── deployment.yaml
│   └── service.yaml
└── README.md           # Diese Datei
```

## Komponenten

Alle Komponenten werden im Namespace `myapp` deployed.

### 1. Namespace

Ein Namespace `myapp` wird verwendet, um die Ressourcen dieser Anwendung zu isolieren.
Erstellung (falls noch nicht geschehen):

```bash
kubectl create namespace myapp
```

### 2. Datenbank (PostgreSQL)

- **ConfigMap (`database/configmap.yaml`)**:
  - Name: `db-schema`
  - Enthält das SQL-Skript `initial_schema.sql` zur Erstellung der `notes`-Tabelle. Dieses Skript wird beim ersten Start des Datenbankcontainers ausgeführt.
- **Secret (`database/secret.yaml`)**:
  - Name: `db-credentials`
  - Enthält das `POSTGRES_PASSWORD` für den Datenbankbenutzer. Es wird empfohlen, die Werte in dieser Datei (Base64-kodiert) vor dem Anwenden anzupassen oder die Datei als Vorlage zu verwenden und das Secret manuell mit `kubectl create secret generic` zu erstellen.
- **Deployment (`database/deployment.yaml`)**:
  - Name: `database`
  - Verwendet das Image `postgres:17-alpine`.
  - Definiert Umgebungsvariablen:
    - `POSTGRES_USER`: `meinnotizblockuser`
    - `POSTGRES_PASSWORD`: Wird aus dem Secret `db-credentials` bezogen.
    - `POSTGRES_DB`: `notizblock_prod_db` (diese Datenbank wird automatisch erstellt).
  - Verwendet ein `emptyDir`-Volume für `/var/lib/postgresql/data`. **Achtung:** Daten gehen verloren, wenn der Pod neu gestartet wird. Für persistente Speicherung sollte ein `PersistentVolumeClaim` verwendet werden.
  - Ein benutzerdefiniertes `command` und `args` stellt sicher, dass das Datenverzeichnis vor dem Start von PostgreSQL geleert wird, um `initdb` bei jedem Start mit `emptyDir` zu erzwingen.
  - Mountet die `db-schema`-ConfigMap nach `/docker-entrypoint-initdb.d/`, damit das `initial_schema.sql`-Skript automatisch ausgeführt wird.
  - Definiert Readiness- und Liveness-Probes.
- **Service (`database/service.yaml`)**:
  - Name: `database`
  - Typ: `ClusterIP` (Standard)
  - Macht den PostgreSQL-Server auf Port `5432` für andere Pods im Cluster (innerhalb des `myapp`-Namespace unter dem DNS-Namen `database`) verfügbar.

### 3. Backend (Node.js API)

- **Deployment (`backend/deployment.yaml`)**:
  - Name: `backend`
  - Verwendet das Image `mephisto1339/backend-image:latest`.
  - Definiert Umgebungsvariablen für die Datenbankverbindung:
    - `DB_HOST`: `database` (verweist auf den Datenbank-Service)
    - `DB_PORT`: `5432`
    - `DB_USER`: `meinnotizblockuser`
    - `DB_NAME`: `notizblock_prod_db`
    - `DB_PASSWORD`: Wird aus dem Secret `db-credentials` bezogen.
  - Lauscht auf Port `3000`.
- **Service (`backend/service.yaml`)**:
  - Name: `backend-service`
  - Typ: `ClusterIP` (Standard)
  - Macht die Backend-API auf Port `3000` für andere Pods im Cluster verfügbar (z.B. für das Frontend).

### 4. Frontend (React/Static)

- **Deployment (`frontend/deployment.yaml`)**:
  - Name: `frontend`
  - Verwendet das Image `mephisto1339/frontend-image:latest`.
  - Der Container (vermutlich Nginx oder ein ähnlicher Webserver) lauscht auf Port `80`.
  - Enthält eine ConfigMap `nginx-config` für die Nginx-Konfiguration, die das Backend-API-Routing (`/api`) zum `backend-service` übernimmt.
- **Service (`frontend/service.yaml`)**:
  - Name: `frontend-service`
  - Typ: `LoadBalancer` (um die Anwendung extern zugänglich zu machen. Für lokale Cluster wie Docker Desktop oder Minikube wird dies oft über einen NodePort oder einen speziellen Mechanismus des lokalen Clusters realisiert).
  - Macht das Frontend auf Port `80` extern verfügbar.

## Deployment-Reihenfolge

Es wird empfohlen, die Ressourcen in der folgenden Reihenfolge anzuwenden, um Abhängigkeiten korrekt aufzulösen:

1.  **Namespace (falls noch nicht erstellt):**
    ```bash
    kubectl create namespace myapp
    ```
2.  **Datenbank-Ressourcen:**
    ```bash
    kubectl apply -f k8s/database/secret.yaml -n myapp
    kubectl apply -f k8s/database/configmap.yaml -n myapp
    kubectl apply -f k8s/database/deployment.yaml -n myapp
    kubectl apply -f k8s/database/service.yaml -n myapp
    ```
3.  **Backend-Ressourcen:**
    ```bash
    kubectl apply -f k8s/backend/deployment.yaml -n myapp
    kubectl apply -f k8s/backend/service.yaml -n myapp
    ```
4.  **Frontend-Ressourcen:**
    ```bash
    kubectl apply -f k8s/frontend/deployment.yaml -n myapp # Enthält die ConfigMap für Nginx
    kubectl apply -f k8s/frontend/service.yaml -n myapp
    ```

Alternativ können alle YAML-Dateien in einem Verzeichnis auf einmal angewendet werden (wobei `kubectl` versucht, die Reihenfolge intelligent zu wählen, aber die explizite Reihenfolge ist sicherer für Abhängigkeiten wie Secrets und ConfigMaps):

```bash
kubectl apply -f k8s/database -n myapp
kubectl apply -f k8s/backend -n myapp
kubectl apply -f k8s/frontend -n myapp
```

Oder für das gesamte `k8s`-Verzeichnis (rekursiv, aber die Reihenfolge ist dann weniger kontrolliert):

```bash
kubectl apply -R -f k8s -n myapp
```

## Zugriff auf die Anwendung

Nachdem alle Pods laufen und der `frontend-service` vom Typ `LoadBalancer` eine externe IP-Adresse erhalten hat (oder ein NodePort zugewiesen wurde), kann die Anwendung über diese Adresse im Browser aufgerufen werden.

Den Status der Services und die externe IP des Frontends abrufen:

```bash
kubectl get services -n myapp
```

Suche nach dem `frontend-service` und seiner `EXTERNAL-IP`. Wenn `EXTERNAL-IP` auf `<pending>` steht, warte einige Minuten. Bei lokalen Clustern wie Minikube verwende `minikube service frontend-service -n myapp --url`. Für Docker Desktop ist der Dienst oft unter `localhost:<PORT>` erreichbar, wobei `<PORT>` der Port ist, der in der `kubectl get services` Ausgabe für den `frontend-service` angezeigt wird.

## Wichtige Hinweise

- **Datenpersistenz:** Die aktuelle Datenbankkonfiguration verwendet `emptyDir`, was bedeutet, dass alle Daten verloren gehen, wenn der Datenbank-Pod neu gestartet wird. Für eine produktive Umgebung sollte dies durch `PersistentVolume` und `PersistentVolumeClaim` ersetzt werden.
- **Secrets:** Das `database/secret.yaml` enthält Platzhalter oder Beispielwerte. Stelle sicher, dass du sichere, Base64-kodierte Passwörter verwendest und die Datei entsprechend anpasst oder das Secret manuell erstellst.
- **Images:** Stelle sicher, dass die referenzierten Docker-Images (`mephisto1339/frontend-image:latest`, `mephisto1339/backend-image:latest`) für deinen Kubernetes-Cluster erreichbar sind.

## Troubleshooting

- **Pods nicht bereit (`Pending`, `CrashLoopBackOff`, `Error`):**
  ```bash
  kubectl get pods -n myapp
  kubectl describe pod <pod-name> -n myapp
  kubectl logs <pod-name> -n myapp
  kubectl logs <pod-name> -c <container-name> -n myapp # Falls mehrere Container im Pod
  kubectl logs <pod-name> -c <container-name> -n myapp --previous # Für gecrashte Container
  ```
- **Service nicht erreichbar:**
  Überprüfe die Selektoren im Service und die Labels der Pods.
  Überprüfe die Endpunkte des Services: `kubectl get endpoints <service-name> -n myapp`.

```

Du kannst diese `README.md` als Grundlage verwenden und bei Bedarf weitere Details oder spezifische Anweisungen für deine Umgebung hinzufügen.<!-- filepath: c:\Users\nutri\TechstarterWorkspace\node-container\k8s\README.md -->
# Kubernetes-Konfiguration für die Mini-Notizblock-Anwendung

Dieses Verzeichnis enthält die Kubernetes-Manifeste für das Deployment der Mini-Notizblock-Anwendung, bestehend aus einem Frontend, einem Backend und einer PostgreSQL-Datenbank.

## Voraussetzungen

*   Ein laufender Kubernetes-Cluster (z.B. Docker Desktop, Minikube, GKE, AKS, EKS).
*   `kubectl` CLI konfiguriert für den Zugriff auf deinen Cluster.
*   Die Docker-Images für Frontend (`mephisto1339/frontend-image:latest`) und Backend (`mephisto1339/backend-image:latest`) müssen in einer Registry verfügbar sein, auf die dein Cluster zugreifen kann (oder lokal im Cluster, falls z.B. Docker Desktop verwendet wird).

## Verzeichnisstruktur

```

k8s/
├── backend/
│ ├── deployment.yaml
│ └── service.yaml
├── database/
│ ├── configmap.yaml # Enthält das initial_schema.sql
│ ├── deployment.yaml
│ ├── secret.yaml # Enthält die Datenbank-Credentials
│ └── service.yaml
├── frontend/
│ ├── deployment.yaml
│ └── service.yaml
└── README.md # Diese Datei

````

## Komponenten

Alle Komponenten werden im Namespace `myapp` deployed.

### 1. Namespace

Ein Namespace `myapp` wird verwendet, um die Ressourcen dieser Anwendung zu isolieren.
Erstellung (falls noch nicht geschehen):
```bash
kubectl create namespace myapp
````

### 2. Datenbank (PostgreSQL)

- **ConfigMap (`database/configmap.yaml`)**:
  - Name: `db-schema`
  - Enthält das SQL-Skript `initial_schema.sql` zur Erstellung der `notes`-Tabelle. Dieses Skript wird beim ersten Start des Datenbankcontainers ausgeführt.
- **Secret (`database/secret.yaml`)**:
  - Name: `db-credentials`
  - Enthält das `POSTGRES_PASSWORD` für den Datenbankbenutzer. Es wird empfohlen, die Werte in dieser Datei (Base64-kodiert) vor dem Anwenden anzupassen oder die Datei als Vorlage zu verwenden und das Secret manuell mit `kubectl create secret generic` zu erstellen.
- **Deployment (`database/deployment.yaml`)**:
  - Name: `database`
  - Verwendet das Image `postgres:17-alpine`.
  - Definiert Umgebungsvariablen:
    - `POSTGRES_USER`: `meinnotizblockuser`
    - `POSTGRES_PASSWORD`: Wird aus dem Secret `db-credentials` bezogen.
    - `POSTGRES_DB`: `notizblock_prod_db` (diese Datenbank wird automatisch erstellt).
  - Verwendet ein `emptyDir`-Volume für `/var/lib/postgresql/data`. **Achtung:** Daten gehen verloren, wenn der Pod neu gestartet wird. Für persistente Speicherung sollte ein `PersistentVolumeClaim` verwendet werden.
  - Ein benutzerdefiniertes `command` und `args` stellt sicher, dass das Datenverzeichnis vor dem Start von PostgreSQL geleert wird, um `initdb` bei jedem Start mit `emptyDir` zu erzwingen.
  - Mountet die `db-schema`-ConfigMap nach `/docker-entrypoint-initdb.d/`, damit das `initial_schema.sql`-Skript automatisch ausgeführt wird.
  - Definiert Readiness- und Liveness-Probes.
- **Service (`database/service.yaml`)**:
  - Name: `database`
  - Typ: `ClusterIP` (Standard)
  - Macht den PostgreSQL-Server auf Port `5432` für andere Pods im Cluster (innerhalb des `myapp`-Namespace unter dem DNS-Namen `database`) verfügbar.

### 3. Backend (Node.js API)

- **Deployment (`backend/deployment.yaml`)**:
  - Name: `backend`
  - Verwendet das Image `mephisto1339/backend-image:latest`.
  - Definiert Umgebungsvariablen für die Datenbankverbindung:
    - `DB_HOST`: `database` (verweist auf den Datenbank-Service)
    - `DB_PORT`: `5432`
    - `DB_USER`: `meinnotizblockuser`
    - `DB_NAME`: `notizblock_prod_db`
    - `DB_PASSWORD`: Wird aus dem Secret `db-credentials` bezogen.
  - Lauscht auf Port `3000`.
- **Service (`backend/service.yaml`)**:
  - Name: `backend-service`
  - Typ: `ClusterIP` (Standard)
  - Macht die Backend-API auf Port `3000` für andere Pods im Cluster verfügbar (z.B. für das Frontend).

### 4. Frontend (React/Static)

- **Deployment (`frontend/deployment.yaml`)**:
  - Name: `frontend`
  - Verwendet das Image `mephisto1339/frontend-image:latest`.
  - Der Container (vermutlich Nginx oder ein ähnlicher Webserver) lauscht auf Port `80`.
  - Enthält eine ConfigMap `nginx-config` für die Nginx-Konfiguration, die das Backend-API-Routing (`/api`) zum `backend-service` übernimmt.
- **Service (`frontend/service.yaml`)**:
  - Name: `frontend-service`
  - Typ: `LoadBalancer` (um die Anwendung extern zugänglich zu machen. Für lokale Cluster wie Docker Desktop oder Minikube wird dies oft über einen NodePort oder einen speziellen Mechanismus des lokalen Clusters realisiert).
  - Macht das Frontend auf Port `80` extern verfügbar.

## Deployment-Reihenfolge

Es wird empfohlen, die Ressourcen in der folgenden Reihenfolge anzuwenden, um Abhängigkeiten korrekt aufzulösen:

1.  **Namespace (falls noch nicht erstellt):**
    ```bash
    kubectl create namespace myapp
    ```
2.  **Datenbank-Ressourcen:**
    ```bash
    kubectl apply -f k8s/database/secret.yaml -n myapp
    kubectl apply -f k8s/database/configmap.yaml -n myapp
    kubectl apply -f k8s/database/deployment.yaml -n myapp
    kubectl apply -f k8s/database/service.yaml -n myapp
    ```
3.  **Backend-Ressourcen:**
    ```bash
    kubectl apply -f k8s/backend/deployment.yaml -n myapp
    kubectl apply -f k8s/backend/service.yaml -n myapp
    ```
4.  **Frontend-Ressourcen:**
    ```bash
    kubectl apply -f k8s/frontend/deployment.yaml -n myapp # Enthält die ConfigMap für Nginx
    kubectl apply -f k8s/frontend/service.yaml -n myapp
    ```

Alternativ können alle YAML-Dateien in einem Verzeichnis auf einmal angewendet werden (wobei `kubectl` versucht, die Reihenfolge intelligent zu wählen, aber die explizite Reihenfolge ist sicherer für Abhängigkeiten wie Secrets und ConfigMaps):

```bash
kubectl apply -f k8s/database -n myapp
kubectl apply -f k8s/backend -n myapp
kubectl apply -f k8s/frontend -n myapp
```

Oder für das gesamte `k8s`-Verzeichnis (rekursiv, aber die Reihenfolge ist dann weniger kontrolliert):

```bash
kubectl apply -R -f k8s -n myapp
```

## Zugriff auf die Anwendung

Nachdem alle Pods laufen und der `frontend-service` vom Typ `LoadBalancer` eine externe IP-Adresse erhalten hat (oder ein NodePort zugewiesen wurde), kann die Anwendung über diese Adresse im Browser aufgerufen werden.

Den Status der Services und die externe IP des Frontends abrufen:

```bash
kubectl get services -n myapp
```

Suche nach dem `frontend-service` und seiner `EXTERNAL-IP`. Wenn `EXTERNAL-IP` auf `<pending>` steht, warte einige Minuten. Bei lokalen Clustern wie Minikube verwende `minikube service frontend-service -n myapp --url`. Für Docker Desktop ist der Dienst oft unter `localhost:<PORT>` erreichbar, wobei `<PORT>` der Port ist, der in der `kubectl get services` Ausgabe für den `frontend-service` angezeigt wird.

## Wichtige Hinweise

- **Datenpersistenz:** Die aktuelle Datenbankkonfiguration verwendet `emptyDir`, was bedeutet, dass alle Daten verloren gehen, wenn der Datenbank-Pod neu gestartet wird. Für eine produktive Umgebung sollte dies durch `PersistentVolume` und `PersistentVolumeClaim` ersetzt werden.
- **Secrets:** Das `database/secret.yaml` enthält Platzhalter oder Beispielwerte. Stelle sicher, dass du sichere, Base64-kodierte Passwörter verwendest und die Datei entsprechend anpasst oder das Secret manuell erstellst.
- **Images:** Stelle sicher, dass die referenzierten Docker-Images (`mephisto1339/frontend-image:latest`, `mephisto1339/backend-image:latest`) für deinen Kubernetes-Cluster erreichbar sind.

## Troubleshooting

- **Pods nicht bereit (`Pending`, `CrashLoopBackOff`, `Error`):**
  ```bash
  kubectl get pods -n myapp
  kubectl describe pod <pod-name> -n myapp
  kubectl logs <pod-name> -n myapp
  kubectl logs <pod-name> -c <container-name> -n myapp # Falls mehrere Container im Pod
  kubectl logs <pod-name> -c <container-name> -n myapp --previous # Für gecrashte Container
  ```
- **Service nicht erreichbar:**
  Überprüfe die Selektoren im Service und die Labels der Pods.
  Überprüfe die Endpunkte des Services: `kubectl get endpoints <service-name> -n myapp`.

```

Du kannst diese `README.md` als Grundlage verwenden und bei Bedarf weitere Details oder spezifische Anweisungen für deine Umgebung hinzufügen.
```
