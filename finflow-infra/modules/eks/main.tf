resource "aws_iam_role" "eks_cluster" {

  name = "${var.project_name}-eks-cluster-role"

  assume_role_policy = jsonencode({

    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "eks.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"

  role = aws_iam_role.eks_cluster.name
}


# -----------------------------
# EKS Node Role
# -----------------------------

resource "aws_iam_role" "eks_nodes" {

  name = "${var.project_name}-eks-node-role"

  assume_role_policy = jsonencode({

    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })
}


resource "aws_iam_role_policy_attachment" "eks_worker_policy" {

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"

  role = aws_iam_role.eks_nodes.name
}


resource "aws_iam_role_policy_attachment" "eks_cni_policy" {

  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"

  role = aws_iam_role.eks_nodes.name
}


resource "aws_iam_role_policy_attachment" "eks_registry_policy" {

  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"

  role = aws_iam_role.eks_nodes.name
}


# -----------------------------
# EKS Cluster
# -----------------------------

resource "aws_eks_cluster" "main" {

  name = "${var.project_name}-eks"

  version = "1.31"

  role_arn = aws_iam_role.eks_cluster.arn


  vpc_config {

    subnet_ids = var.private_subnet_ids

    endpoint_public_access = true

    endpoint_private_access = false
  }


  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}


# -----------------------------
# Node Group
# -----------------------------

resource "aws_eks_node_group" "main" {

  cluster_name = aws_eks_cluster.main.name

  node_group_name = "${var.project_name}-worker-nodes"

  node_role_arn = aws_iam_role.eks_nodes.arn

  subnet_ids = var.private_subnet_ids


  instance_types = [
     var.instance_type
  ]


  scaling_config {

    desired_size = 2

    max_size = 3

    min_size = 1
  }


  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_registry_policy
  ]
}
