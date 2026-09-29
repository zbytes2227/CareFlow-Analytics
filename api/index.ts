import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ─── Config ──────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'careflow_hospital_secret_2026';
const MONGODB_URI = process.env.MONGODB_URI || '';

// ─── In-Memory Fallback Store ─────────────────────────────────────────────────

const memStore = {
  users: new Map<string, any>(),
  patients: new Map<string, any>(),
};
let inMemoryMode = false;
let dbInitialized = false;

// ─── Mongoose Models ──────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'analyst' },
  department: { type: String, default: 'General Medicine' },
  createdAt: { type: Date, default: Date.now },
});

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  anonymizedName: String,
  ageGroup: String,
  gender: String,
  department: String,
  workflowType: String,
  visitDate: String,
  status: String,
  firstArrivalTime: String,
  finalCompletionTime: String,
  currentStage: String,
  totalWaitingTime: Number,
  totalProcessingTime: Number,
  totalDuration: Number,
  events: Array,
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const PatientModel = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

// ─── DB Init ──────────────────────────────────────────────────────────────────

async function initDB() {
  if (dbInitialized) return;

  if (MONGODB_URI) {
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      inMemoryMode = false;
      console.log('[MongoDB] Connected');
    } catch (err: any) {
      console.warn('[MongoDB] Failed, using in-memory store:', err.message);
      inMemoryMode = true;
    }
  } else {
    console.log('[DB] No MONGODB_URI set — using in-memory store');
    inMemoryMode = true;
  }

  // Seed default admin
  const adminEmail = 'admin@hospital.org';
  const hashedPw = await bcrypt.hash('admin', 10);

  if (inMemoryMode) {
    if (!memStore.users.has(adminEmail)) {
      memStore.users.set(adminEmail, {
        _id: 'usr_admin',
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPw,
        role: 'admin',
        department: 'System Administration',
        createdAt: new Date(),
      });
    }
  } else {
    const existing = await UserModel.findOne({ email: adminEmail });
    if (!existing) {
      await UserModel.create({
        name: 'System Administrator',
        email: adminEmail,
        password: hashedPw,
        role: 'admin',
        department: 'System Administration',
      });
    }
  }

  dbInitialized = true;
}

// ─── Express App ──────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Ensure DB is ready on every request
app.use(async (_req, _res, next) => {
  await initDB();
  next();
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────

function authenticateJWT(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Session expired or invalid token.' });
    req.user = decoded;
    next();
  });
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedPw = await bcrypt.hash(password, 10);
    const assignedRole = role || 'analyst';
    const assignedDept = department || 'General Medicine';

    if (inMemoryMode) {
      if (memStore.users.has(cleanEmail)) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }
      const user = {
        _id: `usr_${Date.now()}`,
        name,
        email: cleanEmail,
        password: hashedPw,
        role: assignedRole,
        department: assignedDept,
        createdAt: new Date(),
      };
      memStore.users.set(cleanEmail, user);
      const token = jwt.sign(
        { userId: user._id, email: user.email, name: user.name, role: user.role, department: user.department },
        JWT_SECRET,
        { expiresIn: '12h' }
      );
      return res.status(201).json({ message: 'Account registered successfully', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
    }

    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) return res.status(400).json({ error: 'User with this email already exists.' });

    const saved = await UserModel.create({ name, email: cleanEmail, password: hashedPw, role: assignedRole, department: assignedDept });
    const token = jwt.sign(
      { userId: saved._id.toString(), email: saved.email, name: saved.name, role: saved.role, department: saved.department },
      JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.status(201).json({ message: 'Account registered successfully', token, user: { id: saved._id, name: saved.name, email: saved.email, role: saved.role, department: saved.department } });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error during registration: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;
    if (inMemoryMode) {
      user = memStore.users.get(cleanEmail);
    } else {
      user = await UserModel.findOne({ email: cleanEmail });
    }

    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, name: user.name, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({ message: 'Authentication successful', token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login: ' + err.message });
  }
});

// Current User
app.get('/api/auth/me', authenticateJWT, (req: any, res) => {
  res.json({ user: req.user });
});

// ─── Patient Routes ───────────────────────────────────────────────────────────

// List patients
app.get('/api/patients', async (req, res) => {
  try {
    if (inMemoryMode) {
      const list = Array.from(memStore.patients.values());
      return res.json({ patients: list, count: list.length });
    }
    const { department, workflowType, status, searchQuery } = req.query;
    const query: any = {};
    if (department && department !== 'all') query.department = department;
    if (workflowType && workflowType !== 'all') query.workflowType = workflowType;
    if (status && status !== 'all') query.status = status;
    if (searchQuery) {
      const regex = new RegExp(String(searchQuery), 'i');
      query.$or = [{ patientId: regex }, { anonymizedName: regex }, { department: regex }, { currentStage: regex }];
    }
    const list = await PatientModel.find(query).sort({ firstArrivalTime: -1 }).lean();
    return res.json({ patients: list, count: list.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch patients: ' + err.message });
  }
});

// Single patient
app.get('/api/patients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = inMemoryMode
      ? memStore.patients.get(id)
      : await PatientModel.findOne({ patientId: id }).lean();
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    return res.json({ patient });
  } catch (err: any) {
    return res.status(500).json({ error: 'Error fetching patient: ' + err.message });
  }
});

// Check-in new patient
app.post('/api/patients', authenticateJWT, async (req: any, res) => {
  try {
    const { name, department, workflowType, ageGroup, gender, initialStage } = req.body;
    const count = inMemoryMode ? memStore.patients.size + 1 : (await PatientModel.countDocuments()) + 1;
    const patientId = `PT-${String(1000 + count).padStart(5, '0')}`;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.split('T')[0];
    const stageName = initialStage || (workflowType === 'Laboratory' ? 'Test Request & Registration' : 'Patient Arrival & Triage');

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
      events: [{
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
      }],
    };

    if (inMemoryMode) {
      memStore.patients.set(patientId, newPatient);
    } else {
      await PatientModel.create(newPatient);
    }

    return res.status(201).json({ message: 'Patient checked in successfully', patient: newPatient });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to check in patient: ' + err.message });
  }
});

// Advance patient stage
app.post('/api/patients/:id/advance', authenticateJWT, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { nextStage, waitMinutes, serviceMinutes, resourceId } = req.body;
    let patient: any = inMemoryMode
      ? memStore.patients.get(id)
      : await PatientModel.findOne({ patientId: id });

    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const wait = Number(waitMinutes) || 12;
    const service = Number(serviceMinutes) || 8;
    const now = Date.now();

    const newEvent = {
      eventId: `EV-${patient.patientId}-${patient.events.length + 1}`,
      patientId: patient.patientId,
      workflowType: patient.workflowType,
      department: patient.department,
      stage: nextStage,
      stageOrder: patient.events.length + 1,
      queueEntryTime: new Date(now - (wait + service) * 60000).toISOString(),
      serviceStartTime: new Date(now - service * 60000).toISOString(),
      serviceEndTime: new Date(now).toISOString(),
      timestamp: new Date().toISOString().split('T')[0],
      resourceId: resourceId || `Station 01 (${req.user?.name || 'Staff'})`,
      isDelayed: wait > 15,
    };

    patient.events.push(newEvent);
    patient.currentStage = nextStage;
    patient.totalWaitingTime = (patient.totalWaitingTime || 0) + wait;
    patient.totalProcessingTime = (patient.totalProcessingTime || 0) + service;
    patient.totalDuration = (patient.totalDuration || 0) + wait + service;

    if (/exit|completed|sign-off/i.test(nextStage)) {
      patient.status = 'Completed';
      patient.finalCompletionTime = new Date(now).toISOString();
    }

    if (inMemoryMode) {
      memStore.patients.set(id, patient);
    } else {
      await patient.save();
    }

    return res.json({ message: `Patient advanced to ${nextStage}`, patient });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to advance patient: ' + err.message });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    database: inMemoryMode ? 'In-Memory Store' : 'MongoDB',
    timestamp: new Date().toISOString(),
  });
});

export default app;
