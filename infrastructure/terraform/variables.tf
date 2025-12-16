variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance (Amazon Linux 2)"
  type        = string
  default     = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2 in us-east-1
  # Note: Update this AMI ID based on your region
  # Find current AMIs at: https://aws.amazon.com/amazon-linux-ami/
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"  # Free tier eligible
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
  # This will be provided via GitHub Secrets or command line
}

variable "docker_image" {
  description = "Docker image to deploy (format: username/image:tag)"
  type        = string
  # This will be provided via GitHub Secrets or command line
  # Example: "yourusername/fittrack:latest"
}