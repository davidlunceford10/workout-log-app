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

# -------------------------
# Security Group
# -------------------------
resource "aws_security_group" "fittrack_sg" {
  name_prefix = "fittrack-sg-"
  description = "Security group for FitTrack application"

  ingress {
    description = "FitTrack app"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH (optional)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "fittrack-sg"
  }
}

# -------------------------
# EC2 Instance
# -------------------------
resource "aws_instance" "fittrack_server" {
  ami           = var.ami_id
  instance_type = var.instance_type

  vpc_security_group_ids = [
    aws_security_group.fittrack_sg.id
  ]

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # Log output for debugging
              exec > >(tee /var/log/user-data.log)
              exec 2>&1

              echo "Starting deployment at $(date)"

              # Update system
              echo "Updating system packages..."
              yum update -y

              # Install Docker
              echo "Installing Docker..."
              yum install -y docker
              
              # Start and enable Docker
              echo "Starting Docker service..."
              systemctl start docker
              systemctl enable docker

              # Add ec2-user to docker group
              usermod -a -G docker ec2-user

              # Wait for Docker to be ready
              sleep 5

              # Pull and run application container
              echo "Pulling Docker image: ${var.docker_image}"
              docker pull ${var.docker_image}

              echo "Running Docker container..."
              docker run -d \
                --name fittrack \
                --restart unless-stopped \
                -p 3000:3000 \
                ${var.docker_image}

              # Check if container is running
              sleep 5
              docker ps
              
              echo "Deployment completed at $(date)"
              EOF

  user_data_replace_on_change = true

  tags = {
    Name        = "fittrack-server"
    Project     = "FitTrack"
    Environment = "production"
  }
}

# -------------------------
# Outputs
# -------------------------
output "instance_public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.fittrack_server.public_ip
}

output "application_url" {
  description = "URL of the FitTrack application"
  value       = "http://${aws_instance.fittrack_server.public_ip}:3000"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i your-key.pem ec2-user@${aws_instance.fittrack_server.public_ip}"
}
