# -----------------------------
# VPC Module
# -----------------------------

module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  region       = var.region
}


# -----------------------------
# EKS Module
# -----------------------------

module "eks" {
  source = "./modules/eks"

  project_name = var.project_name
  environment  = var.environment
  cluster_name = var.cluster_name

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  instance_type = var.instance_type

  node_desired_size = var.node_desired_size
  node_min_size     = var.node_min_size
  node_max_size     = var.node_max_size
}


# -----------------------------
# ECR Module
# -----------------------------

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"

      args = [
        "eks",
        "get-token",
        "--cluster-name",
        module.eks.cluster_name
      ]
    }
  }
}
# -----------------------------
# Kubernetes Addons
# -----------------------------

module "addons" {
  source = "./modules/addons"

  providers = {
    helm = helm
  }

  cluster_name     = module.eks.cluster_name
  cluster_endpoint = module.eks.cluster_endpoint
  cluster_ca       = module.eks.cluster_certificate_authority

  enable_argocd     = true
  enable_monitoring = true
  enable_ingress    = true

  depends_on = [
    module.eks
  ]
}
