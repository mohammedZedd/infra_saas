Enlever les petits carreaux (poignées) visibles aux coins et sur les côtés du VPC, pour obtenir un design plus propre et moderne. L’utilisateur doit toujours pouvoir redimensionner le VPC en utilisant les zones interactives invisibles (bords ou coins), mais sans la présence visuelle des poignées.

Détails à Modifier
Identification des Poignées de Redimensionnement (Handles)

Repérer les éléments responsables des poignées de redimensionnement sur les coins et les bords du VPC.
Ces poignées apparaissent souvent sous forme de petits rectangles ou carreaux visibles, placés aux quatre coins et éventuellement sur les côtés.
Elles sont généralement rendues via des propriétés CSS (resize-handles, corner-handles) ou via des composants spécifiques dans des bibliothèques comme React Flow, qui gèrent le redimensionnement.
Suppression Visuelle des Poignées :

Masquer Visuellement les poignées :
Supprime ou désactive l’affichage des carreaux ou poignées visibles.
Cela peut être fait en supprimant le background-color, les bordures (border), ou toute icône associée aux poignées.
Les poignées doivent devenir invisibles visuellement, mais rester actives d’un point de vue fonctionnel.
Style Invisible :
Par exemple, applique un opacity: 0 ou background: transparent aux éléments des poignées.
Supprime les dimensions visibles (largeur, hauteur) si nécessaire, tout en laissant la zone cliquable ou interactive intacte.
Préservation de la Fonctionnalité de Redimensionnement :

Maintiens la capacité de redimensionner le VPC en interaction directe.
Même si les poignées ne sont plus visibles, les coins et les bords doivent rester interagissables :
L’utilisateur doit pouvoir cliquer/tirer sur les coins ou les côtés du VPC pour l’agrandir ou le rétrécir.
Cela peut être assuré en gardant la zone de détection des poignées active. Par exemple :
Utiliser des zones de clic invisibles (hitboxes) avec une largeur/hauteur définie (par exemple, 8px ou 10px de marge autour des bords).
Ces zones de bord restent interactives, mais sans affichage visuel inutile.
Curseur de Redimensionnement :

Pour guider l’utilisateur, garde le curseur de souris interactif :
Lorsqu’on passe la souris sur les bords ou les coins du VPC, le curseur doit changer en mode resize (par exemple, nwse-resize, nesw-resize, ew-resize, ns-resize).
Cela sert d’indicateur visuel subtil, même sans poignée apparente.
Ce changement de curseur assure que l’utilisateur perçoit qu’il peut redimensionner, sans avoir besoin des repères visibles.
Aspect du VPC après Redimensionnement :

Le VPC garde son apparence en vert clair, avec sa bordure douce et son titre (VPC 10.0.0.0/16) bien visible.
Une fois la taille ajustée, le VPC doit s’adapter naturellement, sans afficher de poignée ni de repère supplémentaire.
Le contenu interne (comme les Subnets, EC2) se repositionne ou reste à sa place logique à l’intérieur du VPC.
Expérience Utilisateur Finale :

L’utilisateur voit un VPC sans les carreaux aux coins et sans repères visuels encombrants.
Le canvas garde une apparence propre, minimaliste, et professionnelle, inspirée de la console AWS.
La manipulation du VPC (agrandir/réduire) reste intuitive grâce au curseur interactif et aux zones de redimensionnement invisibles.
Aucune fonctionnalité n’est perdue, seul l’aspect visuel est allégé.# Backend API Implementation Guide - Terraform Runs

## Overview

This guide provides detailed specifications for implementing the Terraform run management API endpoints needed to support the ProjectDetail Overview enhancements.

## Quick Summary

You need to implement 7 API endpoints for Terraform run management:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/runs` | GET | List all runs for a project |
| `/runs` | POST variants | Trigger plan/apply/destroy |
| `/runs/{runId}` | GET | Get specific run details |
| `/runs/{runId}/logs` | GET | Get run execution logs |
| `/runs/{runId}/cancel` | POST | Cancel a running run |
| `/runs/{runId}/retry` | POST | Retry a failed run |

---

## Data Models

### TerraformRun

This is the main model representing a single Terraform execution.

```typescript
interface TerraformRun {
  id: string                    // UUID, unique identifier
  projectId: string             // Foreign key to projects table
  command: "plan" | "apply" | "destroy" | "init"  // What command was run
  status: "success" | "failed" | "running" | "cancelled"  // Current status
  triggeredBy: string           // User email/ID who initiated
  triggeredAt: string           // ISO 8601 datetime (UTC)
  completedAt?: string          // ISO 8601 datetime (UTC) - null if running
  planSummary?: {               // Only populated for plan/apply commands
    add: number                 // Resources to create
    change: number              // Resources to modify
    destroy: number             // Resources to delete
  }
  errorMessage?: string         // Error description if failed
  logUrl?: string               // Optional link to external logs (e.g., CI/CD URL)
}
```

### Database Schema for PostgreSQL

```sql
CREATE TABLE terraform_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  command VARCHAR(50) NOT NULL CHECK (command IN ('plan', 'apply', 'destroy', 'init')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'running', 'cancelled')),
  triggered_by VARCHAR(255) NOT NULL,  -- Email or user ID
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  plan_summary JSONB,  -- {"add": 5, "change": 2, "destroy": 0}
  error_message TEXT,
  log_url VARCHAR(500),
  terraform_output TEXT,  -- Full Terraform command output
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_completion CHECK (
    (status != 'running' AND completed_at IS NOT NULL) OR
    (status = 'running' AND completed_at IS NULL)
  )
);

-- Indexes for common queries
CREATE INDEX idx_terraform_runs_project_id ON terraform_runs(project_id);
CREATE INDEX idx_terraform_runs_status ON terraform_runs(status);
CREATE INDEX idx_terraform_runs_triggered_at ON terraform_runs(triggered_at DESC);
CREATE INDEX idx_terraform_runs_project_status ON terraform_runs(project_id, status);
```

---

## API Endpoint Specifications

### 1. List Terraform Runs

**Endpoint:** `GET /api/projects/{projectId}/runs`

**Purpose:** Retrieve all Terraform runs for a project, ordered by most recent first.

**Path Parameters:**
```
projectId: string (UUID) - The project identifier
```

**Query Parameters:**
```
limit: number (optional, default: 50, max: 100)
offset: number (optional, default: 0)
status: string (optional) - Filter by status (success|failed|running|cancelled)
command: string (optional) - Filter by command (plan|apply|destroy|init)
```

**Authorization:** Bearer token required

**Response:**

Success (200 OK):
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "projectId": "proj-123",
      "command": "apply",
      "status": "success",
      "triggeredBy": "alice@company.com",
      "triggeredAt": "2024-02-27T14:30:00Z",
      "completedAt": "2024-02-27T14:35:20Z",
      "planSummary": {
        "add": 2,
        "change": 1,
        "destroy": 0
      },
      "errorMessage": null,
      "logUrl": null
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "projectId": "proj-123",
      "command": "plan",
      "status": "success",
      "triggeredBy": "bob@company.com",
      "triggeredAt": "2024-02-27T13:00:00Z",
      "completedAt": "2024-02-27T13:05:10Z",
      "planSummary": {
        "add": 2,
        "change": 1,
        "destroy": 0
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 12
  }
}
```

Error (401 Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

Error (404 Not Found):
```json
{
  "error": "Project not found",
  "message": "The specified project does not exist"
}
```

---

### 2. Get Run Details

**Endpoint:** `GET /api/projects/{projectId}/runs/{runId}`

**Purpose:** Retrieve detailed information about a specific run.

**Path Parameters:**
```
projectId: string (UUID)
runId: string (UUID)
```

**Authorization:** Bearer token required

**Response:**

Success (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "projectId": "proj-123",
    "command": "apply",
    "status": "success",
    "triggeredBy": "alice@company.com",
    "triggeredAt": "2024-02-27T14:30:00Z",
    "completedAt": "2024-02-27T14:35:20Z",
    "planSummary": {
      "add": 2,
      "change": 1,
      "destroy": 0
    },
    "errorMessage": null,
    "logUrl": null
  }
}
```

Error (404 Not Found):
```json
{
  "error": "Run not found",
  "message": "The specified run does not exist"
}
```

---

### 3. Get Run Logs

**Endpoint:** `GET /api/projects/{projectId}/runs/{runId}/logs`

**Purpose:** Retrieve the full execution logs from a Terraform run.

**Path Parameters:**
```
projectId: string (UUID)
runId: string (UUID)
```

**Query Parameters:**
```
format: string (optional, default: "text", options: "text" | "json")
```

**Authorization:** Bearer token required

**Response:**

Success (200 OK) - text format:
```
[INFO] Terraform initialized in /tmp/terraform
[INFO] Loading configuration from project files...
[INFO] Validating configuration syntax...
✓ Configuration is valid

Terraform will perform the following actions:

+ aws_vpc.main
    create
    + cidr_block = "10.0.0.0/16"
```

Success (200 OK) - json format:
```json
{
  "logs": "[INFO] Terraform initialized...",
  "format": "json"
}
```

Error (404 Not Found):
```json
{
  "error": "Run not found"
}
```

---

### 4. Trigger Terraform Plan

**Endpoint:** `POST /api/projects/{projectId}/runs/plan`

**Purpose:** Trigger a new Terraform plan operation.

**Path Parameters:**
```
projectId: string (UUID)
```

**Request Body:**
```json
{
  "variables": {
    "key1": "value1",
    "key2": "value2"
  },
  "targets": [],  // Optional: specific resources to plan
  "timeout": 600  // Optional: timeout in seconds (default: 1800)
}
```

**Authorization:** Bearer token required, User must have project edit permission

**Response:**

Success (201 Created):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "projectId": "proj-123",
    "command": "plan",
    "status": "running",
    "triggeredBy": "charlie@company.com",
    "triggeredAt": "2024-02-27T15:00:00Z",
    "completedAt": null,
    "planSummary": null,  // Will be populated when plan completes
    "errorMessage": null
  }
}
```

Error (400 Bad Request):
```json
{
  "error": "Invalid parameters",
  "message": "Variables must be an object"
}
```

Error (409 Conflict):
```json
{
  "error": "Another operation in progress",
  "message": "Cannot start a new operation while one is running"
}
```

---

### 5. Trigger Terraform Apply

**Endpoint:** `POST /api/projects/{projectId}/runs/apply`

**Purpose:** Trigger a Terraform apply operation (requires running plan first).

**Path Parameters:**
```
projectId: string (UUID)
```

**Request Body:**
```json
{
  "runPlanId": "550e8400-e29b-41d4-a716-446655440005",  // ID of the plan to apply
  "autoApprove": false,  // Whether to skip interactive approval
  "targets": [],  // Optional: specific resources to apply
  "timeout": 900
}
```

**Authorization:** Bearer token required, User must have project edit and deploy permissions

**Response:**

Success (201 Created):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "projectId": "proj-123",
    "command": "apply",
    "status": "running",
    "triggeredBy": "charlie@company.com",
    "triggeredAt": "2024-02-27T15:05:00Z",
    "completedAt": null,
    "planSummary": {
      "add": 2,
      "change": 0,
      "destroy": 0
    }
  }
}
```

Error (403 Forbidden):
```json
{
  "error": "Permission denied",
  "message": "You do not have permission to apply changes"
}
```

---

### 6. Trigger Terraform Destroy

**Endpoint:** `POST /api/projects/{projectId}/runs/destroy`

**Purpose:** Trigger a Terraform destroy operation (dangerous - use with caution).

**Path Parameters:**
```
projectId: string (UUID)
```

**Request Body:**
```json
{
  "force": false,  // Whether to skip interactive confirmation
  "targets": [],  // Optional: specific resources to destroy
  "timeout": 900,
  "confirmationToken": "destroy-tokens-here-for-safety"  // Additional safety token
}
```

**Authorization:** Bearer token required, User must have project destroy permissions

**Important Notes:**
- This endpoint should require additional confirmation/tokens
- Recommend storing an audit log entry
- Consider implementing approval workflows
- Send email notification to project collaborators

**Response:**

Success (201 Created):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "projectId": "proj-123",
    "command": "destroy",
    "status": "running",
    "triggeredBy": "charlie@company.com",  // Log who did this
    "triggeredAt": "2024-02-27T15:10:00Z"
  }
}
```

Error (403 Forbidden):
```json
{
  "error": "Permission denied",
  "message": "You do not have permission to destroy infrastructure"
}
```

---

### 7. Cancel Terraform Run

**Endpoint:** `POST /api/projects/{projectId}/runs/{runId}/cancel`

**Purpose:** Cancel an in-progress Terraform operation.

**Path Parameters:**
```
projectId: string (UUID)
runId: string (UUID)
```

**Request Body:** (optional)
```json
{
  "reason": "User cancelled the operation"
}
```

**Authorization:** Bearer token required

**Response:**

Success (200 OK):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "projectId": "proj-123",
    "command": "destroy",
    "status": "cancelled",
    "triggeredBy": "charlie@company.com",
    "triggeredAt": "2024-02-27T15:10:00Z",
    "completedAt": "2024-02-27T15:11:30Z"
  }
}
```

Error (400 Bad Request):
```json
{
  "error": "Invalid operation",
  "message": "Cannot cancel a run that is not running"
}
```

---

### 8. Retry Terraform Run

**Endpoint:** `POST /api/projects/{projectId}/runs/{runId}/retry`

**Purpose:** Retry a failed Terraform operation.

**Path Parameters:**
```
projectId: string (UUID)
runId: string (UUID)
```

**Request Body:** (optional)
```json
{
  "comment": "Retrying after fixing variables"
}
```

**Authorization:** Bearer token required

**Response:**

Success (201 Created):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440008",
    "projectId": "proj-123",
    "command": "plan",  // Same command as original
    "status": "running",
    "triggeredBy": "charlie@company.com",
    "triggeredAt": "2024-02-27T15:15:00Z",
    "completedAt": null
  }
}
```

Error (400 Bad Request):
```json
{
  "error": "Cannot retry",
  "message": "Only failed runs can be retried"
}
```

---

## Implementation Guide

### Steps to Implement

#### Step 1: Create Database Schema

```sql
-- Run the schema creation script provided above
-- Ensure indexes are created for performance
-- Set up partitioning if you expect 100k+ runs
```

#### Step 2: Create ORM Models

Example with Python/SQLAlchemy:

```python
from sqlalchemy import Column, String, DateTime, JSON, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid

class TerraformRun(Base):
    __tablename__ = "terraform_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    command = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="running")
    triggered_by = Column(String(255), nullable=False)
    triggered_at = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    plan_summary = Column(JSON, nullable=True)
    error_message = Column(String(1000), nullable=True)
    log_url = Column(String(500), nullable=True)
    terraform_output = Column(String(50000), nullable=True)  # Store last 50KB of logs
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, default=func.now())
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "projectId": str(self.project_id),
            "command": self.command,
            "status": self.status,
            "triggeredBy": self.triggered_by,
            "triggeredAt": self.triggered_at.isoformat(),
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
            "planSummary": self.plan_summary,
            "errorMessage": self.error_message,
            "logUrl": self.log_url
        }
```

#### Step 3: Create Service Layer

```python
from datetime import datetime
from typing import List, Optional

class TerraformRunService:
    
    @staticmethod
    def list_runs(project_id: str, limit: int = 50, offset: int = 0,
                  status: Optional[str] = None, command: Optional[str] = None) -> List[TerraformRun]:
        """List runs for a project with optional filtering"""
        query = TerraformRun.query.filter_by(project_id=project_id)
        if status:
            query = query.filter_by(status=status)
        if command:
            query = query.filter_by(command=command)
        return query.order_by(TerraformRun.triggered_at.desc()).limit(limit).offset(offset)
    
    @staticmethod
    def get_run(project_id: str, run_id: str) -> Optional[TerraformRun]:
        """Get a specific run"""
        return TerraformRun.query.filter_by(id=run_id, project_id=project_id).first()
    
    @staticmethod
    def get_run_logs(project_id: str, run_id: str) -> Optional[str]:
        """Get logs for a run"""
        run = TerraformRunService.get_run(project_id, run_id)
        return run.terraform_output if run else None
    
    @staticmethod
    def trigger_plan(project_id: str, user_id: str, target_resources: Optional[List[str]] = None) -> TerraformRun:
        """Create and execute a Terraform plan"""
        # 1. Check if another operation is running
        running = TerraformRun.query.filter_by(
            project_id=project_id,
            status="running"
        ).first()
        if running:
            raise ValueError("Another operation is already in progress")
        
        # 2. Create run record
        run = TerraformRun(
            project_id=project_id,
            command="plan",
            status="running",
            triggered_by=user_id,
            triggered_at=datetime.utcnow()
        )
        db.session.add(run)
        db.session.commit()
        
        # 3. Execute Terraform plan asynchronously
        execute_terraform_plan.delay(str(project_id), str(run.id), target_resources)
        
        return run
    
    @staticmethod
    def trigger_apply(project_id: str, user_id: str, plan_run_id: Optional[str] = None) -> TerraformRun:
        """Execute a Terraform apply"""
        # Similar implementation to trigger_plan
        # Validate permissions, create run record, queue async task
        pass
    
    @staticmethod
    def trigger_destroy(project_id: str, user_id: str) -> TerraformRun:
        """Execute a Terraform destroy"""
        # Check permissions (likely requires admin)
        # Log the action (important for audit trail!)
        # Queue the task
        pass
    
    @staticmethod
    def cancel_run(project_id: str, run_id: str) -> TerraformRun:
        """Cancel a running operation"""
        run = TerraformRunService.get_run(project_id, run_id)
        if not run or run.status != "running":
            raise ValueError("Cannot cancel a run that is not running")
        
        # Kill the Terraform process
        kill_terraform_process(str(run.id))
        
        run.status = "cancelled"
        run.completed_at = datetime.utcnow()
        db.session.commit()
        return run
    
    @staticmethod
    def retry_run(project_id: str, run_id: str, user_id: str) -> TerraformRun:
        """Retry a failed run"""
        original_run = TerraformRunService.get_run(project_id, run_id)
        if not original_run or original_run.status != "failed":
            raise ValueError("Only failed runs can be retried")
        
        # Create new run with same command
        new_run = TerraformRun(
            project_id=project_id,
            command=original_run.command,
            status="running",
            triggered_by=user_id,
            triggered_at=datetime.utcnow()
        )
        db.session.add(new_run)
        db.session.commit()
        
        # Queue task
        if original_run.command == "plan":
            execute_terraform_plan.delay(str(project_id), str(new_run.id))
        elif original_run.command == "apply":
            execute_terraform_apply.delay(str(project_id), str(new_run.id))
        
        return new_run
```

#### Step 4: Create Async Task Workers

```python
# Using Celery for async execution
from celery import shared_task
import subprocess
import json

@shared_task
def execute_terraform_plan(project_id: str, run_id: str, target_resources: Optional[List[str]] = None):
    """Execute terraform plan asynchronously"""
    run = TerraformRun.query.get(run_id)
    project = Project.query.get(project_id)
    
    try:
        # Build Terraform command
        cmd = ["terraform", "plan", "-json"]
        if target_resources:
            for resource in target_resources:
                cmd.extend(["-target", resource])
        
        # Execute
        result = subprocess.run(
            cmd,
            cwd=f"/terraform/projects/{project_id}",
            capture_output=True,
            text=True,
            timeout=1800  # 30 minutes
        )
        
        # Parse output
        output_text = result.stdout + result.stderr
        run.terraform_output = output_text
        
        if result.returncode == 0:
            # Parse plan summary from JSON output
            plan_summary = parse_terraform_json_output(result.stdout)
            run.plan_summary = plan_summary
            run.status = "success"
        else:
            run.status = "failed"
            run.error_message = f"Terraform exited with code {result.returncode}"
        
        run.completed_at = datetime.utcnow()
        db.session.commit()
        
        # Notify via WebSocket if available
        notify_run_update(project_id, run.to_dict())
        
    except subprocess.TimeoutExpired:
        run.status = "failed"
        run.error_message = "Terraform operation timed out"
        run.completed_at = datetime.utcnow()
        db.session.commit()
    except Exception as e:
        run.status = "failed"
        run.error_message = str(e)
        run.completed_at = datetime.utcnow()
        db.session.commit()

@shared_task
def execute_terraform_apply(project_id: str, run_id: str):
    """Execute terraform apply asynchronously"""
    # Very similar to plan, but execute apply command
    # Requires user confirmation or auto-approve flag
    pass
```

#### Step 5: Create API Routes

```python
from flask import Blueprint, request, jsonify
from functools import wraps

runs_bp = Blueprint('terraform_runs', __name__, url_prefix='/api/projects/<project_id>/runs')

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Check Bearer token and set user context
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "Unauthorized"}), 401
        # Validate token...
        return f(*args, **kwargs)
    return decorated

@runs_bp.route('', methods=['GET'])
@require_auth
def list_runs(project_id):
    """List Terraform runs for a project"""
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    status_filter = request.args.get('status')
    command_filter = request.args.get('command')
    
    runs = TerraformRunService.list_runs(
        project_id,
        limit=min(limit, 100),
        offset=offset,
        status=status_filter,
        command=command_filter
    )
    
    return jsonify({
        "data": [run.to_dict() for run in runs],
        "pagination": {
            "limit": limit,
            "offset": offset,
            "total": TerraformRun.query.filter_by(project_id=project_id).count()
        }
    })

@runs_bp.route('/<run_id>', methods=['GET'])
@require_auth
def get_run(project_id, run_id):
    """Get specific run details"""
    run = TerraformRunService.get_run(project_id, run_id)
    if not run:
        return jsonify({"error": "Run not found"}), 404
    return jsonify({"data": run.to_dict()})

@runs_bp.route('/<run_id>/logs', methods=['GET'])
@require_auth
def get_run_logs(project_id, run_id):
    """Get run execution logs"""
    logs = TerraformRunService.get_run_logs(project_id, run_id)
    if logs is None:
        return jsonify({"error": "Logs not found"}), 404
    return logs, 200, {'Content-Type': 'text/plain'}

@runs_bp.route('/plan', methods=['POST'])
@require_auth
def trigger_plan(project_id):
    """Trigger a Terraform plan"""
    try:
        run = TerraformRunService.trigger_plan(project_id, g.user_id)
        return jsonify({"data": run.to_dict()}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409

@runs_bp.route('/apply', methods=['POST'])
@require_auth
def trigger_apply(project_id):
    """Trigger a Terraform apply"""
    # Similar implementation
    pass

@runs_bp.route('/destroy', methods=['POST'])
@require_auth
def trigger_destroy(project_id):
    """Trigger a Terraform destroy (requires strong auth)"""
    # Log this action extensively
    # Maybe require additional confirmation
    pass

@runs_bp.route('/<run_id>/cancel', methods=['POST'])
@require_auth
def cancel_run(project_id, run_id):
    """Cancel a running operation"""
    try:
        run = TerraformRunService.cancel_run(project_id, run_id)
        return jsonify({"data": run.to_dict()})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@runs_bp.route('/<run_id>/retry', methods=['POST'])
@require_auth
def retry_run(project_id, run_id):
    """Retry a failed run"""
    try:
        run = TerraformRunService.retry_run(project_id, run_id, g.user_id)
        return jsonify({"data": run.to_dict()}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
```

#### Step 6: Register Blueprint

```python
# In main app setup
app.register_blueprint(runs_bp)
```

---

## Testing

### Sample cURL Examples

#### List Runs
```bash
curl -X GET "http://localhost:8000/api/projects/proj-123/runs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Trigger Plan
```bash
curl -X POST "http://localhost:8000/api/projects/proj-123/runs/plan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {},
    "timeout": 600
  }'
```

#### Get Run Logs
```bash
curl -X GET "http://localhost:8000/api/projects/proj-123/runs/550e8400-e29b-41d4-a716-446655440000/logs" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Cancel Run
```bash
curl -X POST "http://localhost:8000/api/projects/proj-123/runs/550e8400-e29b-41d4-a716-446655440000/cancel" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Considerations

### Authentication & Authorization
- ✅ Require Bearer token authentication on all endpoints
- ✅ Check project ownership before allowing operations
- ✅ Implement role-based access control (RBAC)
  - `viewer`: Can list and view runs/logs
  - `editor`: Can plan/apply
  - `admin`: Can destroy and cancel

### Sensitive Operations
- ✅ Destroy operations should require additional confirmation
- ✅ Log all destroy operations with user ID and timestamp
- ✅ Consider implementing approval workflows
- ✅ Send email notifications on critical actions

### Data Protection
- ✅ Do not expose Terraform state in responses
- ✅ Sanitize logs for sensitive data (passwords, tokens)
- ✅ Store API tokens securely
- ✅ Use HTTPS only in production

### Rate Limiting
- ✅ Limit plan/apply/destroy operations per user
- ✅ Implement backpressure for resource-heavy operations
- ✅ Queue operations if too many concurrent requests

---

## Monitoring & Observability

### Logging
```python
import logging

logger = logging.getLogger(__name__)

logger.info(f"Run created: {run_id} for project {project_id}")
logger.error(f"Run failed: {run_id}, Error: {error_message}")
logger.warning(f"Long-running operation: {run_id}, duration: {duration}s")
```

### Metrics
- Track run duration by command type
- Monitor success/failure rates
- Alert on long-running operations (>30 min)
- Alert on repeated failures

### Alerting
- Send Slack/email on apply failures
- Notify DevOps on destroy operations
- Alert on resource quota exceeded

---

## Performance Optimization

### Database
- Partition terraform_runs table by month
- Archive old runs (>90 days) to separate table
- Use connection pooling
- Implement caching for frequently accessed runs

### API
- Implement pagination (max 100 per page)
- Use select specific columns instead of SELECT *
- Add database indexes on project_id, status, triggered_at
- Consider GraphQL for complex queries

### Background Tasks
- Use worker pool of 4-8 processes
- Set task timeout to 30 minutes
- Implement retry logic with exponential backoff
- Monitor queue depth

---

## Deployment Checklist

- [ ] Database schema created and tested
- [ ] ORM models created
- [ ] Service layer implemented
- [ ] API endpoints implemented (7 total)
- [ ] Async workers configured
- [ ] Authentication integrated
- [ ] Authorization rules implemented
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Tests written (unit + integration)
- [ ] Load testing performed
- [ ] Security review completed
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Deployed to production

---

## Support Resources

### Documentation Used
- [Terraform CLI Reference](https://www.terraform.io/cli)
- [Terraform JSON Output](https://www.terraform.io/docs/commands/init.html#json-output)

### Stack Recommendations
- **Web Framework**: FastAPI, Flask, Django, or Node.js/Express
- **Database**: PostgreSQL (recommended) or MySQL
- **Task Queue**: Celery with Redis or RQ
- **Monitoring**: Prometheus + Grafana or DataDog
- **Logging**: ELK Stack or Datadog

---
