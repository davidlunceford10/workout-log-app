resource "aws_instance" "fittrack_server" {
  ami           = var.ami_id
  instance_type = var.instance_type

  vpc_security_group_ids = [
    aws_security_group.fittrack_sg.id
  ]

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # Update system
              yum update -y

              # Install Docker
              amazon-linux-extras install docker -y
              systemctl start docker
              systemctl enable docker

              # Pull and run application container
              docker pull davidlunceford10/fittrack:latest

              docker run -d \
                --name fittrack \
                --restart unless-stopped \
                -p 3000:3000 \
                davidlunceford10/fittrack:latest
              EOF

  user_data_replace_on_change = true

  tags = {
    Name        = "fittrack-server"
    Project     = "FitTrack"
    Environment = "production"
  }
}
