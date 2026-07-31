resource "helm_release" "argocd" {

  count = var.enable_argocd ? 1 : 0

  name = "argocd"

  repository = "https://argoproj.github.io/argo-helm"

  chart = "argo-cd"

  namespace = "argocd"

  create_namespace = true

  version = "7.7.7"

  depends_on = [
    kubernetes_namespace.argocd
  ]
}


resource "kubernetes_namespace" "argocd" {

  metadata {
    name = "argocd"
  }
}
