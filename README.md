# 🎫 Ticket Management System (TMS) — Full-Stack Web & Mobile App

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Android%20%7C%20iOS-blue?style=for-the-badge&logo=react" alt="Platforms" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-brightgreen?style=for-the-badge&logo=node.js" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248?style=for-the-badge&logo=mongodb" alt="Database" />
  <img src="https://img.shields.io/badge/Mobile-React%20Native%20%7C%20Expo-000020?style=for-the-badge&logo=expo" alt="Mobile" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%7C%20BCrypt-red?style=for-the-badge" alt="Auth" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <b>A comprehensive, enterprise-grade Ticket & Complaint Lifecycle Management System built for institutions, universities, and organizations.</b>
  <br />
  Includes an intuitive <b>React Web Portal</b>, a high-performance <b>React Native (Expo) Mobile App</b>, and a secure <b>Express.js & MongoDB RESTful Backend</b>.
</p>

---

## 📌 Table of Contents

- [🌟 System Highlights](#-system-highlights)
- [🏗️ System Architecture](#️-system-architecture)
- [📱 Mobile Application (React Native / Expo)](#-mobile-application-react-native--expo)
- [💻 Web Portal (React.js)](#-web-portal-reactjs)
- [🔐 Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🚀 Quickstart & Installation Guide](#-quickstart--installation-guide)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Web Frontend Setup](#2-web-frontend-setup)
  - [3. Mobile App Setup](#3-mobile-app-setup)
- [🔌 REST API Reference](#-rest-api-reference)
  - [Authentication](#authentication)
  - [Tickets / Complaints](#tickets--complaints)
  - [Institutional Master (Admin)](#institutional-master-admin)
- [📄 Production Deployment](#-production-deployment)
- [🤝 Contributing & License](#-contributing--license)

---

## 🌟 System Highlights

- ⚡ **Multi-Platform Access**: Seamless cross-device experience across desktop browsers, tablets, Android, and iOS devices.
- 🎯 **End-to-End Ticket Lifecycle**: Automatic ticket ID generation, status tracking (`Pending` ➔ `In Progress` ➔ `Resolved` ➔ `Rejected`), SLA tracking, and priority tagging (`Low`, `Medium`, `High`, `Critical`).
- 📷 **Evidence Attachment**: Integrated photo upload via camera or photo library using `Multer` on backend and `expo-image-picker` on mobile.
- 🏢 **Hierarchical Campus Mapping**: Complete institutional structural hierarchy mapping: **Department ➔ Block ➔ Room / Facility**.
- 📊 **Visual Analytics & Reporting**: Real-time KPI counters, resolution rate tracking, department workload metrics, and export options.
- 🔒 **Enterprise Security**: JSON Web Token (JWT) stateless auth, password hashing via `bcryptjs`, and scoped endpoint protection.

---

## 🏗️ System Architecture

```
                    ┌───────────────────────────────────────────┐
                    │               CLIENT CLIENTS              │
                    │                                           │
                    │   ┌────────────────┐  ┌───────────────┐   │
                    │   │ React Web App  │  │ Expo App (iOS │   │
                    │   │  (Port 3000)   │  │   / Android)  │   │
                    │   └───────┬────────┘  └───────┬───────┘   │
                    └───────────┼───────────────────┼───────────┘
                                │                   │
                                │   RESTful JSON    │
                                └───┐           ┌───┘
                                    ▼           ▼
                    ┌───────────────────────────────────────────┐
                    │           BACKEND REST API SERVER         │
                    │            (Node.js / Express)            │
                    │               (Port 5000)                 │
                    │                                           │
                    │  ┌───────────────┐     ┌───────────────┐  │
                    │  │  JWT Auth &   │     │ Multer File   │  │
                    │  │  RBAC Guard   │     │ Upload Engine │  │
                    │  └───────┬───────┘     └───────┬───────┘  │
                    │          │                     │          │
                    │  ┌───────▼─────────────────────▼───────┐  │
                    │  │       Controllers & Business Logic  │  │
                    │  └──────────────────┬──────────────────┘  │
                    └─────────────────────┼─────────────────────┘
                                          │ Mongoose ODM
                                          ▼
                    ┌───────────────────────────────────────────┐
                    │               DATABASE LAYER              │
                    │                  MongoDB                  │
                    │                                           │
                    │  [Users]  [Complaints]  [Roles]           │
                    │  [Departments]  [Blocks]  [Rooms]         │
                    └───────────────────────────────────────────┘
```

---

## 📱 Mobile Application (React Native / Expo)

Built with **React Native (0.88)** and **Expo SDK 58**, optimized for lightning-fast on-ground issue reporting:

- 🚀 **Smooth Launch Experience**: Custom branded splash screen and fast authentication verification via `@react-native-async-storage/async-storage`.
- 📊 **Dynamic Dashboard**: Glanceable live counter cards for Total, Pending, In Progress, and Resolved issues.
- 📝 **Complaint Submission**: Department-wise auto-populating dropdowns, priority selector, detailed description, and camera image picker.
- 🔍 **Interactive Ticket Tracker**: Filter tickets by status tabs, inspect attached photos, and perform one-tap ticket status transitions.
- ⚙️ **Admin Masters on Mobile**: Admins can manage departments, campus blocks, and room allocations on the go.
- 🌐 **Adaptive Network Config**: Built-in support for Android Emulators (`10.0.2.2`), iOS Simulators (`localhost`), and physical devices (Wi-Fi LAN IP / ngrok).

---

## 💻 Web Portal (React.js)

A responsive, high-performance web dashboard built with **React 18** and modern Vanilla CSS:

- 🎨 **Glassmorphism & Modern UI**: Tailored color palettes, sleek cards, micro-animations, and dynamic status badges.
- 📋 **Master Complaints Table**: Search, sort, filter by date, category, status, or department with instant client-side response.
- 📈 **Executive Analytics & Reports**: Trend analysis, resolution efficiency metrics, and department complaint distribution breakdown.
- 👥 **User & Role Administration**: Manage system users, assign specialized roles, and control permission scopes.

---

## 🔐 Role-Based Access Control (RBAC)

| Role | Raise Tickets | View Own Tickets | View All Tickets | Update Status | Master Management | Reports Access |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Staff / Technician** | ✅ | ✅ | ✅ (Department) | ✅ | ❌ | ✅ (Limited) |
| **Student / User** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🛠️ Tech Stack

### Frontend & Mobile
| Component | Technology | Version |
| :--- | :--- | :--- |
| **Mobile Framework** | React Native / Expo | SDK 58 (RN 0.88) |
| **Navigation** | React Navigation (Native Stack) | v7 |
| **Web Framework** | React.js | v18.2 |
| **Routing (Web)** | React Router DOM | v6.11 |
| **HTTP Client** | Axios | v1.6+ |
| **Icons & Assets** | React Native SVG / Vector Icons | Latest |

### Backend & Database
| Component | Technology | Version |
| :--- | :--- | :--- |
| **Runtime** | Node.js (LTS) | v18+ |
| **Server Framework**| Express.js | v4.18 |
| **Database** | MongoDB | v6+ |
| **ODM** | Mongoose | v7.0 |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | v9.0 |
| **Encryption** | `bcryptjs` | v2.4 |
| **File Storage** | `multer` | v1.4 |

---

## 📂 Project Directory Structure

```text
TMS-APP/
├── backend/
│   ├── config/             # Database connection & configurations
│   ├── controllers/        # Express route controllers (Auth, Complaints, etc.)
│   ├── middleware/         # Auth verification & role guards
│   ├── models/             # Mongoose schemas (User, Complaint, Department, Room)
│   ├── routes/             # REST API routes
│   ├── scripts/            # Seeders & SuperAdmin initialization scripts
│   ├── uploads/            # Uploaded complaint attachments directory
│   ├── server.js           # Server entry point
│   └── package.json
│
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Cards, Modals)
│   │   ├── pages/          # Web views (Dashboard, Complaints, Reports, Users)
│   │   ├── services/       # Axios API client configurations
│   │   ├── App.js          # Main web application & routing
│   │   └── index.css       # Global styles & design system
│   └── package.json
│
├── mobile/
│   ├── assets/             # Mobile launcher icons & splash screens
│   ├── src/
│   │   ├── components/     # Mobile UI components (SplashScreen, CustomButtons)
│   │   ├── config/         # Environment & backend API URL resolver
│   │   ├── context/        # Auth Context provider & state
│   │   └── screens/        # Screen controllers (Login, Dashboard, Form, List, etc.)
│   ├── App.js              # Expo root entry component
│   ├── app.json            # Expo configuration manifest
│   └── package.json
│
├── tms-nginx.conf          # Nginx reverse proxy configuration for deployment
└── README.md               # Master Project Documentation
```

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
- **Node.js** (v18.x or later)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Expo Go App** (available on Google Play Store & iOS App Store)
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure Environment Variables
# Create a .env file in the backend directory:
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/tms_database
# JWT_SECRET=your_super_secret_jwt_key_here

# (Optional) Seed initial database data & admin accounts
node scripts/bootstrapSuperAdmin.js
node scripts/seedData.js

# Start backend server
npm start
# Server runs on: http://localhost:5000
```

---

### 2. Web Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# Web app runs on: http://localhost:3000
```

---

### 3. Mobile App Setup

```bash
# Open a third terminal and navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Configure backend host IP in mobile/src/config/api.js:
# - Android Emulator: Uses http://10.0.2.2:5000/api
# - iOS Simulator: Uses http://localhost:5000/api
# - Physical Device: Set DEFAULT_LOCAL_IP to your PC's Wi-Fi IPv4 address (e.g. 192.168.1.15)

# Start Expo Metro bundler
npx expo start -c
```

#### Running on Device:
- **Physical Phone**: Open camera or **Expo Go** app and scan the QR code in your terminal.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.
- **Web Preview**: Press `w` in the terminal.

---

## 🔌 REST API Reference

### Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate & get JWT token | Public |
| `GET` | `/api/auth/profile` | Retrieve logged-in user profile | Authenticated |

### Tickets / Complaints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/complaints` | Fetch list of complaints (filtered by user/role) | Authenticated |
| `POST` | `/api/complaints` | Submit new complaint with attachment (`multipart/form-data`) | Authenticated |
| `GET` | `/api/complaints/:id` | Get single complaint details | Authenticated |
| `PUT` | `/api/complaints/:id/status` | Update ticket status (`Pending`, `In Progress`, etc.) | Admin / Staff |
| `DELETE` | `/api/complaints/:id` | Remove a ticket record | Super Admin |

### Institutional Master (Admin)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET / POST` | `/api/departments` | List or create departments | Admin |
| `GET / POST` | `/api/blocks` | List or create campus building blocks | Admin |
| `GET / POST` | `/api/rooms` | List or register rooms under a block | Admin |
| `GET / POST` | `/api/users` | List or create user accounts | Super Admin |

---

## 📄 Production Deployment

For production web server setups, a ready-to-use Nginx configuration file is provided in `tms-nginx.conf`:
- Reverse proxies API requests to backend Express server on port 5000.
- Serves optimized static React production build files.
- Includes static file caching and security headers.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!

Distributed under the **MIT License**. Created with ❤️ by **[Gokul](https://github.com/gokul479)**.
