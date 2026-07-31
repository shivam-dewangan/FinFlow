resource "helm_release" "nginx_ingress" {

  count = var.enable_ingress ? 1 : 0

  name = "ingress-nginx"

  repository = "https://kubernetes.github.io/ingress-nginx"

  chart = "ingress-nginx"

  namespace = "ingress-nginx"

  create_namespace = true

  version = "4.12.0"

  values = [
    yamlencode({

      controller = {

        service = {

          type = "LoadBalancer"

        }

      }

    })
  ]
}
