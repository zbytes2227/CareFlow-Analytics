# CareFlow Analytics (Hospital Workflow Analytics)

CareFlow Analytics is a production-ready, full-stack hospital operational analytics application. It allows hospital administrators, process analysts, and clinical staff to visualize patient journeys, track workflow performance, and instantly identify bottlenecks in clinical operations.

## Features

- **Secure Authentication**: Role-based staff authentication (Admin, Nurse, Analyst, Physician) built securely with JWT and bcrypt.
- **Real-time Check-In**: Check-in new patients into the operational flow in real-time, instantly queuing them into their initial stages.
- **Journey Tracking**: Track every stage of a patient's journey through the hospital with interactive timeline visuals.
- **Advanced Dashboard**: Real-time Key Performance Indicators (KPIs) monitoring average wait times, active workflows, and department capacity.
- **Bottleneck Detection Engine**: Advanced statistical formulas proactively flag workflow stages with unexpectedly high wait times.
- **Scenario Simulator**: An interactive "What-If" engine to test adding resources (e.g., adding an extra triage nurse) and seeing the projected impact on waiting times.
- **Export Data**: Easily export filtered analytics data to JSON for offline review and reporting.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React (Icons), Recharts (Data Visualization).
- **Backend**: Node.js, Express, TypeScript (via tsx).
- **Database**: MongoDB (via Mongoose) with an in-memory seamless fallback system.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, bun, or yarn
- A MongoDB cluster (optional, falls back to in-memory store if no `.env` provided)

### Installation

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd CareFlow-Analytics-main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment Setup (Optional)**:
   Create a `.env` file in the root directory if you wish to connect to a real MongoDB instance. Otherwise, the app will seamlessly run in memory.
   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/careflow?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_key
   PORT=3000
   ```

### Running the Application

Start the full-stack application (the Vite frontend and Express backend both run concurrently):

```bash
npm run dev
# or
bun run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### Initial Admin Setup

Upon the very first launch, if the database is completely empty, the backend will automatically seed an initial System Administrator account so you can log in immediately:

- **Email**: `admin@hospital.org`
- **Password**: `admin`

*(Ensure you change this password or register a new administrative account after deploying to a production environment).*

## Building for Production

To create a highly optimized, minified production build:

```bash
npm run build
```

This will generate a `dist/` folder containing the optimized frontend code.

## License

Private/Proprietary. All rights reserved.
