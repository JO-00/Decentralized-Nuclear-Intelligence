# Kubernetes & Cloud Networking Architecture (Minikube & Multi-Tenancy)

This directory houses the Kubernetes deployment manifests and network orchestration for the **Nuclear Safety Platform** (`dataset-generation` and `frontend`), architected for high availability, zero-trust network isolation, and L7 application load balancing.

---

## 1. Architectural Highlights

### Multi-Tenancy & Zero-Trust Isolation
- **Namespace-Per-Tenant Model**: Workloads for different operational zones or tenants (`tenant-alpha`, `tenant-beta`) run in strictly isolated namespaces.
- **Default-Deny Network Policies**: Every namespace enforces a baseline `default-deny-all` policy across all ingress and egress directions.
- **Least-Privilege Whitelisting**:
  - `allow-dns-egress`: Allows UDP/TCP port 53 exclusively to in-cluster CoreDNS pods in `kube-system`.
  - `allow-ingress-controller`: Permits ingress traffic solely from the NGINX Ingress Controller namespace.
  - `allow-inter-service`: Authorizes intra-tenant east-west traffic between `frontend` and `dataset-generation` without exposing inter-tenant vectors.
  - Cross-tenant network probes are dropped at the packet filter level (enforced via Calico CNI).
- **ResourceQuotas & LimitRanges**: Hard limits on compute (CPU/RAM requests & limits), pod counts, and network objects (forbidding unauthorized `NodePort` or `LoadBalancer` allocations to prevent tenant privilege escalation).

### Application-Level (L7) Load Balancing
Configured on **NGINX Ingress Controller** (`minikube addons enable ingress`):
- **Upstream Balancing**: Uses `least_conn` (least connections) algorithm to optimize workload distribution for long-running telemetry stream requests.
- **Session Affinity**: Sticky sessions enabled via cookie `NUCLEAR_ROUTE_<TENANT>` with sha1 hashing and sliding TTL to maintain UI connection state.
- **L7 Rate Limiting**: Per-client IP rate limiting (`limit-rps: 50`, `limit-connections: 25`, burst multiplier: `3`) to defend against telemetry flooding and Denial of Service.
- **Path-Based & Host-Based Routing**:
  - `http://alpha.nuclear.local/` $\to$ `frontend:80`
  - `http://alpha.nuclear.local/api` $\to$ `dataset-generation:8000`
  - `http://beta.nuclear.local/` $\to$ `frontend:80`
  - `http://beta.nuclear.local/api` $\to$ `dataset-generation:8000`

### High Availability & Pod Scheduling
- **Replicas & Rolling Updates**: Configured with `maxSurge: 1` and `maxUnavailable: 0` for zero-downtime rolling deploys.
- **Pod Anti-Affinity**: Soft `podAntiAffinity` on `kubernetes.io/hostname` prevents co-locating replicas on the same node in multi-node clusters.
- **Horizontal Pod Autoscaling (HPA v2)**: Dynamically scales replicas between 2 and 6 based on real-time CPU (75%) and Memory (80%) utilization.
- **PodDisruptionBudgets (PDB)**: Guarantees at least 1 replica remains available during cluster maintenance or node drains.
- **Liveness & Readiness Probes**: Comprehensive HTTP probes checking `/health` on port 8000 and `/` on port 80.

---

## 2. Directory Structure (Kustomize)

```
k8s/
├── base/
│   ├── dataset-generation/          # Deployment, ClusterIP Service, HPA, PDB, ConfigMap
│   ├── frontend/                    # Deployment, ClusterIP Service, PDB
│   ├── networking/                  # L7 Ingress + Default-Deny, DNS, Ingress, & Inter-Service NetworkPolicies
│   ├── security/                    # Tenant ServiceAccount, RBAC Role/Binding, ResourceQuota, LimitRange
│   └── kustomization.yaml           # Root base specification
├── overlays/
│   ├── tenant-alpha/                # Namespace tenant-alpha, 3 replicas, alpha.nuclear.local ingress
│   ├── tenant-beta/                 # Namespace tenant-beta, 2 replicas, beta.nuclear.local ingress
│   └── minikube/                    # Aggregate deployment overlay for local Minikube testing
│       ├── kustomization.yaml
│       ├── setup.sh                 # End-to-end automated setup script
│       └── minikube-hosts.txt       # DNS hosts file instructions
└── README.md
```

---

## 3. Quickstart: Minikube Deployment

### Prerequisites
- [Minikube](https://minikube.sigs.k8s.io/) (v1.30+)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://docs.docker.com/)

### Automated Setup
Run the automated provisioning script from the repository root:

```bash
chmod +x k8s/overlays/minikube/setup.sh
./k8s/overlays/minikube/setup.sh
```

### Manual Step-by-Step

1. **Start Minikube with Calico CNI** (enables full NetworkPolicy packet filtering):
   ```bash
   minikube start --cpus=4 --memory=6144 --cni=calico --driver=docker
   minikube addons enable ingress
   minikube addons enable metrics-server
   ```

2. **Build images in Minikube's Docker daemon**:
   ```bash
   eval $(minikube docker-env)
   docker build -t nuclear-dataset-generation:latest ./DatasetGeneration
   docker build -t nuclear-frontend:latest ./frontend
   ```

3. **Deploy Multi-Tenant Overlays via Kustomize**:
   ```bash
   kubectl apply -k k8s/overlays/minikube
   ```

4. **Verify Rollout & Pod Distribution**:
   ```bash
   kubectl get pods,svc,ingress,networkpolicies -n tenant-alpha
   kubectl get pods,svc,ingress,networkpolicies -n tenant-beta
   ```

5. **Configure Local Host Resolution**:
   Add Minikube's IP to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):
   ```text
   <MINIKUBE_IP> alpha.nuclear.local beta.nuclear.local
   ```
   *(Retrieve IP with `minikube ip`)*

6. **Verify Access**:
   ```bash
   # Tenant Alpha
   curl -i -H "Host: alpha.nuclear.local" http://$(minikube ip)/api/health
   curl -i -H "Host: alpha.nuclear.local" http://$(minikube ip)/

   # Tenant Beta
   curl -i -H "Host: beta.nuclear.local" http://$(minikube ip)/api/health
   curl -i -H "Host: beta.nuclear.local" http://$(minikube ip)/
   ```

---

## 4. Validating Network Policy Zero-Trust Enforcement

To verify that tenants cannot communicate across namespaces:

```bash
# Launch a test probe inside tenant-alpha
kubectl run -n tenant-alpha probe --image=curlimages/curl --restart=Never --command -- sleep 3600

# Attempt cross-namespace call to tenant-beta service (Expect: Timeout / Connection Drop)
kubectl exec -it -n tenant-alpha probe -- curl -m 3 http://dataset-generation.tenant-beta.svc.cluster.local:8000/health

# Clean up probe
kubectl delete pod probe -n tenant-alpha
```

---

## 5. CI/CD Pipeline (`.github/workflows/k8s-ci-cd.yaml`)

Every push or pull request touching the Kubernetes manifests triggers an automated pipeline:
1. **Schema Validation**: Uses `kubeconform` to strictly validate Kustomize-rendered manifests against official Kubernetes v1.30 JSON schemas.
2. **Security Vulnerability Scanning**: Uses Aqua Trivy to scan built container images for CVEs.
3. **E2E Minikube Test**: Provisions an ephemeral Minikube runner with Calico CNI, applies the multi-tenant overlays, validates Ingress L7 responsiveness, and executes an automated cross-tenant network isolation assertion test.
