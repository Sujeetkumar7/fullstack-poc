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
- Gradle Wrapper (included from Spring Initializr)
- curl & unzip

## How to Run
### Backend
```
cd backend
./gradlew clean bootRun
```

### Frontend
```
cd frontend
npm install
ng serve
```

Application runs at: http://localhost:4200
Backend runs at: http://localhost:8080
