# Mini-Notizblock - Fullstack Kubernetes Application with Helm

## Projektbeschreibung

Dieses Projekt demonstriert die Deployment einer vollständigen Fullstack-Anwendung in Kubernetes mit Helm Charts. Die Anwendung besteht aus:

- **Frontend**: React Anwendung (Nginx)
- **Backend**: Node.js REST API mit Express
- **Datenbank**: PostgreSQL (Bitnami Helm Chart)
- **Ingress**: Nginx Ingress Controller für externen Zugriff
- **Schema-Migration**: Automatisierte Datenbank-Initialisierung mit Helm Hooks

## Technologie-Stack

- **Container**: Docker
- **Orchestration**: Kubernetes
- **Package Manager**: Helm 3
- **Ingress**: Nginx Ingress Controller
- **Database**: PostgreSQL 17 (Bitnami Chart)
- **Frontend**: Nginx + Static Files
- **Backend**: Node.js + Express + PostgreSQL
- **CI/CD**: Automatische Schema-Migration via Helm Jobs

## Projektaufgabe und CI/CD Pipeline

### 1. Helm Release Installation

![Helm List](public/helmList.png)

_Screenshot zeigt erfolgreich installierte Helm Releases mit `helm list`_

### 2. Kubernetes Objekte

![Kubectl All](public/kubectlAll.png)

_Screenshot zeigt alle deployten Kubernetes-Objekte inklusive Pods, Services, Deployments und PVC_

### 3. Job-Status (Schema-Migration)

![Job Status](public/JobStatus.png)

_Screenshot zeigt den automatischen Database-Init-Job, der das Schema erstellt_

### 4. Anwendung funktioniert

![Curl Test](public/curl.png)

_Screenshot zeigt erfolgreichen API-Zugriff über Ingress mit `curl http://myapp.local/api/notes`_

### 5. Helm Upgrade

![Upgrade](public/upgrade.png)

_Screenshot zeigt Upgrade mit geänderten Replikazahlen_

### 6. Deinstallation

![Deinstall](public/deinstall.png)

_Screenshot zeigt vollständige Deinstallation aller Komponenten_

## CI/CD Pipeline-Beschreibung

In diesem Projekt wurde eine vollständige CI/CD-Pipeline mit GitHub Actions implementiert, die das Bauen, Taggen und Deployment von Docker-Images für Frontend und Backend automatisiert.

### Aufgabenbeschreibung

Die Hauptaufgabe bestand darin:

- Entwicklung einer Fullstack-Applikation mit React-Frontend, Node.js-Backend und PostgreSQL-Datenbank
- Deployment der Anwendung mit Kubernetes und Helm
- Implementierung einer sicheren CI-Pipeline für automatisiertes Building und Pushing von Docker-Images
- Sichere Handhabung von Credentials in der CI-Umgebung
- Multi-Stage Docker-Builds für optimierte Container-Images

### CI-Pipeline-Workflow

Die CI-Pipeline (in `.github/workflows/ci.yml`) führt folgende Schritte aus:

1. **Checkout**: Auschecken des aktuellen Repository-Stands

   ```yaml
   - uses: actions/checkout@v4
   ```

2. **Authentifizierung bei Docker Hub**: Sicheres Login mit verschlüsselten GitHub Secrets

   ```yaml
   - name: Login to Docker Hub
     uses: docker/login-action@v3
     with:
       username: ${{ secrets.DOCKERHUB_USERNAME }}
       password: ${{ secrets.DOCKERHUB_TOKEN }}
   ```

3. **Docker-Image bauen und taggen**: Multi-Stage Builds mit eindeutigen Tags

   ```yaml
   - name: Build and push Frontend image
     uses: docker/build-push-action@v5
     with:
       context: ./frontend
       push: true
       tags: mephisto1339/frontend-image:latest,mephisto1339/frontend-image:${{ github.ref_name }},mephisto1339/frontend-image:sha-${{ github.sha }}
   ```

4. **Helm Chart aktualisieren**: Automatisches Update der values.yaml mit neuem Image-Tag
   ```yaml
   - name: Update Helm values with new image tags
     run: sed -i "s|tag:.*|tag: sha-${{ github.sha }}|" myapp-chart/values.yaml
   ```

## Helm Chart Struktur

```
myapp-chart/
├── Chart.yaml                   # Chart Metadaten und Dependencies
├── values.yaml                  # Standard-Konfiguration (NICHT für Production!)
├── values-example.yaml          # Sichere Beispiel-Konfiguration
├── templates/
│   ├── namespace.yaml          # Namespace Definition
│   ├── backend-deployment.yaml # Backend Deployment
│   ├── frontend-deployment.yaml# Frontend Deployment
│   ├── backend-service.yaml    # Backend Service
│   ├── frontend-service.yaml   # Frontend Service
│   ├── ingress.yaml            # Ingress Configuration
│   ├── secrets.yaml            # Database Credentials
│   ├── frontend-configmap.yaml # Nginx Configuration
│   ├── db-init-job.yaml        # Automatische Schema-Migration (Helm Hook)
│   └── _helpers.tpl            # Template-Hilfsfunktionen
└── charts/                     # Abhängigkeiten (PostgreSQL wird extern installiert)
```

## Voraussetzungen

### System-Requirements

```bash
# Kubernetes Cluster (Docker Desktop, Minikube, etc.)
kubectl version

# Helm 3 installiert
helm version

# Docker für Image-Building
docker --version
```

### Nginx Ingress Controller installieren

```bash
# Ingress Controller installieren
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Installation überprüfen
kubectl get pods -n ingress-nginx

# Für lokale Entwicklung (Docker Desktop)
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/k8s
```

### 2. Dependencies vorbereiten

```bash
# Bitnami Repository hinzufügen
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Chart Dependencies aktualisieren
helm dependency update myapp-chart
```

### 3. PostgreSQL installieren (Separate Installation empfohlen)

```bash
# PostgreSQL im korrekten Namespace installieren
helm install myapp-postgresql bitnami/postgresql \
  --namespace myapp \
  --create-namespace \
  --set auth.username=meinnotizblockuser \
  --set auth.password=EinSehrSicheresPasswort! \
  --set auth.database=notizblock_prod_db \
  --set persistence.enabled=true \
  --set persistence.size=1Gi \
  --set primary.resources.limits.memory=1Gi \
  --set primary.resources.limits.cpu=1000m \
  --set primary.resources.requests.memory=512Mi \
  --set primary.resources.requests.cpu=500m
```

### 4. Anwendung installieren

```bash
# Mit sicheren Credentials (Development)
helm install myapp-release myapp-chart \
  --create-namespace \
  --set backend.image.repository=mephisto1339/backend-image \
  --set frontend.image.repository=mephisto1339/frontend-image \
  --set backend.env.dbUser=meinnotizblockuser \
  --set backend.env.dbName=notizblock_prod_db \
  --set secrets.dbCredentials.data.POSTGRES_PASSWORD=EinSehrSicheresPasswort! \
  --set secrets.dbCredentials.data.POSTGRES_USER=meinnotizblockuser \
  --set secrets.dbCredentials.data.POSTGRES_DB=notizblock_prod_db
```

### 5. Hosts-Datei konfigurieren

```bash
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts
127.0.0.1 myapp.local
```

## Automatische Schema-Migration

Das Chart enthält einen automatischen Database-Init-Job (`templates/db-init-job.yaml`), der:

- **Helm Hook**: Läuft automatisch nach `helm install` und `helm upgrade`
- **Wartet auf PostgreSQL**: Verwendet `pg_isready` für Health-Check
- **Erstellt Schema**: notes-Tabelle mit Triggern für Timestamps
- **Fügt Beispieldaten ein**: Nur wenn Tabelle leer ist
- **Auto-Cleanup**: Job wird nach erfolgreichem Abschluss gelöscht

```yaml
annotations:
  "helm.sh/hook": post-install,post-upgrade
  "helm.sh/hook-weight": "1"
  "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
```

## Zugriff auf die Anwendung

- **Frontend**: http://myapp.local/
- **Backend API**: http://myapp.local/api/notes
- **Health Check**: http://myapp.local/api/health

### API-Endpunkte

```bash
# Alle Notizen abrufen
curl http://myapp.local/api/notes

# Neue Notiz erstellen
curl -X POST http://myapp.local/api/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Neue Notiz via API", "is_done": false}'

# Notiz aktualisieren
curl -X PUT http://myapp.local/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Aktualisierte Notiz", "is_done": true}'

# Notiz löschen
curl -X DELETE http://myapp.local/api/notes/1
```

## Wartung und Updates

### Upgrade durchführen

```bash
# Replikazahlen ändern
helm upgrade myapp-release myapp-chart \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=3

# Image-Tags aktualisieren
helm upgrade myapp-release myapp-chart \
  --set backend.image.tag=v2.0.0 \
  --set frontend.image.tag=v2.0.0

# Rollout Status überwachen
kubectl rollout status deployment/myapp-release-myapp-chart-backend -n myapp
kubectl rollout status deployment/myapp-release-myapp-chart-frontend -n myapp
```

### Logs anzeigen

```bash
# Backend Logs (alle Replicas)
kubectl logs -f -n myapp -l app.kubernetes.io/component=backend

# Frontend Logs
kubectl logs -f -n myapp -l app.kubernetes.io/component=frontend

# PostgreSQL Logs
kubectl logs -f -n myapp myapp-postgresql-0

# Database-Init-Job Logs (bei Fehlern)
kubectl logs -n myapp job/myapp-release-myapp-chart-db-init
```

### Status überwachen

```bash
# Alle Ressourcen anzeigen
kubectl get all -n myapp

# Persistent Volumes
kubectl get pvc -n myapp

# Ingress Status
kubectl get ingress -n myapp

# Events (bei Problemen)
kubectl get events -n myapp --sort-by='.lastTimestamp' | tail -20
```

## Deinstallation

```bash
# Anwendung deinstallieren
helm uninstall myapp-release

# PostgreSQL deinstallieren
helm uninstall myapp-postgresql

# Namespace löschen (optional, entfernt auch PVCs)
kubectl delete namespace myapp

# Überprüfung
kubectl get all -n myapp
```

## Sicherheit - Handhabung sensibler Daten

⚠️ **KRITISCHER SICHERHEITSHINWEIS**: Die `values.yaml` in diesem Repository enthält Beispiel-Credentials und ist **NICHT für Production geeignet**!

### Für die Abgabe/Demonstration

Die aktuelle `values.yaml` enthält Beispiel-Passwörter zur einfachen Demonstration. In einem echten Projekt würden diese Werte niemals in Git committed werden.

### Production-sichere Alternativen

#### Option 1: External Secrets Operator (Empfohlen)

```bash
# External Secrets installieren
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace

# Secrets aus Azure Key Vault, AWS Secrets Manager, etc.
```

#### Option 2: Helm Secrets Plugin

```bash
# Helm Secrets Plugin installieren
helm plugin install https://github.com/jkroepke/helm-secrets

# Verschlüsselte values erstellen
helm secrets enc values-prod.yaml

# Deployment mit verschlüsselten Werten
helm secrets install myapp-release myapp-chart -f values-prod.yaml
```

#### Option 3: --set Parameter zur Laufzeit

```bash
# Sichere Deployment-Praxis
helm install myapp-release myapp-chart \
  --set secrets.dbCredentials.data.POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --set secrets.dbCredentials.data.POSTGRES_USER=produser \
  --set secrets.dbCredentials.data.POSTGRES_DB=proddb \
  --set backend.image.repository=your-registry/backend \
  --set frontend.image.repository=your-registry/frontend
```

#### Option 4: Separate Secret-Erstellung

```bash
# Secret manuell erstellen
kubectl create secret generic db-credentials \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=POSTGRES_USER=produser \
  --from-literal=POSTGRES_DB=proddb \
  -n myapp

# Chart ohne Secret-Template deployen
helm install myapp-release myapp-chart --set secrets.dbCredentials.create=false
```

### values-example.yaml für sichere Referenz

Eine sichere `values-example.yaml` ist verfügbar, die zeigt, wie sensible Daten gehandhabt werden sollten:

```yaml
# Kopieren und anpassen
cp values-example.yaml values-prod.yaml

# Sensible Werte ersetzen
# NIEMALS values-prod.yaml in Git committen!
echo "values-prod.yaml" >> .gitignore
```

## Monitoring und Debugging

### Health Checks

```bash
# Application Health
curl http://myapp.local/api/health

# Database Connectivity
kubectl exec -it -n myapp deployment/myapp-release-myapp-chart-backend -- \
  nc -zv myapp-postgresql 5432

# Pod Resource Usage
kubectl top pods -n myapp
```

### Troubleshooting

#### Backend kann nicht auf Database zugreifen

```bash
# DNS-Resolution testen
kubectl exec -it -n myapp deployment/myapp-release-myapp-chart-backend -- \
  nslookup myapp-postgresql

# Database Credentials überprüfen
kubectl get secret db-credentials -n myapp -o yaml

# PostgreSQL Logs
kubectl logs -f -n myapp myapp-postgresql-0
```

#### Ingress funktioniert nicht

```bash
# Ingress Controller Status
kubectl get pods -n ingress-nginx

# Ingress Details
kubectl describe ingress myapp-release-myapp-chart-ingress -n myapp

# Service Endpoints
kubectl get endpoints -n myapp
```

#### Schema-Migration fehlgeschlagen

```bash
# Job-Status prüfen
kubectl get jobs -n myapp

# Job-Logs anzeigen
kubectl logs -n myapp job/myapp-release-myapp-chart-db-init

# Manuell in Database einloggen
kubectl exec -it -n myapp myapp-postgresql-0 -- \
  psql -U meinnotizblockuser -d notizblock_prod_db -c "\dt"
```

## Entwicklung und Testing

### Lokale Entwicklung

```bash
# Port-Forward für direkte Database-Verbindung
kubectl port-forward -n myapp svc/myapp-postgresql 5432:5432

# Port-Forward für Backend-Testing
kubectl port-forward -n myapp svc/myapp-release-myapp-chart-backend 3000:3000

# Port-Forward für Frontend-Testing
kubectl port-forward -n myapp svc/myapp-release-myapp-chart-frontend 8080:80
```

### Testing der API

```bash
# Automatisierte Tests
curl -s http://myapp.local/api/notes | jq '.[0].text'

# Load Testing mit Apache Bench
ab -n 100 -c 10 http://myapp.local/api/notes

# Health Check Monitoring
watch -n 5 'curl -s http://myapp.local/api/health | jq'
```

## Chart-Entwicklung

### Template-Testing

```bash
# Template-Rendering testen
helm template myapp-release myapp-chart --debug

# Syntax-Validierung
helm lint myapp-chart

# Dry-run Installation
helm install myapp-release myapp-chart --dry-run --debug
```

### Werte-Override

```bash
# Verschiedene Environments
helm install myapp-dev myapp-chart -f values-dev.yaml
helm install myapp-staging myapp-chart -f values-staging.yaml
helm install myapp-prod myapp-chart -f values-prod.yaml
```

## Lizenz

MIT License - siehe LICENSE-Datei für Details.

## Support und Beitrag

- **Issues**: Für Bugs und Feature-Requests
- **Pull Requests**: Willkommen für Verbesserungen
- **Dokumentation**: Verbesserungen der README sind erwünscht

---

**Hinweis**: Diese Dokumentation ist Teil einer Kubernetes/Helm-Abgabe und demonstriert Best Practices für Container-Orchestrierung, Package Management und sichere Credential-Handhabung in Kubernetes-Umgebungen.

---

## Reflexionsfragen & Antworten

**1. Zweck der zwei Stages (Builder und Runner) im Multi-Stage Dockerfile für die React App und Vorteile für CI/CD**

Im Multi-Stage Dockerfile für die React App gibt es zwei Hauptstufen:

- **Builder-Stage:** Hier werden alle Build-Tools (z.B. Node.js, npm/yarn) verwendet, um den Produktions-Build der React-Anwendung zu erstellen (`npm run build`). Diese Stage enthält alle Abhängigkeiten, die nur für das Bauen benötigt werden.
- **Runner-Stage:** In dieser Stage wird ein leichtgewichtiger Nginx-Container verwendet, in den nur die gebauten, statischen Dateien aus der Builder-Stage kopiert werden. Build-Tools und Quellcode sind hier nicht mehr enthalten.

**Vorteile für CI/CD:**  
Dieser Ansatz reduziert die Größe des finalen Images erheblich, da nur die wirklich benötigten Artefakte enthalten sind. Das erhöht die Sicherheit (keine Build-Tools im Produktiv-Container), beschleunigt Deployments und minimiert Angriffsflächen.

---

**2. Sichere Speicherung der Docker Hub Zugangsdaten in der CI-Plattform**

Die Zugangsdaten (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`) wurden als **GitHub Secrets** in den Repository-Einstellungen hinterlegt.  
In der CI-Pipeline werden diese Secrets als Umgebungsvariablen referenziert und niemals im Klartext im Repository oder in der Pipeline-Konfiguration gespeichert.

**Warum ist das sicherer?**  
Secrets sind verschlüsselt gespeichert, werden nur zur Laufzeit der Pipeline entschlüsselt und sind für niemanden im Code oder in der Historie sichtbar. Würden die Zugangsdaten direkt im Repository stehen, könnten sie leicht kompromittiert werden (z.B. durch versehentliches Teilen oder Forks).

---

**3. Abfolge der vier Hauptschritte in der erweiterten CI-Pipeline**

1. **Code holen:**  
   Die Pipeline checkt den aktuellen Stand des Repositories aus (z.B. via `actions/checkout`).
2. **Image bauen:**  
   Das Docker-Image für das Frontend wird mit dem Multi-Stage Dockerfile gebaut (`docker build ...`).
3. **Login:**  
   Die Pipeline meldet sich mit den gespeicherten Secrets sicher bei Docker Hub an (`docker login ...`).
4. **Image pushen:**  
   Das gebaute Image wird mit einem eindeutigen Tag zu Docker Hub hochgeladen (`docker push ...`).

Jeder Schritt ist notwendig, um sicherzustellen, dass immer der aktuelle Code als Image gebaut und für Deployments bereitgestellt wird.

---

**4. Verwendete Informationen für das Image-Tag und deren Bedeutung**

Als Image-Tag werden mehrere Informationen kombiniert:

- `latest` (für das jeweils aktuellste Image)
- Branch-Name (z.B. `main`, `feature-xyz`)
- Commit-Hash (z.B. `sha-abcdef1234`)

**Warum ist ein eindeutiges Tag wichtig?**  
Ein eindeutiges Tag stellt sicher, dass jedes Image eindeutig einer bestimmten Code-Version zugeordnet werden kann. Das verhindert Verwechslungen, ermöglicht reproduzierbare Deployments und erleichtert das Debugging, da immer klar ist, welcher Code in welchem Container läuft.

---

**5. Fehlersuche bei Push-Problemen in der Pipeline**

Wenn das Docker Image nicht gepusht werden kann, würde ich folgende Schritte zur Fehlersuche durchführen:

- **CI-Logs prüfen:** Die Ausgaben der Pipeline (insbesondere die Schritte `docker login` und `docker push`) auf Fehlermeldungen untersuchen.
- **Secrets überprüfen:** Sicherstellen, dass die Docker Hub Credentials korrekt als Secrets hinterlegt sind und nicht abgelaufen oder falsch geschrieben wurden.
- **Repository- und Tag-Namen prüfen:** Überprüfen, ob der Image-Name und das Tag korrekt sind und der Benutzer die nötigen Rechte zum Pushen hat.
- **Rate Limits und Account-Status:** Prüfen, ob das Docker Hub-Konto gesperrt oder limitiert ist.
- **Testweise lokal pushen:** Mit den gleichen Zugangsdaten lokal einen Push versuchen, um Netzwerk- oder Rechteprobleme auszuschließen.

---
