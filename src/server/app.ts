import express from 'express';
import dotenv from 'dotenv';
import { connectDB, isUsingMemoryStore, memoryStore } from './db';
import { UserModel } from './models/User';
import { PatientModel } from './models/Patient';
import { 
  hashPassword, 
  comparePassword, 
  signToken, 
  authenticateJWT, 
  AuthRequest 
} from './auth';

dotenv.config();

export const app = express();

app.use(express.json());

// CORS middleware for cross-origin API access (required for Vercel deployment)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize database connection
let dbInitialized = false;
export async function initializeDatabase() {
  if (dbInitialized) return;
  await connectDB();

  // Seed default admin user for production initial setup
  const adminEmail = 'admin@hospital.org';
  const adminPassword = 'admin'; // User should change this in production
  
  if (isUsingMemoryStore()) {
    if (!memoryStore.users.has(adminEmail)) {
      const hashedPassword = await hashPassword(adminPassword);
      memoryStore.users.set(adminEmail, {
        _id: `usr_${Date.now()}`,
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        department: 'System Administration',
        createdAt: new Date(),
      });
    }
  } else {
    const existing = await UserModel.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await hashPassword(adminPassword);
      await UserModel.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        department: 'System Administration',
      });
    }
  }

  dbInitialized = true;
}




// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let existingUser = null;
    if (isUsingMemoryStore()) {
      existingUser = memoryStore.users.get(cleanEmail);
    } else {
      existingUser = await UserModel.findOne({ email: cleanEmail });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const assignedRole = role || 'analyst';
    const assignedDept = department || 'General Medicine';

    let savedUser: any = null;
    if (isUsingMemoryStore()) {
      savedUser = {
        _id: `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        department: assignedDept,
        createdAt: new Date(),
      };
      memoryStore.users.set(cleanEmail, savedUser);
    } else {
      savedUser = await UserModel.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: assignedRole,
        department: assignedDept,
      });
    }

    const token = signToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      department: savedUser.department,
    });

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        department: savedUser.department,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;
    if (isUsingMemoryStore()) {
      user = memoryStore.users.get(cleanEmail);
    } else {
      user = await UserModel.findOne({ email: cleanEmail });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    });

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Current User Profile
app.get('/api/auth/me', authenticateJWT, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// ==========================================
// PATIENT OPERATIONAL RECORD ROUTES
// ==========================================

// Get Patients
app.get('/api/patients', async (req, res) => {
  try {
    const { department, workflowType, status, searchQuery } = req.query;

    let patientList: any[] = [];
    if (isUsingMemoryStore()) {
      patientList = Array.from(memoryStore.patients.values());
    } else {
      const query: any = {};
      if (department && department !== 'all') query.department = department;
      if (workflowType && workflowType !== 'all') query.workflowType = workflowType;
      if (status && status !== 'all') query.status = status;
      if (searchQuery) {
        const regex = new RegExp(String(searchQuery), 'i');
        query.$or = [
          { patientId: regex },
          { anonymizedName: regex },
          { department: regex },
          { currentStage: regex },
        ];
      }
      patientList = await PatientModel.find(query).sort({ firstArrivalTime: -1 }).lean();
    }

    res.json({ patients: patientList, count: patientList.length });
  } catch (err: any) {
    console.error('Fetch patients error:', err);
    res.status(500).json({ error: 'Failed retrieving patients: ' + err.message });
  }
});

// Get Single Patient
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let patient: any = null;

    if (isUsingMemoryStore()) {
      patient = memoryStore.patients.get(id);
    } else {
      patient = await PatientModel.findOne({ patientId: id }).lean();
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient encounter record not found' });
    }

    res.json({ patient });
  } catch (err: any) {
    res.status(500).json({ error: 'Error fetching patient: ' + err.message });
  }
});

// Create / Check-in New Real Patient
app.post('/api/patients', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { name, department, workflowType, ageGroup, gender, initialStage } = req.body;

    const count = isUsingMemoryStore() 
      ? memoryStore.patients.size + 1 
      : (await PatientModel.countDocuments()) + 1;

    const patientId = `PT-${String(1000 + count).padStart(5, '0')}`;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];

    const stageName = initialStage || (workflowType === 'Laboratory' ? 'Test Request & Registration' : 'Patient Arrival & Triage');

    const initialEvent = {
      eventId: `EV-${patientId}-1`,
      patientId,
      workflowType: workflowType || 'OPD',
      department: department || 'General Medicine',
      stage: stageName,
      stageOrder: 1,
      queueEntryTime: nowIso,
      serviceStartTime: nowIso,
      serviceEndTime: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
      timestamp: todayStr,
      resourceId: `Triage Desk (${req.user?.name || 'Staff'})`,
      isDelayed: false,
    };

    const newPatient = {
      patientId,
      anonymizedName: name || `Case #${1000 + count}`,
      ageGroup: ageGroup || '36-50',
      gender: gender || 'Other',
      department: department || 'General Medicine',
      workflowType: workflowType || 'OPD',
      visitDate: todayStr,
      status: 'In Progress',
      firstArrivalTime: nowIso,
      currentStage: stageName,
      totalWaitingTime: 0,
      totalProcessingTime: 3,
      totalDuration: 3,
      events: [initialEvent],
    };

    if (isUsingMemoryStore()) {
      memoryStore.patients.set(patientId, newPatient);
    } else {
      await PatientModel.create(newPatient);
    }

    res.status(201).json({
      message: 'Patient registered and checked into active flow',
      patient: newPatient,
    });
  } catch (err: any) {
    console.error('Check-in error:', err);
    res.status(500).json({ error: 'Failed registering patient: ' + err.message });
  }
});

// Advance Patient to Next Stage
app.post('/api/patients/:id/advance', authenticateJWT, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { nextStage, waitMinutes, serviceMinutes, resourceId } = req.body;

    let patient: any = null;
    if (isUsingMemoryStore()) {
      patient = memoryStore.patients.get(id);
    } else {
      patient = await PatientModel.findOne({ patientId: id });
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const wait = Number(waitMinutes) || 12;
    const service = Number(serviceMinutes) || 8;
    const now = Date.now();
    const queueEntry = new Date(now - (wait + service) * 60 * 1000).toISOString();
    const serviceStart = new Date(now - service * 60 * 1000).toISOString();
    const serviceEnd = new Date(now).toISOString();

    const newEvent = {
      eventId: `EV-${patient.patientId}-${patient.events.length + 1}`,
      patientId: patient.patientId,
      workflowType: patient.workflowType,
      department: patient.department,
      stage: nextStage,
      stageOrder: patient.events.length + 1,
      queueEntryTime: queueEntry,
      serviceStartTime: serviceStart,
      serviceEndTime: serviceEnd,
      timestamp: new Date().toISOString().split('T')[0],
      resourceId: resourceId || `Station 01 (${req.user?.name || 'Staff'})`,
      isDelayed: wait > 15,
    };

    patient.events.push(newEvent);
    patient.currentStage = nextStage;
    patient.totalWaitingTime += wait;
    patient.totalProcessingTime += service;
    patient.totalDuration += wait + service;

    if (nextStage.includes('Exit') || nextStage.includes('Completed') || nextStage.includes('Sign-off')) {
      patient.status = 'Completed';
      patient.finalCompletionTime = serviceEnd;
    }

    if (isUsingMemoryStore()) {
      memoryStore.patients.set(id, patient);
    } else {
      await patient.save();
    }

    res.json({ message: 'Patient advanced to ' + nextStage, patient });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed advancing patient: ' + err.message });
  }
});

// System Status / Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: isUsingMemoryStore() ? 'In-Memory Store' : 'MongoDB',
    authenticatedUsersCount: isUsingMemoryStore() ? memoryStore.users.size : 'Active in Mongo',
    patientsCount: isUsingMemoryStore() ? memoryStore.patients.size : 'Active in Mongo',
    timestamp: new Date().toISOString(),
  });
});
