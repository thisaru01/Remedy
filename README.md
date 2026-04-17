# Remedy - AI-Enabled Smart Healthcare Platform

Remedy is a **cloud-native healthcare platform** built using a **Microservices Architecture**. It incorporates AI-driven symptom checking, appointment scheduling, and telemedicine to provide a comprehensive digital healthcare experience.

---

## System Overview

The platform provides a complete digital healthcare solution including:

- **Authentication & Authorization:** Secure JWT-based access control.
- **Patient Management:** Profile management and medical history tracking.
- **Doctor Management:** Professional profiles and availability scheduling.
- **Appointment System:** Seamless booking and status tracking.
- **Telemedicine:** Integrated video consultation services.
- **Payment Processing:** Secure online transactions.
- **Notifications:** Real-time email and SMS alerts.
- **AI Symptom Checker:** Intelligent preliminary health assessments using Gemini AI.

All services are containerized and can be orchestrated using **Docker** or **Kubernetes**.

---

## Project Structure

```bash
Remedy/
│
├── frontend/                     # React frontend application
│
├── services/                     # Backend microservices
│   ├── auth-service/             # Identity & Access Management
│   ├── patient-service/          # Patient Profiles & Records
│   ├── doctor-service/           # Doctor Profiles & Schedules
│   ├── appointment-service/      # Booking & Scheduling Logic
│   ├── ai-service/               # AI-powered Symptom Checking
│   ├── telemedicine-service/      # Video Consultation Management
│   ├── payment-service/          # Billing & Transactions
│   └── notification-service/     # Communication Engine (Email/SMS)
│
├── gateway/                      # Express API Gateway
│
├── k8s/                          # Kubernetes Manifests
│
├── docker-compose.yml            # Local Orchestration Configuration
└── README.md
```

---

## Microservices

### Auth Service

- User registration, login, and secure session management.
- Role-based Access Control (RBAC) for Patients, Doctors, and Admins.

### Patient Service

- Manages patient profiles and medical records.
- Secure storage and retrieval of medical history.

### Doctor Service

- Manages doctor profiles, specialties, and availability.
- Enables doctors to manage their consultation schedules.

### Appointment Service

- Handles the end-to-end appointment lifecycle (Booking, Approval, Cancellation).
- Links patients with available doctors based on specialty.

### Telemedicine Service

- Manages secure video consultation rooms.
- Generates and validates access links for sessions.

### Payment Service

- Processes secure online payments.
- Tracks transaction status and history.

### Notification Service

- Dispatches automated email and SMS notifications.
- Keeps users informed about appointment updates and reminders.

### AI Service

- AI-powered symptom checking and health analysis.
- Integration with **Google Gemini AI**.
- Provides preliminary medical recommendations.

### API Gateway (Express)

- Central entry point for all client requests.
- Handles routing, JWT verification, and security enforcement.

---

## Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **AI Integration:** Google Gemini
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **Authentication:** JWT (JSON Web Tokens)

---

# README – Deployment Guide

## OVERVIEW

This project is a cloud-native healthcare platform built using a microservices architecture. It includes services for authentication, patient management, doctor management, appointments, payments, notifications, AI symptom checking, and telemedicine.

All services are containerized using Docker and deployed using Kubernetes. Prebuilt images are hosted on Docker Hub to allow deployment without requiring source code or local builds.

## PREREQUISITES

- Docker
- Kubernetes (Minikube / Docker Desktop / Kubernetes cluster)
- kubectl CLI

## DOCKER HUB IMAGES

All microservices are hosted on Docker Hub under:

**Docker Hub Username: thisaru01**

**Images:**

- `thisaru01/remedy-frontend:v1`
- `thisaru01/remedy-gateway:v1`
- `thisaru01/remedy-auth-service:v1`
- `thisaru01/remedy-patient-service:v1`
- `thisaru01/remedy-doctor-service:v1`
- `thisaru01/remedy-appointment-service:v1`
- `thisaru01/remedy-telemedicine-service:v1`
- `thisaru01/remedy-payment-service:v1`
- `thisaru01/remedy-notification-service:v1`
- `thisaru01/remedy-ai-service:v1`

Kubernetes automatically pulls these images during deployment.

## DEPLOYMENT STEPS

### Step 1: Clone Repository

```bash
git clone https://github.com/thisaru01/Remedy
cd Remedy
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Update values (database URIs, JWT secrets, API keys)

### Step 3: Create Kubernetes Namespace

```bash
kubectl apply -f k8s/00-namespace.yaml
```

### Step 4: Create Secrets

```bash
kubectl create secret generic remedy-env --from-env-file=.env -n remedy
```

### Step 5: Deploy All Services

```bash
kubectl apply -n remedy -f k8s/
```

At this stage Kubernetes will:

- Pull Docker images from Docker Hub
- Create pods and services
- Start all microservices

## ACCESSING THE APPLICATION

**API Gateway Access:**
`http://<NODE-IP>:30080`

**Frontend Access:**
`http://<NODE-IP>:30173`

**OR (for local development):**

- `http://localhost:30080`
- `http://localhost:30173`

## VERIFICATION COMMANDS

```bash
kubectl get pods -n remedy
kubectl get svc -n remedy
kubectl logs <pod-name> -n remedy
```

## TROUBLESHOOTING

**Restart deployments:**
`kubectl rollout restart deployment -n remedy`

**Re-deploy system:**

```bash
kubectl delete -n remedy -f k8s/
kubectl apply -n remedy -f k8s/
```

## IMPORTANT NOTES

- All Docker images are hosted on Docker Hub and publicly accessible.
- Kubernetes automatically pulls images during deployment.
- No source code build is required to run the system.
- Ensure `.env` file is properly configured before deployment.
