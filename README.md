# Doctor Tracker — Backend API Server (NestJS + MongoDB Atlas)

## Quick Start Guide

### 1. Configure Environment
Ensure `server/.env` contains your MongoDB Atlas connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/doctor_tracker?retryWrites=true&w=majority
JWT_SECRET=doctor_tracker_jwt_super_secret_key_2026_xyz_!@#
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### 2. Seed Sample Database (Admin, Doctors, Patients)
```bash
npm run seed
```
**Admin Credentials:**
- Email: `admin@doctortracker.com`
- Password: `admin123456`

### 3. Build & Run the Server
```bash
# Development (with hot-reload)
npm run start:dev

# Production (runs compiled dist/main.js)
npm run build
npm run start:prod
```

### 4. How to See All Routes With Methods

- **Interactive Swagger UI:** Open [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **Terminal Startup Output:** Every registered endpoint is logged on server boot.

### API Routes Table

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/me` | Bearer JWT | Current user profile |
| `GET` | `/api/doctors` | Bearer JWT | Doctors list (page, limit, search, filters) |
| `POST` | `/api/doctors` | Bearer JWT | Create doctor |
| `GET` | `/api/doctors/:id` | Bearer JWT | Doctor details + assigned patients |
| `PUT` | `/api/doctors/:id` | Bearer JWT | Update doctor |
| `DELETE` | `/api/doctors/:id` | Bearer JWT | Delete doctor & cascade delete patients |
| `POST` | `/api/doctors/:id/patients` | Bearer JWT | Add patient directly under doctor |
| `DELETE` | `/api/doctors/:id/patients/:patientId` | Bearer JWT | Remove patient from doctor |
| `GET` | `/api/patients` | Bearer JWT | Patients list (page, limit, search, filters) |
| `POST` | `/api/patients` | Bearer JWT | Create patient |
| `GET` | `/api/patients/:id` | Bearer JWT | Single patient details |
| `PUT` | `/api/patients/:id` | Bearer JWT | Update patient |
| `DELETE` | `/api/patients/:id` | Bearer JWT | Delete patient |
| `GET` | `/api/analytics/dashboard` | Bearer JWT | Aggregate KPIs, chart trends, and distributions |
