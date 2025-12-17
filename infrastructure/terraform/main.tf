terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Security Group
resource "aws_security_group" "fittrack_sg" {
  name_prefix = "fittrack-sg-"
  description = "Security group for FitTrack application"

  lifecycle {
    create_before_destroy = true
  }

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application port
  ingress {
    description = "FitTrack Application"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Outbound internet access
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "fittrack-sg"
    Project     = "FitTrack"
    Environment = "production"
  }
}

# EC2 Instance
resource "aws_instance" "fittrack_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  vpc_security_group_ids = [
    aws_security_group.fittrack_sg.id
  ]

  user_data = <<-EOF
    #!/bin/bash
    set -e

    yum update -y

    yum install -y docker
    service docker start
    usermod -a -G docker ec2-user
    chkconfig docker on

    docker pull ${var.docker_image}

    docker run -d \
      -p 3000:3000 \
      --name fittrack \
      --restart unless-stopped \
      -v /var/lib/fittrack:/app/data \
      ${var.docker_image}

    sleep 10
    docker ps | grep fittrack
  EOF

  user_data_replace_on_change = true

  tags = {
    Name        = "fittrack-server"
    Project     = "FitTrack"
    Environment = "production"
  }
}

# Outputs
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.fittrack_server.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.fittrack_server.public_ip
}

output "instance_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.fittrack_server.public_dns
}

output "application_url" {
  description = "URL to access the FitTrack application"
  value       = "http://${aws_instance.fittrack_server.public_ip}:3000"
}

output "health_check_url" {
  description = "URL to check application health"
  value       = "http://${aws_instance.fittrack_server.public_ip}:3000/health"
}
