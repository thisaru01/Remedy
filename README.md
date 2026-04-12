# Remedy

## AI-Enabled Smart Healthcare Platform

Remedy is a **cloud-native healthcare appointment and telemedicine system** developed using a **Microservices Architecture**. It enables patients and doctors to interact through a scalable, secure, and containerized platform.

---

## System Overview

The platform provides a complete digital healthcare solution including:

- Patient management
- Doctor management
- Appointment scheduling
- Secure online payments
- Real-time notifications
- Live video consultations (Telemedicine)

All services are independently deployed using **Docker** and orchestrated using **Kubernetes**.

---

## Project Structure

```bash
Remedy/
│
├── frontend/                     # React frontend application
│
├── services/                     # Backend microservices
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   └── app.js
│   │   ├── server.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── .env
│   │
│   ├── patient-service/
│   ├── doctor-service/
│   ├── appointment-service/
│   ├── telemedicine-service/
│   ├── payment-service/
│   └── notification-service/
│
├── gateway/                      # Express API Gateway
│
│
├── docker-compose.yml            # Local container orchestration
│
├── k8s/                          # Kubernetes configurations
│   ├── patient-deployment.yaml
│   ├── patient-service.yaml
│   ├── doctor-deployment.yaml
│   └── ...
│
├── .env                          # Shared environment variables
└── README.md
```

---

## Microservices

### auth Service

- User registration and login
- Authentication and authorization
- Updating password and status

### Patient Service

- Patient registration and authentication
- Patient Profile management
- Uploading medical reports
- Viewing medical history and prescriptions

### Doctor Service

- Doctor registration
- Profile and availability management
- Viewing patient records
- Issuing prescriptions

### Appointment Service

- Search doctors by specialty
- Book, update, and cancel appointments
- Accept / reject appointments
- Track appointment status

### Telemedicine Service

- Create and manage video consultation sessions
- Provide join links for patients and doctors
- Enable real-time doctor–patient communication

### Payment Service

- Handle secure online payments
- Manage transaction records

### Notification Service

- Send email and SMS notifications
- Appointment confirmations and updates

### API Gateway (Express)

- Central entry point for all client requests
- Verifies JWT from `Authorization: Bearer <token>`
- Routes requests to appropriate services and forwards trusted user context internally

---

## Technology Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **API Gateway:** NGINX
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **Authentication:** JWT

---

## Authentication & Authorization

- JWT-based authentication is implemented
- Role-based access control:
  - Patient
  - Doctor
  - Admin
- Secure communication between services

---

## System Workflow

1. Patient registers and logs in
2. Patient searches for doctors
3. Appointment is booked
4. Payment is completed
5. Notification is sent
6. Telemedicine Service creates a video session
7. Patient and doctor join the consultation
8. Doctor issues prescription

---

## Running the System (Docker)

### 1. Clone repository

```bash
git clone https://github.com/your-repo/Remedy.git
cd Remedy
```

### 2. Start all services

```bash
docker compose up --build
```

### 3. Access the system

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080

### Example gateway calls

- Login: `POST http://localhost:8080/api/auth/login`
- Update patient profile (current user): `PUT http://localhost:8080/api/patient-profiles/me`
  - Header: `Authorization: Bearer <token>`

---

## Kubernetes Deployment

Apply all configurations:

```bash
kubectl apply -f k8s/
```

Check running components:

```bash
kubectl get pods
kubectl get services
```
