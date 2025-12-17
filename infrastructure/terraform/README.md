# FitTrack Terraform Infrastructure

This directory contains Terraform configuration for deploying FitTrack to AWS.

## Prerequisites

- AWS Account
- AWS CLI configured with credentials
- Terraform installed (v1.0+)
- EC2 Key Pair created in AWS

## Variables

- `aws_region`: AWS region (default: us-east-1)
- `ami_id`: Amazon Linux 2 AMI ID
- `instance_type`: EC2 instance type (default: t2.micro)
- `key_name`: Name of your EC2 key pair
- `docker_image`: Docker image to deploy

## Usage

### Initialize Terraform
```bash
terraform init
```

### Plan Deployment
```bash
terraform plan \
  -var="docker_image=YOUR_DOCKERHUB_USERNAME/fittrack:latest" \
  -var="key_name=YOUR_KEY_PAIR_NAME"
```

### Apply Configuration
```bash
terraform apply \
  -var="docker_image=YOUR_DOCKERHUB_USERNAME/fittrack:latest" \
  -var="key_name=YOUR_KEY_PAIR_NAME"
```

### Destroy Infrastructure
```bash
terraform destroy \
  -var="docker_image=YOUR_DOCKERHUB_USERNAME/fittrack:latest" \
  -var="key_name=YOUR_KEY_PAIR_NAME"
```

## Outputs

- `instance_public_ip`: Public IP of EC2 instance
- `application_url`: Full URL to access FitTrack
- `health_check_url`: Health check endpoint URL # 