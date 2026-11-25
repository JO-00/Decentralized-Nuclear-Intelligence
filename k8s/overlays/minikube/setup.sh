#!/usr/bin/env bash
# ==============================================================================
# Multi-Tenant Nuclear Safety Platform - Minikube Provisioning & Deployment
# Senior Kubernetes & Cloud Networking Architecture
# ==============================================================================
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info()    { echo -e "${CYAN}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# 1. Prerequisite checks
command -v minikube >/dev/null 2>&1 || { log_error "minikube is required but not installed."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { log_error "docker is required but not installed."; exit 1; }

# 2. Start Minikube with Calico CNI for full NetworkPolicy enforcement & resource headroom
log_info "Validating Minikube status..."
if ! minikube status >/dev/null 2>&1; then
    log_info "Starting Minikube (CPUs: 4, Memory: 6144MB, CNI: calico for NetworkPolicy support)..."
    minikube start \
        --cpus=4 \
        --memory=6144 \
        --cni=calico \
        --driver=docker
else
    log_info "Minikube is already running."
fi

# 3. Enable required addons
log_info "Enabling Minikube addons: Ingress (L7 NGINX controller) and Metrics Server (HPA support)..."
minikube addons enable ingress
minikube addons enable metrics-server

log_info "Waiting for Ingress Controller to be ready..."
kubectl rollout status deployment ingress-nginx-controller -n ingress-nginx --timeout=120s || true

# 4. Build container images directly into Minikube's Docker daemon
log_info "Pointing shell to Minikube's in-cluster Docker daemon..."
eval $(minikube docker-env)

log_info "Building Dataset Generation image (nuclear-dataset-generation:latest)..."
docker build -t nuclear-dataset-generation:latest ./DatasetGeneration

log_info "Building Frontend image (nuclear-frontend:latest)..."
docker build -t nuclear-frontend:latest ./frontend

# 5. Apply Multi-Tenant Kubernetes Kustomize manifests
log_info "Deploying multi-tenant manifests (Tenant Alpha & Tenant Beta) via Kustomize..."
kubectl apply -k k8s/overlays/minikube

# 6. Wait for deployments to achieve ready state
log_info "Awaiting rollout completion for Tenant Alpha..."
kubectl rollout status deployment/dataset-generation -n tenant-alpha --timeout=180s
kubectl rollout status deployment/frontend -n tenant-alpha --timeout=180s

log_info "Awaiting rollout completion for Tenant Beta..."
kubectl rollout status deployment/dataset-generation -n tenant-beta --timeout=180s
kubectl rollout status deployment/frontend -n tenant-beta --timeout=180s

# 7. Print ingress DNS instructions and network validation summary
MINIKUBE_IP=$(minikube ip)
log_success "Deployment successfully rolled out across both tenant namespaces!"
echo ""
echo "=========================================================================="
echo " NETWORK CONFIGURATION & DNS RESOLUTION"
echo "=========================================================================="
echo "Add the following entry to your hosts file (/etc/hosts on Linux/macOS, or"
echo "C:\\Windows\\System32\\drivers\\etc\\hosts on Windows):"
echo ""
echo -e "  ${GREEN}${MINIKUBE_IP}  alpha.nuclear.local beta.nuclear.local${NC}"
echo ""
echo "Once mapped, you can access each tenant's isolated environment:"
echo "  - Tenant Alpha Web UI:     http://alpha.nuclear.local/"
echo "  - Tenant Alpha Health API: http://alpha.nuclear.local/api/health"
echo "  - Tenant Beta Web UI:      http://beta.nuclear.local/"
echo "  - Tenant Beta Health API:  http://beta.nuclear.local/api/health"
echo ""
echo "Or test immediately with curl headers:"
echo "  curl -H 'Host: alpha.nuclear.local' http://${MINIKUBE_IP}/api/health"
echo "  curl -H 'Host: beta.nuclear.local' http://${MINIKUBE_IP}/api/health"
echo "=========================================================================="
