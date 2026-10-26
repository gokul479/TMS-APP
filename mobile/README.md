# 📱 TMS Mobile App (React Native / Expo)

This mobile app is converted from the Ticket Management System (TMS) Web App to run locally using **React Native (Expo)**.

---

## 🛠️ Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo Go app** on your Android/iOS mobile phone (or Android Studio Emulator / Xcode iOS Simulator)
3. **TMS Backend Server** running locally on port 5000 (`http://localhost:5000`)

---

## 🚀 How to Run locally

### 1. Start the Backend Server (Local)
In a command prompt, navigate to the `backend` directory and start the server:
```bash
cd backend
npm start
```
*Backend runs at `http://localhost:5000` connected to your MongoDB database.*

---

### 2. Start the React Native Mobile App
In another terminal, navigate to the `mobile` directory:

```bash
cd mobile
npm install
npm start
```

This will launch the **Expo Developer Tools**.

- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.
- **Physical Phone**: Scan the QR code using the **Expo Go** app on your phone.

---

## 🌐 Local API Configuration Note (`src/config/api.js`)

- **Android Emulator**: Connected automatically via `http://10.0.2.2:5000/api`
- **iOS Simulator**: Connected automatically via `http://localhost:5000/api`
- **Physical Mobile Device**: Change `DEFAULT_LOCAL_IP` in `mobile/src/config/api.js` to your computer's Wi-Fi IP address (e.g., `http://192.168.x.x:5000/api`).

---

## 📱 Features Included in Mobile App

1. **Authentication**: Login with email and password (JWT token stored using `AsyncStorage`).
2. **Dashboard**: Live ticket metrics (Total, Pending, In Progress, Resolved).
3. **Raise Ticket**: Submit ticket with Category, Priority, Department, Room & Photo attachment.
4. **Ticket List & Tracking**: View tickets filtered by status, with instant status update controls.
5. **Analytics & Reports**: Visual report summary.
6. **Admin Master**: Manage departments, blocks, and rooms.
