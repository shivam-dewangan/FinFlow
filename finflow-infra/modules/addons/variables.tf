variable "cluster_name" {
  type = string
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_ca" {
  type = string
}

variable "enable_argocd" {
  type = bool
}

variable "enable_monitoring" {
  type = bool
}

variable "enable_ingress" {
  type = bool
}
