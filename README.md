# Smart-school-bus-tracking-ai
*Smart School Bus Tracking System – Making Every School Journey Safer and Smarter*

Imagine a situation where parents have no idea where their child's school bus is, how long it will take to arrive, or whether their child has safely reached school.

Our project aims to solve this problem.

**Smart School Bus Tracking System (SafeRide AI)** is an integrated web-based platform that provides real-time bus tracking, estimated arrival times, instant notifications, student pickup and drop monitoring, and centralized transportation management.

It connects parents, students, drivers, and school administrators through one intelligent platform.

Our vision is simple: No more uncertainty, unnecessary waiting, or communication gaps in school transportation. We are not just tracking buses; we are building a smarter, safer, and more transparent school transportation ecosystem.

---

# SafeRide AI • Fleet Command & Tracking Platform

> A modern, responsive, enterprise-grade SaaS platform connecting School Administrators, Parents/Guardians, and Bus Drivers to deliver real-time student transit safety, automated GPS tracking, and digital attendance.

---

## 🌟 Key Stakeholders & Dashboards

1. **School Administrator Dashboard**:
   - **Central Campus Dispatch Console**: Real-time fleet KPI metrics (34 Buses, 28 Active Trips, 1,240 Transported Students, 99.4% On-Time Performance SLA).
   - **Interactive Live Fleet Map**: OpenStreetMap Leaflet layer with custom bus markers, velocity indicators, route paths, and bus focus selector.
   - **Fleet Management (CRUD)**: Add, edit, decommission buses, view registrations, capacity limits, and driver assignments.
   - **Route Management**: Define stops, sequence ordering, route corridors, scheduled morning/evening arrival times.
   - **Student Directory**: Student boarding profiles, pickup/drop-off stops, linked guardians, and medical/transit notes.
   - **Digital Attendance System**: Real-time manifest monitoring (Waiting, Boarded, Dropped Off, Absent) with cross-dashboard sync.
   - **Speed & Route Deviation Monitoring**: Configurable 45 km/h limit alarms and 250m GPS corridor deviation telemetry.
   - **Fleet Analytics**: Recharts visualizations for On-Time SLA trends, passenger capacity utilization, and hourly velocity profiles.
   - **Rule-Assisted AI Transportation Assistant**: Instant natural language queries for delayed buses, onboard passenger counts, nearest bus to campus, and safety telemetry.

2. **Parent / Guardian Portal**:
   - **Multi-Child Switching**: Effortlessly toggle between linked students (e.g. Aarav and Ananya) to view dedicated transit cards.
   - **Live Bus Tracking**: Real-time bus animation along assigned route with 5-second simulated GPS telemetry.
   - **Real-Time Dynamic ETA**: Automatic calculation of distance remaining and estimated arrival minutes to child's specific stop.
   - **Approaching Stop Alert**: Visual status indicators when the bus is within 2 km of pickup.
   - **Driver Contact Center**: Direct simulated cabin calling and quick SMS message presets.
   - **Push Event Activity Log**: Instant notifications when child boards or is dropped off.

3. **Driver Companion App / Tablet Console**:
   - **Mobile-First High-Contrast UI**: Designed for easy viewing and operation when the bus is stationary.
   - **Trip Lifecycle Management**: Start Trip, Pause Trip, Resume Trip, and End Trip.
   - **GPS Privacy Control**: Location sharing is strictly active only during verified duty trips (`ACTIVE TRIP — LOCATION SHARED` vs `OFF DUTY — LOCATION NOT SHARED`).
   - **Touch Attendance Checklist**: Fast, one-click student boarding and drop-off status toggles.
   - **Route Stops Checklist**: Progressive stop arrival check-in with remaining student counts.
   - **Emergency SOS with Dual Confirmation**: Prominent SOS button requiring explicit reason confirmation before broadcasting emergency telemetry to dispatch and parents.
   - **Automated Accident & Vehicle Damage 4-Channel Broadcast**: In the event of vehicle damage or collision, automatically geo-locates the **Nearest Police Station**, dispatches the **Nearest Hospital Trauma Center & Ambulance**, broadcasts urgent alerts to **All Parents** of onboard students, and opens the **School Administration Incident Command Console**.

---

## 🚀 Getting Started & How to Run

### Prerequisites
- [Bun](https://bun.sh/) (v1.0+) or [Node.js](https://nodejs.org/) (v18+)

### Development Server
```bash
# Navigate to the repository
cd Smart-school-bus-tracking-ai

# Install dependencies (if not already installed)
bun install

# Start development server
bun run dev
```

Open your browser at `http://localhost:5173` to explore all three stakeholder dashboards with live GPS simulation and synchronized state.

### Production Build
```bash
bun run build
bun run preview
```

---

## 🔄 Cross-Dashboard Synchronization Engine

All 3 stakeholder interfaces operate on a centralized React Context with local storage caching and simulated telemetry:
- When a **Driver marks a student as Boarded**:
  - The driver's manifest immediately updates.
  - The parent dashboard updates with "Onboard" status, timestamp, and push notification.
  - The administrator's attendance log and onboard count reflect the change in real-time.
- When a **Driver presses Emergency SOS**:
  - An emergency banner pulses across the entire platform.
  - The bus marker turns into a flashing red SOS beacon on the dispatch map.
  - School administrators receive critical priority dispatch notices with one-click resolution.
- When **GPS Simulation is active**:
  - Buses advance along route waypoints every 5 seconds.
  - Parents receive real-time approaching notifications and updated ETAs.

---

## 🔥 Firebase Cloud Backend Integration

The system is configured with your Firebase project:
- **Project ID**: `smart-school-bus-tracking-ai`
- **Auth Domain**: `smart-school-bus-tracking-ai.firebaseapp.com`
- **Cloud Firestore**: Real-time collections for `buses`, `students`, `routes`, `drivers`, and `alerts`
- **One-Click Cloud Seeding**: Use the "Upload Fleet to Firestore" / "Sync Firestore" button in the navigation or Admin dashboard to populate all 34 buses, routes, and students into Cloud Firestore.

### Cloud Firestore Security Rules (For Development/Testing)
In your [Firebase Console](https://console.firebase.google.com/project/smart-school-bus-tracking-ai/firestore/rules), set test rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🛠 Tech Stack
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (Transportation SaaS design system)
- **Maps**: Leaflet & OpenStreetMap (custom vector markers & polylines)
- **Charts**: Recharts (Area, Bar, Pie, Line charts)
- **Icons**: Lucide React
