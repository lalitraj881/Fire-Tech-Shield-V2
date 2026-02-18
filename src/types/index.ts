// Type definitions for Fire Tech Shield application

// ============================================
// Basic Types
// ============================================

export type Priority = 'critical' | 'semicritical' | 'normal' | 'low';
export type JobType = 'maintenance' | 'repair';
export type DeviceStatus = 'pending' | 'completed' | 'failed';
export type JobStatus = 'not-started' | 'in-progress' | 'completed';
export type InspectionResult = 'pass' | 'fail' | null;
export type InspectionSeverity = 'pass' | 'minor' | 'critical' | 'optional';

// ============================================
// Core Entities
// ============================================

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
  site_code?: string;  // API field
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
  siteId?: string;
  isVerified?: boolean;
  installed?: boolean;
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
  severity?: string;  
  requiresPhoto?: boolean;  
  requiresDescription?: boolean;  
  isActive?: boolean;  
  colorPass?: string;  
  colorMinor?: string;  
  colorCritical?: string;  
  colorOptional?: string;  
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
  workOrderId?: string;
  workOrderStatus?: string;
  workOrderAssignedTo?: string;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedCustomerIds: string[];
  assignedSiteIds?: string[];
}

// ============================================
// API Payload Types
// ============================================

export interface InspectionJobPayload {
  message: {
    inspection_job: InspectionJob;
    systems: SystemType[];
    device_types: DeviceType[];
    devices: APIDevice[];
    checklists: DeviceChecklist[];
  };
}

export interface InspectionJob {
  name: string;
  customer: string;
  site: string;
  job_type: string;
  priority: string;
  workflow_state: string;
  overall_status: string;
}

export interface SystemType {
  name: string;
  system_type_name: string;
  active: number;
  is_active: number;
  company: string | null;
}

export interface DeviceType {
  name: string;
  device_type_name: string;
  system_type: string;
  inspection_frequency: string;
  is_active: number;
  company: string | null;
}

export interface APIDevice {
  name: string;
  customer: string;
  site: string;
  system_type: string;
  system_type_name?: string | null; 
  device_tag: string | null;
  serial_no: string | null;
  manufacturer: string | null;
  model: string | null;
  location_zone: string | null;
  qr_code: string | null;
  location: string;
  device_type: string;
  device_type_name?: string | null; 
  purchase_date: string;
  warranty_end_date: string;
  expiry_date: string;
  risk_category: string;
  status: string;
  device_image: string | null;
  company: string;
  serial_number: string;
  installation_date: string;
  device_location: string | null;
  latitude: number;
  longitude: number;
}

export interface DeviceChecklist {
  device_id: string;
  device_tag: string | null;
  system_type: string;
  device_type: string;
  checklist_items: ChecklistItemAPI[];
}

export interface ChecklistItemAPI {
  checklist_master_id: string;
  checklist_name: string;
  item_id: string;
  inspection_question: string;
  field_type: string;
  severity: string;
  allowed_result: string | null;
  requires_photo: boolean;
  requires_description: boolean;
  is_active: number | boolean;
  is_mandatory: boolean;
  sequence: number;
  order: number;
  result: string | null;
  photo: string | null;
  description_text: string | null;
  min_value?: number;
  max_value?: number;
  reading_unit?: string;
  weight_value?: number;
  color_pass?: string;
  color_minor?: string;
  color_critical?: string;
  color_optional?: string;
  upload_image?: string | null;
  description?: string | null;
}
