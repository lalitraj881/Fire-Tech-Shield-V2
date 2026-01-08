import { createContext, useContext, useState, ReactNode } from "react";
import { mockDevices, mockJobs, type Device, type Job, type DeviceStatus } from "@/data/mockData";

interface InspectionContextType {
  devices: Device[];
  jobs: Job[];
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  completeJob: (jobId: string) => void;
  getDevicesByJobId: (jobId: string) => Device[];
  getJobById: (jobId: string) => Job | undefined;
  getJobStats: (jobId: string) => { total: number; completed: number; passed: number; failed: number };
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

export function InspectionProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const updateDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === deviceId ? { ...d, status } : d))
    );
  };

  const completeJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "completed" as const } : j))
    );
  };

  const getDevicesByJobId = (jobId: string) => {
    return devices.filter((d) => d.jobId === jobId);
  };

  const getJobById = (jobId: string) => {
    return jobs.find((j) => j.id === jobId);
  };

  const getJobStats = (jobId: string) => {
    const jobDevices = getDevicesByJobId(jobId);
    const total = jobDevices.length;
    const completed = jobDevices.filter((d) => d.status !== "pending").length;
    const passed = jobDevices.filter((d) => d.status === "completed").length;
    const failed = jobDevices.filter((d) => d.status === "failed").length;
    return { total, completed, passed, failed };
  };

  return (
    <InspectionContext.Provider
      value={{
        devices,
        jobs,
        updateDeviceStatus,
        completeJob,
        getDevicesByJobId,
        getJobById,
        getJobStats,
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
