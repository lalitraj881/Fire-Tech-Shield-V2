export type Priority = 'critical' | 'semicritical' | 'normal';
export type JobType = 'maintenance' | 'repair';
export type DeviceStatus = 'pending' | 'completed' | 'failed';
export type InspectionResult = 'pass' | 'fail' | null;

export interface Job {
  id: string;
  name: string;
  type: JobType;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  lastInspectionDate: string;
  nextDueDate: string;
  priority: Priority;
  estimatedDeviceCount: number;
  openNCCount: number;
  ncReference?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  building: string;
  zone: string;
  installationDate: string;
  manufacturingDate: string;
  warrantyStart: string;
  warrantyEnd: string;
  expiryDate: string;
  status: DeviceStatus;
  jobId: string;
}

export interface InspectionHistory {
  id: string;
  deviceId: string;
  date: string;
  technician: string;
  result: 'pass' | 'fail';
  notes?: string;
  ncId?: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  type: 'toggle' | 'numeric' | 'text';
  required: boolean;
  critical: boolean;
  unit?: string;
  minValue?: number;
  maxValue?: number;
}

export interface NC {
  id: string;
  deviceId: string;
  jobId: string;
  status: 'open' | 'closed';
  description: string;
  createdDate: string;
  closedDate?: string;
  repairedBy?: string;
}

// Mock Jobs Data
export const mockJobs: Job[] = [
  {
    id: 'job-001',
    name: 'Q1 Fire Extinguisher Inspection',
    type: 'maintenance',
    customerId: 'cust-001',
    customerName: 'Apex Manufacturing Ltd',
    siteId: 'site-001',
    siteName: 'Main Factory Complex',
    siteAddress: '1234 Industrial Blvd, Detroit, MI 48201',
    lastInspectionDate: '2024-10-15',
    nextDueDate: '2025-01-15',
    priority: 'critical',
    estimatedDeviceCount: 24,
    openNCCount: 2,
    status: 'pending',
  },
  {
    id: 'job-002',
    name: 'Smoke Detector Maintenance',
    type: 'maintenance',
    customerId: 'cust-002',
    customerName: 'TechCorp Industries',
    siteId: 'site-002',
    siteName: 'R&D Building',
    siteAddress: '5678 Innovation Way, Detroit, MI 48202',
    lastInspectionDate: '2024-11-20',
    nextDueDate: '2025-01-20',
    priority: 'semicritical',
    estimatedDeviceCount: 18,
    openNCCount: 0,
    status: 'pending',
  },
  {
    id: 'job-003',
    name: 'Sprinkler System Check',
    type: 'maintenance',
    customerId: 'cust-003',
    customerName: 'Metro Warehouse Co',
    siteId: 'site-003',
    siteName: 'Distribution Center A',
    siteAddress: '9012 Logistics Dr, Detroit, MI 48203',
    lastInspectionDate: '2024-12-01',
    nextDueDate: '2025-02-01',
    priority: 'normal',
    estimatedDeviceCount: 32,
    openNCCount: 1,
    status: 'pending',
  },
  {
    id: 'job-004',
    name: 'Emergency Exit Light Inspection',
    type: 'maintenance',
    customerId: 'cust-001',
    customerName: 'Apex Manufacturing Ltd',
    siteId: 'site-001',
    siteName: 'Main Factory Complex',
    siteAddress: '1234 Industrial Blvd, Detroit, MI 48201',
    lastInspectionDate: '2024-09-10',
    nextDueDate: '2025-01-25',
    priority: 'normal',
    estimatedDeviceCount: 15,
    openNCCount: 0,
    status: 'pending',
  },
  {
    id: 'job-005',
    name: 'NC-2024-089 Corrective Action',
    type: 'repair',
    customerId: 'cust-002',
    customerName: 'TechCorp Industries',
    siteId: 'site-002',
    siteName: 'R&D Building',
    siteAddress: '5678 Innovation Way, Detroit, MI 48202',
    lastInspectionDate: '2024-12-10',
    nextDueDate: '2025-01-10',
    priority: 'critical',
    estimatedDeviceCount: 3,
    openNCCount: 3,
    ncReference: 'NC-2024-089',
    status: 'pending',
  },
  {
    id: 'job-006',
    name: 'NC-2024-092 Fire Alarm Repair',
    type: 'repair',
    customerId: 'cust-003',
    customerName: 'Metro Warehouse Co',
    siteId: 'site-003',
    siteName: 'Distribution Center A',
    siteAddress: '9012 Logistics Dr, Detroit, MI 48203',
    lastInspectionDate: '2024-12-15',
    nextDueDate: '2025-01-18',
    priority: 'semicritical',
    estimatedDeviceCount: 2,
    openNCCount: 2,
    ncReference: 'NC-2024-092',
    status: 'pending',
  },
];

// Mock Devices Data
export const mockDevices: Device[] = [
  // Devices for job-001
  {
    id: 'dev-001',
    name: 'Fire Extinguisher A1',
    serialNumber: 'FE-2022-001',
    type: 'ABC Dry Chemical',
    building: 'Building A',
    zone: 'Production Floor',
    installationDate: '2022-03-15',
    manufacturingDate: '2022-01-10',
    warrantyStart: '2022-03-15',
    warrantyEnd: '2025-03-15',
    expiryDate: '2027-01-10',
    status: 'pending',
    jobId: 'job-001',
  },
  {
    id: 'dev-002',
    name: 'Fire Extinguisher A2',
    serialNumber: 'FE-2022-002',
    type: 'ABC Dry Chemical',
    building: 'Building A',
    zone: 'Assembly Line 1',
    installationDate: '2022-03-15',
    manufacturingDate: '2022-01-10',
    warrantyStart: '2022-03-15',
    warrantyEnd: '2025-03-15',
    expiryDate: '2027-01-10',
    status: 'pending',
    jobId: 'job-001',
  },
  {
    id: 'dev-003',
    name: 'Fire Extinguisher B1',
    serialNumber: 'FE-2021-045',
    type: 'CO2',
    building: 'Building B',
    zone: 'Server Room',
    installationDate: '2021-08-20',
    manufacturingDate: '2021-06-01',
    warrantyStart: '2021-08-20',
    warrantyEnd: '2024-08-20',
    expiryDate: '2026-06-01',
    status: 'pending',
    jobId: 'job-001',
  },
  {
    id: 'dev-004',
    name: 'Fire Extinguisher B2',
    serialNumber: 'FE-2023-012',
    type: 'Water Mist',
    building: 'Building B',
    zone: 'Cafeteria',
    installationDate: '2023-02-10',
    manufacturingDate: '2023-01-05',
    warrantyStart: '2023-02-10',
    warrantyEnd: '2026-02-10',
    expiryDate: '2028-01-05',
    status: 'pending',
    jobId: 'job-001',
  },
  {
    id: 'dev-005',
    name: 'Fire Extinguisher C1',
    serialNumber: 'FE-2020-089',
    type: 'Foam',
    building: 'Building C',
    zone: 'Loading Dock',
    installationDate: '2020-11-25',
    manufacturingDate: '2020-09-15',
    warrantyStart: '2020-11-25',
    warrantyEnd: '2023-11-25',
    expiryDate: '2025-09-15',
    status: 'pending',
    jobId: 'job-001',
  },
  {
    id: 'dev-006',
    name: 'Fire Extinguisher C2',
    serialNumber: 'FE-2022-078',
    type: 'ABC Dry Chemical',
    building: 'Building C',
    zone: 'Warehouse',
    installationDate: '2022-07-12',
    manufacturingDate: '2022-05-20',
    warrantyStart: '2022-07-12',
    warrantyEnd: '2025-07-12',
    expiryDate: '2027-05-20',
    status: 'pending',
    jobId: 'job-001',
  },
];

// Mock Inspection History
export const mockInspectionHistory: InspectionHistory[] = [
  {
    id: 'insp-001',
    deviceId: 'dev-001',
    date: '2024-10-15',
    technician: 'John Smith',
    result: 'pass',
    notes: 'All checks passed. Pressure gauge in green zone.',
  },
  {
    id: 'insp-002',
    deviceId: 'dev-001',
    date: '2024-07-12',
    technician: 'Mike Johnson',
    result: 'pass',
  },
  {
    id: 'insp-003',
    deviceId: 'dev-003',
    date: '2024-10-15',
    technician: 'John Smith',
    result: 'fail',
    notes: 'Low pressure detected. Scheduled for recharge.',
    ncId: 'nc-001',
  },
  {
    id: 'insp-004',
    deviceId: 'dev-005',
    date: '2024-10-15',
    technician: 'John Smith',
    result: 'fail',
    notes: 'Damaged hose. Replacement required.',
    ncId: 'nc-002',
  },
];

// Mock NCs
export const mockNCs: NC[] = [
  {
    id: 'nc-001',
    deviceId: 'dev-003',
    jobId: 'job-001',
    status: 'open',
    description: 'Low pressure detected. Requires recharge.',
    createdDate: '2024-10-15',
  },
  {
    id: 'nc-002',
    deviceId: 'dev-005',
    jobId: 'job-001',
    status: 'open',
    description: 'Damaged discharge hose. Full replacement needed.',
    createdDate: '2024-10-15',
  },
];

// Mock Checklist Items
export const mockChecklistItems: ChecklistItem[] = [
  {
    id: 'check-001',
    name: 'Visual Inspection - No damage or corrosion',
    type: 'toggle',
    required: true,
    critical: true,
  },
  {
    id: 'check-002',
    name: 'Pressure Gauge Reading',
    type: 'numeric',
    required: true,
    critical: true,
    unit: 'PSI',
    minValue: 100,
    maxValue: 195,
  },
  {
    id: 'check-003',
    name: 'Safety Pin & Tamper Seal Intact',
    type: 'toggle',
    required: true,
    critical: true,
  },
  {
    id: 'check-004',
    name: 'Operating Instructions Legible',
    type: 'toggle',
    required: true,
    critical: false,
  },
  {
    id: 'check-005',
    name: 'Hose & Nozzle Condition',
    type: 'toggle',
    required: true,
    critical: true,
  },
  {
    id: 'check-006',
    name: 'Mounting Bracket Secure',
    type: 'toggle',
    required: true,
    critical: false,
  },
  {
    id: 'check-007',
    name: 'Weight Check',
    type: 'numeric',
    required: true,
    critical: false,
    unit: 'lbs',
    minValue: 4,
    maxValue: 25,
  },
  {
    id: 'check-008',
    name: 'Additional Notes',
    type: 'text',
    required: false,
    critical: false,
  },
];

// Helper functions
export const getJobsByType = (type: JobType): Job[] => {
  return mockJobs.filter(job => job.type === type);
};

export const getDevicesByJobId = (jobId: string): Device[] => {
  return mockDevices.filter(device => device.jobId === jobId);
};

export const getDeviceHistory = (deviceId: string): InspectionHistory[] => {
  return mockInspectionHistory.filter(h => h.deviceId === deviceId);
};

export const getDeviceNCs = (deviceId: string): NC[] => {
  return mockNCs.filter(nc => nc.deviceId === deviceId);
};

export const getJobById = (jobId: string): Job | undefined => {
  return mockJobs.find(job => job.id === jobId);
};

export const getDeviceById = (deviceId: string): Device | undefined => {
  return mockDevices.find(device => device.id === deviceId);
};
