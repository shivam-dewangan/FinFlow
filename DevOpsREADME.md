# 🚀 FinFlow - Production Grade DevOps Project

> End-to-End CI/CD Pipeline using **GitHub Actions**, **Amazon ECR**, **Amazon EKS**, **ArgoCD**, **Terraform**, **Docker**, **Kubernetes**, **Prometheus**, and **Grafana**.

---

# 📌 Project Overview

FinFlow is a full-stack web application deployed on Amazon EKS using a GitOps approach.

The project demonstrates how modern companies automate software delivery using Infrastructure as Code (Terraform), Continuous Integration (GitHub Actions), Continuous Delivery (ArgoCD), Kubernetes, and monitoring tools.

---

# 🛠️ Tech Stack

### Cloud

* AWS
* Amazon EKS
* Amazon ECR
* IAM
* VPC

### DevOps

* Terraform
* Docker
* Kubernetes
* GitHub Actions
* ArgoCD
* Helm

### Monitoring

* Prometheus
* Grafana

### Application

* React.js
* Node.js
* Express.js
* MongoDB

---

# 🏗️ Architecture

```text
                        Developer
                            │
                        git push
                            │
                            ▼
                     GitHub Repository
                            │
                            ▼
                 GitHub Actions (CI)
                            │
        ┌───────────────────┴────────────────────┐
        │                                        │
        ▼                                        ▼
 Build Frontend Image                    Build Backend Image
        │                                        │
        └───────────────────┬────────────────────┘
                            │
                            ▼
                    Amazon Elastic Container Registry (ECR)
                            │
                 Update Kubernetes Manifests
                            │
                            ▼
                     GitHub Repository
                            │
                 ArgoCD watches Git Repository
                            │
                            ▼
                    Automatic Synchronization
                            │
                            ▼
                     Amazon EKS Cluster
                            │
      ┌─────────────────────┴─────────────────────┐
      │                                           │
      ▼                                           ▼
Frontend Deployment                      Backend Deployment
      │                                           │
      └─────────────────────┬─────────────────────┘
                            │
                            ▼
                     NGINX Ingress Controller
                            │
                            ▼
                           Users

---------------------------------------------------------------

Prometheus  <------------------- Kubernetes Metrics -------------------> Grafana
```

---

# 📂 Project Structure

```text
FinFlow
│
├── .github
│   └── workflows
│       └── deploy.yml
│
├── client
│   ├── Dockerfile
│   └── source code
│
├── server
│   ├── Dockerfile
│   └── source code
│
├── k8s
│   ├── frontend
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   │
│   ├── backend
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   │
│   ├── ingress
│   │   └── ingress.yaml
│   │
│   └── argocd
│       └── application.yaml
│
├── terraform
│   ├── modules
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
└── README.md
```

---

# ⚙️ Infrastructure Provisioning

Terraform provisions:

* Custom VPC
* Public & Private Subnets
* Internet Gateway
* Amazon EKS Cluster
* Managed Node Group
* Amazon ECR Repositories
* IAM Roles & Policies

---

# 🐳 Docker Workflow

* Build Frontend Image
* Build Backend Image
* Tag Images
* Push Images to Amazon ECR

---

# ⚡ CI Pipeline (GitHub Actions)

Workflow triggers on every push to the **main** branch.

### Pipeline Steps

```
Checkout Repository

↓

Configure AWS Credentials

↓

Login to Amazon ECR

↓

Build Backend Image

↓

Build Frontend Image

↓

Push Backend Image

↓

Push Frontend Image

↓

Update Kubernetes Manifest

↓

Commit Updated Manifest

↓

Push Changes to GitHub
```

---

# 🚀 CD Pipeline (ArgoCD)

ArgoCD continuously watches the Kubernetes manifests stored in GitHub.

Whenever a new image tag is committed:

* Detect repository changes
* Compare desired state
* Sync automatically
* Deploy new Pods
* Remove old resources
* Self-heal configuration drift

---

# ☸️ Kubernetes Components

Frontend

* Deployment
* Service
* Horizontal Pod Autoscaler

Backend

* Deployment
* Service
* Horizontal Pod Autoscaler

Networking

* NGINX Ingress Controller

GitOps

* ArgoCD Application

---

# 📊 Monitoring Stack

Prometheus

* Cluster Metrics
* Node Metrics
* Pod Metrics

Grafana

* Kubernetes Dashboard
* CPU Usage
* Memory Usage
* Network Metrics

---

# 🔄 End-to-End Workflow

```text
Developer

↓

Git Push

↓

GitHub

↓

GitHub Actions

↓

Docker Build

↓

Amazon ECR

↓

Update Kubernetes Manifest

↓

Git Push

↓

ArgoCD detects change

↓

Sync

↓

Amazon EKS

↓

Pods Updated

↓

Users receive latest version
```

---

# 🔐 GitHub Secrets

```
AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY

AWS_REGION

AWS_ACCOUNT_ID
```

---

# 📈 Future Improvements

* Blue/Green Deployment
* Canary Deployment
* SonarQube
* Trivy Security Scan
* Slack Notifications
* Argo Rollouts
* KEDA Autoscaling
* AWS Load Balancer Controller
* External Secrets
* HashiCorp Vault
* Multi-Environment Deployment (Dev, Staging, Production)

---

# 🎯 Key Features

* Infrastructure as Code
* GitOps Deployment
* Fully Automated CI/CD
* Containerized Application
* Kubernetes Orchestration
* Monitoring & Observability
* Scalable Architecture
* Production-Ready DevOps Workflow

---

# 👨‍💻 Author

**Shivam Dewangan**

DevOps Engineer | AWS | Kubernetes | Terraform | Docker | GitHub Actions | ArgoCD
