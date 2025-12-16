# DHL Shipping - Automated Deployment Script
# Script tự động triển khai ứng dụng lên server
# Automated deployment script for DHL Shipping application

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("local", "remote", "docker")]
    [string]$Mode = "local",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUser = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerPath = "/opt/dhlshipping",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Error { Write-ColorOutput Red $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Info { Write-ColorOutput Cyan $args }

Write-Success "=== DHL Shipping Deployment Script ==="
Write-Info "Mode: $Mode"
Write-Info ""

# Check Docker
function Test-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    if (-not (docker ps -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not running. Please start Docker Desktop."
        exit 1
    }
    
    Write-Success "Docker is installed and running"
}

# Check Docker Compose
function Test-DockerCompose {
    if (-not (docker compose version -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not available."
        exit 1
    }
    Write-Success "Docker Compose is available"
}

# Build Docker images
function Build-Images {
    Write-Info "Building Docker images..."
    
    if ($Build) {
        docker compose build --no-cache
    } else {
        docker compose build
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build images"
        exit 1
    }
    
    Write-Success "Images built successfully"
}

# Start containers
function Start-Containers {
    Write-Info "Starting containers..."
    
    docker compose up -d
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to start containers"
        exit 1
    }
    
    Write-Success "Containers started"
}

# Check container health
function Test-ContainerHealth {
    param([string]$ContainerName, [int]$MaxAttempts = 30)
    
    Write-Info "Waiting for $ContainerName to be healthy..."
    
    $attempt = 0
    while ($attempt -lt $MaxAttempts) {
        $health = docker inspect $ContainerName --format='{{.State.Health.Status}}' 2>$null
        if ($health -eq "healthy") {
            Write-Success "$ContainerName is healthy!"
            return $true
        }
        Start-Sleep -Seconds 2
        $attempt++
    }
    
    Write-Warning "$ContainerName did not become healthy within timeout"
    return $false
}

# Deploy locally
function Deploy-Local {
    Write-Info "Deploying locally..."
    
    Test-Docker
    Test-DockerCompose
    
    Build-Images
    Start-Containers
    
    # Wait for health checks
    Test-ContainerHealth "dhl-backend"
    Test-ContainerHealth "dhl-frontend"
    
    Write-Success "Local deployment completed!"
    Write-Info "Backend: http://localhost:5000"
    Write-Info "Frontend: http://localhost:80"
}

# Deploy to remote server via SSH
function Deploy-Remote {
    if (-not $ServerIP -or -not $ServerUser) {
        Write-Error "ServerIP and ServerUser are required for remote deployment"
        Write-Info "Usage: .\deploy.ps1 -Mode remote -ServerIP '34.124.152.52' -ServerUser 'user'"
        exit 1
    }
    
    Write-Info "Deploying to remote server: $ServerUser@$ServerIP"
    
    # Check SSH connection
    Write-Info "Testing SSH connection..."
    ssh -o ConnectTimeout=5 "$ServerUser@$ServerIP" "echo 'SSH connection successful'" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Cannot connect to server. Please check SSH credentials."
        exit 1
    }
    
    Write-Success "SSH connection successful"
    
    # Create deployment script on remote server
    $deployScript = @"
#!/bin/bash
set -e
cd $ServerPath

# Pull latest code (if git)
if [ -d ".git" ]; then
    echo "Pulling latest code..."
    git pull
fi

# Build and start containers
echo "Building images..."
docker compose -f docker-compose.prod.yml build

echo "Starting containers..."
docker compose -f docker-compose.prod.yml up -d

echo "Deployment completed!"
docker compose -f docker-compose.prod.yml ps
"@
    
    # Upload deployment script
    Write-Info "Uploading deployment script..."
    $deployScript | ssh "$ServerUser@$ServerIP" "cat > /tmp/deploy-remote.sh && chmod +x /tmp/deploy-remote.sh"
    
    # Execute deployment
    Write-Info "Executing deployment on remote server..."
    ssh "$ServerUser@$ServerIP" "bash /tmp/deploy-remote.sh"
    
    Write-Success "Remote deployment completed!"
}

# Deploy using Docker only
function Deploy-Docker {
    Write-Info "Deploying with Docker..."
    
    Test-Docker
    Test-DockerCompose
    
    # Check if docker-compose.prod.yml exists
    if (-not (Test-Path "docker-compose.prod.yml")) {
        Write-Warning "docker-compose.prod.yml not found. Creating from example..."
        if (Test-Path "docker-compose.prod.yml.example") {
            Copy-Item "docker-compose.prod.yml.example" "docker-compose.prod.yml"
            Write-Info "Please configure docker-compose.prod.yml before deploying"
        } else {
            Write-Error "docker-compose.prod.yml.example not found"
            exit 1
        }
    }
    
    Build-Images
    Start-Containers
    
    Write-Success "Docker deployment completed!"
}

# Main deployment logic
try {
    switch ($Mode) {
        "local" {
            Deploy-Local
        }
        "remote" {
            Deploy-Remote
        }
        "docker" {
            Deploy-Docker
        }
        default {
            Write-Error "Invalid mode: $Mode"
            exit 1
        }
    }
    
    Write-Success ""
    Write-Success "=== Deployment Summary ==="
    Write-Info "Mode: $Mode"
    Write-Info "Status: Success"
    Write-Info ""
    Write-Info "Useful commands:"
    Write-Info "  - View logs: docker compose logs -f"
    Write-Info "  - Check status: docker compose ps"
    Write-Info "  - Stop: docker compose down"
    Write-Info "  - Restart: docker compose restart"
    
} catch {
    Write-Error "Deployment failed: $_"
    exit 1
}





