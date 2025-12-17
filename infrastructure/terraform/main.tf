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

resource "aws_security_group" "fittrack_sg" {
  name        = "fittrack-security-group"
  description = "Security group for FitTrack application"

  lifecycle {
    create_before_destroy = true
  }
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

  vpc_security_group_ids = [aws_security_group.fittrack_sg.id]

  # User data script to install Docker and run the application
  user_data = <<-EOF
              #!/bin/bash
              set -e
              
              # Update system
              yum update -y
              
              # Install Docker
              yum install docker -y
              service docker start
              usermod -a -G docker ec2-user
              
              # Enable Docker to start on boot
              chkconfig docker on
              
              # Pull and run the Docker container
              docker pull ${var.docker_image}
              
              # Run container with restart policy
              docker run -d \
                -p 3000:3000 \
                --name fittrack \
                --restart unless-stopped \
                -v /var/lib/fittrack:/app/data \
                ${var.docker_image}
              
              # Wait for container to start
              sleep 10
              
              # Check if container is running
              docker ps | grep fittrack
              EOF

  # Wait for instance to be ready
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


