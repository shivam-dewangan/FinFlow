resource "helm_release" "prometheus" {

  count = var.enable_monitoring ? 1 : 0

  name = "prometheus"

  repository = "https://prometheus-community.github.io/helm-charts"

  chart = "kube-prometheus-stack"

  namespace = "monitoring"

  create_namespace = true

  version = "65.1.0"

  values = [
    yamlencode({
      grafana = {
        enabled = true
      }

      prometheus = {
        enabled = true
      }
    })
  ]
}
