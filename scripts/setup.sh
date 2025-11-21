#!/usr/bin/env bash
set -euo pipefail

echo "------------------------------------------"
echo "Creating Full-Stack POC Monorepo"
echo "Angular + Spring Boot"
echo "------------------------------------------"

# 1. Create main project folder
PROJECT_NAME="fullstack-poc"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"
echo "Project folder created: $PROJECT_NAME"

# 2. Create frontend using Angular CLI
echo "------------------------------------------"
echo "Generating Angular frontend..."
echo "------------------------------------------"
ng new frontend --routing --style=scss --skip-git true
echo "Angular app created."

# 3. Create backend using Spring Initializr
echo "------------------------------------------"
echo "Generating Spring Boot backend..."
echo "------------------------------------------"
curl -sSL https://start.spring.io/starter.zip \
 -d dependencies=web \
 -d name=backend \
 -d packageName=com.example.backend \
 -d javaVersion=21 \
 -d language=java \
 -d build=maven \
 -o backend.zip
unzip -q backend.zip -d backend
rm -f backend.zip
echo "Spring Boot backend created."

# 4. Create shared folders
echo "------------------------------------------"
echo "Creating shared folders..."
echo "------------------------------------------"
mkdir -p infra docs scripts
echo "Folders created: infra/, docs/, scripts/"

# 5. Create root README
echo "------------------------------------------"
echo "Creating main README..."
echo "------------------------------------------"
cat <<'EOF' > README.md
# Full Stack POC (Angular + Spring Boot)

## Structure
```
fullstack-poc/
├── frontend/   # Angular Application
├── backend/    # Spring Boot API
├── infra/      # Deployment, Terraform, Docker, etc.
├── docs/       # Design docs, architecture
└── scripts/    # Utility scripts
```

## Prerequisites
- Node.js (LTS) & npm
- Angular CLI (`npm i -g @angular/cli`)
- Java 21 (or OpenJDK 21)
- Maven Wrapper (included from Spring Initializr)
- curl & unzip

## How to Run
### Backend
```
cd backend
./mvnw spring-boot:run
```

### Frontend
```
cd frontend
npm install
ng serve
```

Application runs at: http://localhost:4200
Backend runs at: http://localhost:8080
EOF

echo "README created."

# 6. Final output
echo "------------------------------------------"
echo "Setup complete!"
echo "Your Full Stack POC is ready."
echo "------------------------------------------"
