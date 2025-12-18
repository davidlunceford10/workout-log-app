variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "ami_id" {
  description = "AMI ID for EC2 instance (Amazon Linux 2)"
  type        = string
  # Amazon Linux 2 AMI for us-east-1 (update this if needed)
  # To find the latest: AWS Console > EC2 > AMIs > Search for "amazon-linux-2"
  default     = "ami-0c02fb55731490381"  # Amazon Linux 2
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"  # Free tier eligible
}

variable "docker_image" {
  description = "Docker image to deploy (format: username/image:tag)"
  type        = string
  # This will be provided via GitHub Secrets or command line
  # Example: "davidlunceford10/fittrack:latest" 
}
