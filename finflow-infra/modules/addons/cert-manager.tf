resource "helm_release" "cert_manager" {

  name = "cert-manager"

  repository = "https://charts.jetstack.io"

  chart = "cert-manager"

  namespace = "cert-manager"

  create_namespace = true

  version = "1.16.2"

  set {
    name  = "installCRDs"
    value = "true"
  }
}
