############################################
# Provider
############################################
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

############################################
# Variables (inline pour rester en 1 fichier)
############################################
variable "region" {
  description = "AWS region"
  default     = "eu-west-3"
}

variable "ami" {
  description = "AMI à utiliser (Amazon Linux par exemple)"
  type        = string
}

variable "key_name" {
  description = "Nom de ta key pair AWS pour SSH"
  type        = string
}

variable "bucket_name" {
  description = "Nom unique du bucket S3"
  type        = string
}

############################################
# VPC
############################################
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "demo-vpc"
  }
}

############################################
# Subnet Public
############################################
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "demo-public-subnet"
  }
}

############################################
# Internet Gateway
############################################
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "demo-igw"
  }
}

############################################
# Route Table + Association
############################################
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "demo-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

############################################
# Security Group (SSH)
############################################
resource "aws_security_group" "ec2_sg" {
  name   = "demo-ec2-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ⚠️ restreindre en prod
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

############################################
# EC2 Instance
############################################
resource "aws_instance" "ec2" {
  ami                    = var.ami
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  key_name               = var.key_name

  tags = {
    Name = "demo-ec2"
  }
}

############################################
# S3 Bucket
############################################
resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name

  tags = {
    Name = "demo-bucket"
  }
}

############################################
# Outputs
############################################
output "ec2_public_ip" {
  value = aws_instance.ec2.public_ip
}

output "s3_bucket" {
  value = aws_s3_bucket.bucket.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}