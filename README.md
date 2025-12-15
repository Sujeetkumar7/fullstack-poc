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
- Gradle Wrapper (included from Spring Initializer)
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

### React Frontend

```
cd react-frontend
Then navigate to /app/web/package.json & /app/native/package.json and remove following lines from dependencies -
    "@rsd/ui": "workspace:*",
    "@rsd/api": "workspace:*",
    "@rsd/state": "workspace:*",
npm install
Then navigate to /app/web/package.json & /app/native/package.json and add the following lines back in dependencies -
    "@rsd/ui": "workspace:*",
    "@rsd/api": "workspace:*",
    "@rsd/state": "workspace:*",
npm run dev:web // start web app in development mode
num run dev:native // start the native app in development mode
```

Application runs at: http://localhost:4200
React Web Application runs at: http://localhost:5173
Backend runs at: http://localhost:8080
Swagger run at: http://localhost:8080/swagger-ui/index.html#/
