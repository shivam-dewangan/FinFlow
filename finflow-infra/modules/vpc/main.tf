resource "aws_vpc" "main" {

  cidr_block = "10.0.0.0/16"

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}


# -----------------------------
# Internet Gateway
# -----------------------------

resource "aws_internet_gateway" "main" {

  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}


# -----------------------------
# Public Subnets
# -----------------------------

resource "aws_subnet" "public" {

  count = 2

  vpc_id = aws_vpc.main.id

  cidr_block = [
    "10.0.1.0/24",
    "10.0.2.0/24"
  ][count.index]

  availability_zone = [
    "ap-south-1a",
    "ap-south-1b"
  ][count.index]


  map_public_ip_on_launch = true


  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
  }
}


# -----------------------------
# Private Subnets
# -----------------------------

resource "aws_subnet" "private" {

  count = 2

  vpc_id = aws_vpc.main.id

  cidr_block = [
    "10.0.10.0/24",
    "10.0.20.0/24"
  ][count.index]


  availability_zone = [
    "ap-south-1a",
    "ap-south-1b"
  ][count.index]


  tags = {
    Name = "${var.project_name}-private-${count.index + 1}"
  }
}
