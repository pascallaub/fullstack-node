#!/bin/bash
for name in manager worker1 worker2 worker3; do
  multipass exec $name -- bash -c "
    curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    sudo usermod -aG docker ubuntu
  "
done