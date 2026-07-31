variable "project_name" {
  description = "Project name"
  type        = string
  default     = "FinFlow"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "finflow-eks"
}

variable "instance_type" {
  description = "Worker node instance type"
  type        = string
  default     = "m7i-flex.large"
}

variable "node_desired_size" {
  description = "Desired worker nodes"
  type        = number
  default     = 2
}

variable "node_min_size" {
  description = "Minimum worker nodes"
  type        = number
  default     = 1
}

variable "node_max_size" {
  description = "Maximum worker nodes"
  type        = number
  default     = 3
}
