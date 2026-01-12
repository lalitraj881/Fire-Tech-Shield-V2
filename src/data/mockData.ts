export type Priority = 'critical' | 'semicritical' | 'normal';
export type JobType = 'maintenance' | 'repair';
export type DeviceStatus = 'pending' | 'completed' | 'failed';
export type JobStatus = 'not-started' | 'in-progress' | 'completed';
export type InspectionResult = 'pass' | 'fail' | null;
export type InspectionSeverity = 'pass' | 'minor' | 'critical' | 'optional';

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Site {
  id: string;
  customerId: string;
  name: string;
  address: string;
  gpsLat: number;
  gpsLng: number;
  totalDevices: number;
}

export interface Job {
  id: string;
  name: string;
  type: JobType;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  siteGpsLat: number;
  siteGpsLng: number;
  lastInspectionDate: string;
  nextDueDate: string;
  priority: Priority;
  estimatedDeviceCount: number;
  openNCCount: number;
  ncReference?: string;
  status: JobStatus;
}

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  type: string;
  systemType: string;
  building: string;
  zone: string;
  locationDescription: string;
  gpsLat?: number;
  gpsLng?: number;
  imageUrl?: string;
  manufacturer: string;
  installationDate: string;
  manufacturingDate: string;
  purchaseDate: string;
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
  severity?: InspectionSeverity;
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
  deviceName: string;
  deviceType: string;
  deviceSystemType: string;
  deviceImageUrl?: string;
  deviceLocationDescription: string;
  deviceGpsLat?: number;
  deviceGpsLng?: number;
  jobId: string;
  customerId: string;
  customerName: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  siteGpsLat: number;
  siteGpsLng: number;
  status: 'open' | 'closed';
  severity: InspectionSeverity;
  description: string;
  failedChecklistItems: string[];
  technicianRemarks: string;
  photoEvidence: string[];
  inspectionJobId: string;
  createdDate: string;
  createdBy: string;
  closedDate?: string;
  repairedBy?: string;
  workOrderId?: string;
  workOrderStatus?: 'pending' | 'assigned' | 'in-progress' | 'completed';
  workOrderAssignedTo?: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedCustomerIds: string[];
  assignedSiteIds: string[];
}

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'Apex Manufacturing Ltd',
    contactPerson: 'Sarah Johnson',
    email: 'sarah.johnson@apexmfg.com',
    phone: '+1 555-0101',
  },
  {
    id: 'cust-002',
    name: 'TechCorp Industries',
    contactPerson: 'Michael Chen',
    email: 'mchen@techcorp.com',
    phone: '+1 555-0102',
  },
  {
    id: 'cust-003',
    name: 'Metro Warehouse Co',
    contactPerson: 'Lisa Martinez',
    email: 'lmartinez@metrowarehouse.com',
    phone: '+1 555-0103',
  },
];

// Mock Sites
export const mockSites: Site[] = [
  {
    id: 'site-001',
    customerId: 'cust-001',
    name: 'Main Factory Complex',
    address: '1234 Industrial Blvd, Detroit, MI 48201',
    gpsLat: 42.3314,
    gpsLng: -83.0458,
    totalDevices: 48,
  },
  {
    id: 'site-002',
    customerId: 'cust-002',
    name: 'R&D Building',
    address: '5678 Innovation Way, Detroit, MI 48202',
    gpsLat: 42.3489,
    gpsLng: -83.0556,
    totalDevices: 32,
  },
  {
    id: 'site-003',
    customerId: 'cust-003',
    name: 'Distribution Center A',
    address: '9012 Logistics Dr, Detroit, MI 48203',
    gpsLat: 42.3651,
    gpsLng: -83.0681,
    totalDevices: 56,
  },
];

// Mock Technician
export const mockTechnician: Technician = {
  id: 'tech-001',
  name: 'John Smith',
  email: 'john.smith@fts.com',
  phone: '+1 555-1234',
  assignedCustomerIds: ['cust-001', 'cust-002', 'cust-003'],
  assignedSiteIds: ['site-001', 'site-002', 'site-003'],
};

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
    siteGpsLat: 42.3314,
    siteGpsLng: -83.0458,
    lastInspectionDate: '2024-10-15',
    nextDueDate: '2025-01-15',
    priority: 'critical',
    estimatedDeviceCount: 24,
    openNCCount: 2,
    status: 'not-started',
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
    siteGpsLat: 42.3489,
    siteGpsLng: -83.0556,
    lastInspectionDate: '2024-11-20',
    nextDueDate: '2025-01-20',
    priority: 'semicritical',
    estimatedDeviceCount: 18,
    openNCCount: 0,
    status: 'in-progress',
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
    siteGpsLat: 42.3651,
    siteGpsLng: -83.0681,
    lastInspectionDate: '2024-12-01',
    nextDueDate: '2025-02-01',
    priority: 'normal',
    estimatedDeviceCount: 32,
    openNCCount: 1,
    status: 'not-started',
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
    siteGpsLat: 42.3314,
    siteGpsLng: -83.0458,
    lastInspectionDate: '2024-09-10',
    nextDueDate: '2025-01-25',
    priority: 'normal',
    estimatedDeviceCount: 15,
    openNCCount: 0,
    status: 'not-started',
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
    siteGpsLat: 42.3489,
    siteGpsLng: -83.0556,
    lastInspectionDate: '2024-12-10',
    nextDueDate: '2025-01-10',
    priority: 'critical',
    estimatedDeviceCount: 3,
    openNCCount: 3,
    ncReference: 'NC-2024-089',
    status: 'not-started',
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
    siteGpsLat: 42.3651,
    siteGpsLng: -83.0681,
    lastInspectionDate: '2024-12-15',
    nextDueDate: '2025-01-18',
    priority: 'semicritical',
    estimatedDeviceCount: 2,
    openNCCount: 2,
    ncReference: 'NC-2024-092',
    status: 'not-started',
  },
];

// Mock Devices Data
export const mockDevices: Device[] = [
  {
    id: 'dev-001',
    name: 'Fire Extinguisher A1',
    serialNumber: 'FE-2022-001',
    type: 'ABC Dry Chemical',
    systemType: 'Fire Suppression',
    building: 'Building A',
    zone: 'Production Floor',
    locationDescription: 'Near main entrance, left wall, 1.5m height',
    gpsLat: 42.3315,
    gpsLng: -83.0459,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    manufacturer: 'Kidde',
    installationDate: '2022-03-15',
    manufacturingDate: '2022-01-10',
    purchaseDate: '2022-02-20',
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
    systemType: 'Fire Suppression',
    building: 'Building A',
    zone: 'Assembly Line 1',
    locationDescription: 'Assembly line 1 end, near emergency exit',
    gpsLat: 42.3316,
    gpsLng: -83.0460,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    manufacturer: 'Kidde',
    installationDate: '2022-03-15',
    manufacturingDate: '2022-01-10',
    purchaseDate: '2022-02-20',
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
    systemType: 'Fire Suppression',
    building: 'Building B',
    zone: 'Server Room',
    locationDescription: 'Server room entrance, right side of door',
    gpsLat: 42.3317,
    gpsLng: -83.0461,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    manufacturer: 'Amerex',
    installationDate: '2021-08-20',
    manufacturingDate: '2021-06-01',
    purchaseDate: '2021-07-15',
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
    systemType: 'Fire Suppression',
    building: 'Building B',
    zone: 'Cafeteria',
    locationDescription: 'Cafeteria main hall, near kitchen entrance',
    gpsLat: 42.3318,
    gpsLng: -83.0462,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    manufacturer: 'First Alert',
    installationDate: '2023-02-10',
    manufacturingDate: '2023-01-05',
    purchaseDate: '2023-01-25',
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
    systemType: 'Fire Suppression',
    building: 'Building C',
    zone: 'Loading Dock',
    locationDescription: 'Loading dock bay 3, left pillar',
    gpsLat: 42.3319,
    gpsLng: -83.0463,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    manufacturer: 'Buckeye',
    installationDate: '2020-11-25',
    manufacturingDate: '2020-09-15',
    purchaseDate: '2020-10-30',
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
    systemType: 'Fire Suppression',
    building: 'Building C',
    zone: 'Warehouse',
    locationDescription: 'Warehouse aisle 5, section B end',
    gpsLat: 42.3320,
    gpsLng: -83.0464,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    manufacturer: 'Kidde',
    installationDate: '2022-07-12',
    manufacturingDate: '2022-05-20',
    purchaseDate: '2022-06-25',
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
    severity: 'pass',
    notes: 'All checks passed. Pressure gauge in green zone.',
  },
  {
    id: 'insp-002',
    deviceId: 'dev-001',
    date: '2024-07-12',
    technician: 'Mike Johnson',
    result: 'pass',
    severity: 'pass',
  },
  {
    id: 'insp-003',
    deviceId: 'dev-003',
    date: '2024-10-15',
    technician: 'John Smith',
    result: 'fail',
    severity: 'critical',
    notes: 'Low pressure detected. Scheduled for recharge.',
    ncId: 'nc-001',
  },
  {
    id: 'insp-004',
    deviceId: 'dev-005',
    date: '2024-10-15',
    technician: 'John Smith',
    result: 'fail',
    severity: 'minor',
    notes: 'Damaged hose. Replacement required.',
    ncId: 'nc-002',
  },
];

// Mock NCs with full device location capture
export const mockNCs: NC[] = [
  {
    id: 'nc-001',
    deviceId: 'dev-003',
    deviceName: 'Fire Extinguisher B1',
    deviceType: 'CO2',
    deviceSystemType: 'Fire Suppression',
    deviceImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    deviceLocationDescription: 'Server room entrance, right side of door',
    deviceGpsLat: 42.3317,
    deviceGpsLng: -83.0461,
    jobId: 'job-001',
    customerId: 'cust-001',
    customerName: 'Apex Manufacturing Ltd',
    siteId: 'site-001',
    siteName: 'Main Factory Complex',
    siteAddress: '1234 Industrial Blvd, Detroit, MI 48201',
    siteGpsLat: 42.3314,
    siteGpsLng: -83.0458,
    status: 'open',
    severity: 'critical',
    description: 'Low pressure detected. Requires recharge.',
    failedChecklistItems: ['Pressure Gauge Reading'],
    technicianRemarks: 'Pressure gauge showing red zone. Unit needs immediate recharge. Safety seal intact.',
    photoEvidence: ['photo-nc001-1.jpg'],
    inspectionJobId: 'job-001',
    createdDate: '2024-10-15',
    createdBy: 'John Smith',
    workOrderId: 'WO-2024-001',
    workOrderStatus: 'pending',
    workOrderAssignedTo: 'Mike Johnson',
  },
  {
    id: 'nc-002',
    deviceId: 'dev-005',
    deviceName: 'Fire Extinguisher C1',
    deviceType: 'Foam',
    deviceSystemType: 'Fire Suppression',
    deviceImageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    deviceLocationDescription: 'Loading dock bay 3, left pillar',
    deviceGpsLat: 42.3319,
    deviceGpsLng: -83.0463,
    jobId: 'job-001',
    customerId: 'cust-001',
    customerName: 'Apex Manufacturing Ltd',
    siteId: 'site-001',
    siteName: 'Main Factory Complex',
    siteAddress: '1234 Industrial Blvd, Detroit, MI 48201',
    siteGpsLat: 42.3314,
    siteGpsLng: -83.0458,
    status: 'open',
    severity: 'minor',
    description: 'Damaged discharge hose. Full replacement needed.',
    failedChecklistItems: ['Hose & Nozzle Condition'],
    technicianRemarks: 'Visible cracks on hose near nozzle connection. Recommend full hose replacement.',
    photoEvidence: ['photo-nc002-1.jpg', 'photo-nc002-2.jpg'],
    inspectionJobId: 'job-001',
    createdDate: '2024-10-15',
    createdBy: 'John Smith',
    workOrderId: 'WO-2024-002',
    workOrderStatus: 'assigned',
    workOrderAssignedTo: 'Lisa Brown',
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

export const getCustomerById = (customerId: string): Customer | undefined => {
  return mockCustomers.find(customer => customer.id === customerId);
};

export const getSiteById = (siteId: string): Site | undefined => {
  return mockSites.find(site => site.id === siteId);
};

export const getSitesByCustomerId = (customerId: string): Site[] => {
  return mockSites.filter(site => site.customerId === customerId);
};

export const getJobsByCustomerId = (customerId: string): Job[] => {
  return mockJobs.filter(job => job.customerId === customerId);
};

export const getJobsBySiteId = (siteId: string): Job[] => {
  return mockJobs.filter(job => job.siteId === siteId);
};

export const getNcById = (ncId: string): NC | undefined => {
  return mockNCs.find(nc => nc.id === ncId);
};
