import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { 
  mockDevices, 
  mockJobs, 
  mockCustomers,
  mockSites,
  mockNCs,
  mockTechnician,
  type Device, 
  type Job, 
  type DeviceStatus,
  type JobStatus,
  type Customer,
  type Site,
  type NC,
  type Technician,
  type InspectionSeverity,
} from "@/data/mockData";

interface InspectionContextType {
  devices: Device[];
  jobs: Job[];
  customers: Customer[];
  sites: Site[];
  ncs: NC[];
  technician: Technician;
  selectedCustomerId: string | null;
  selectedSiteId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedSiteId: (id: string | null) => void;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  completeJob: (jobId: string) => void;
  startJob: (jobId: string) => void;
  getDevicesByJobId: (jobId: string) => Device[];
  getJobById: (jobId: string) => Job | undefined;
  getJobStats: (jobId: string) => { total: number; completed: number; passed: number; failed: number };
  getAssignedCustomers: () => Customer[];
  getAssignedSites: (customerId?: string) => Site[];
  getJobsByStatus: (status: JobStatus) => Job[];
  getJobsByCustomerAndSite: (customerId?: string, siteId?: string) => Job[];
  getDeviceById: (deviceId: string) => Device | undefined;
  getNcsByDeviceId: (deviceId: string) => NC[];
  createNC: (ncData: Partial<NC>) => void;
  resetData: () => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

const cloneData = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(() => cloneData(mockDevices));
  const [jobs, setJobs] = useState<Job[]>(() => cloneData(mockJobs));
  const [customers] = useState<Customer[]>(() => cloneData(mockCustomers));
  const [sites] = useState<Site[]>(() => cloneData(mockSites));
  const [ncs, setNcs] = useState<NC[]>(() => cloneData(mockNCs));
  const [technician] = useState<Technician>(() => cloneData(mockTechnician));
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const resetData = useCallback(() => {
    setDevices(cloneData(mockDevices));
    setJobs(cloneData(mockJobs));
    setNcs(cloneData(mockNCs));
    setSelectedCustomerId(null);
    setSelectedSiteId(null);
  }, []);

  const updateDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status } : d))
    );
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status } : j))
    );
  };

  const startJob = (jobId: string) => {
    updateJobStatus(jobId, 'in-progress');
  };

  const completeJob = (jobId: string) => {
    updateJobStatus(jobId, 'completed');
  };

  const getDevicesByJobId = (jobId: string) => {
    return devices.filter((d) => d.jobId === jobId);
  };

  const getJobById = (jobId: string) => {
    return jobs.find((j) => j.id === jobId);
  };

  const getDeviceById = (deviceId: string) => {
    return devices.find((d) => d.id === deviceId);
  };

  const getJobStats = (jobId: string) => {
    const jobDevices = getDevicesByJobId(jobId);
    const total = jobDevices.length;
    const completed = jobDevices.filter((d) => d.status !== "pending").length;
    const passed = jobDevices.filter((d) => d.status === "completed").length;
    const failed = jobDevices.filter((d) => d.status === "failed").length;
    return { total, completed, passed, failed };
  };

  const getAssignedCustomers = () => {
    return customers.filter((c) => technician.assignedCustomerIds.includes(c.id));
  };

  const getAssignedSites = (customerId?: string) => {
    const assignedSites = sites.filter((s) => technician.assignedSiteIds.includes(s.id));
    if (customerId) {
      return assignedSites.filter((s) => s.customerId === customerId);
    }
    return assignedSites;
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((j) => j.status === status);
  };

  const getJobsByCustomerAndSite = (customerId?: string, siteId?: string) => {
    let filteredJobs = jobs.filter((j) => 
      technician.assignedCustomerIds.includes(j.customerId) &&
      technician.assignedSiteIds.includes(j.siteId)
    );
    
    if (customerId) {
      filteredJobs = filteredJobs.filter((j) => j.customerId === customerId);
    }
    if (siteId) {
      filteredJobs = filteredJobs.filter((j) => j.siteId === siteId);
    }
    return filteredJobs;
  };

  const getNcsByDeviceId = (deviceId: string) => {
    return ncs.filter((nc) => nc.deviceId === deviceId);
  };

  const createNC = (ncData: Partial<NC>) => {
    const newNC: NC = {
      id: `nc-${Date.now()}`,
      deviceId: ncData.deviceId || '',
      deviceName: ncData.deviceName || '',
      deviceType: ncData.deviceType || '',
      deviceSystemType: ncData.deviceSystemType || '',
      deviceImageUrl: ncData.deviceImageUrl,
      deviceLocationDescription: ncData.deviceLocationDescription || '',
      deviceGpsLat: ncData.deviceGpsLat,
      deviceGpsLng: ncData.deviceGpsLng,
      jobId: ncData.jobId || '',
      customerId: ncData.customerId || '',
      customerName: ncData.customerName || '',
      siteId: ncData.siteId || '',
      siteName: ncData.siteName || '',
      siteAddress: ncData.siteAddress || '',
      siteGpsLat: ncData.siteGpsLat || 0,
      siteGpsLng: ncData.siteGpsLng || 0,
      status: 'open',
      severity: ncData.severity || 'minor',
      description: ncData.description || '',
      failedChecklistItems: ncData.failedChecklistItems || [],
      technicianRemarks: ncData.technicianRemarks || '',
      photoEvidence: ncData.photoEvidence || [],
      inspectionJobId: ncData.inspectionJobId || '',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: technician.name,
    };
    setNcs((prev) => [...prev, newNC]);
  };

  return (
    <InspectionContext.Provider
      value={{
        devices,
        jobs,
        customers,
        sites,
        ncs,
        technician,
        selectedCustomerId,
        selectedSiteId,
        setSelectedCustomerId,
        setSelectedSiteId,
        updateDeviceStatus,
        updateJobStatus,
        completeJob,
        startJob,
        getDevicesByJobId,
        getJobById,
        getJobStats,
        getAssignedCustomers,
        getAssignedSites,
        getJobsByStatus,
        getJobsByCustomerAndSite,
        getDeviceById,
        getNcsByDeviceId,
        createNC,
        resetData,
      }}
    >
      {children}
    </InspectionContext.Provider>
  );
}

export function useInspection() {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error("useInspection must be used within InspectionProvider");
  }
  return context;
}
