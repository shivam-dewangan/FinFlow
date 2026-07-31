resource "aws_ecr_repository" "frontend" {
  name = "finflow-frontend"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "FinFlow"
  }
}


resource "aws_ecr_repository" "backend" {
  name = "finflow-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "FinFlow"
  }
}
