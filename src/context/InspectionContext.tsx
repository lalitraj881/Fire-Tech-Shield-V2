import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { 
  type Device, 
  type Job, 
  type DeviceStatus,
  type JobStatus,
  type NC,
  type Technician,
} from "@/types";
import { validateCredentials, fetchUser } from "@/services/authService";
import { api } from "@/services/api";
import { Customer, Site, getCustomersByCompany, getSitesByCustomer,getJobsByCustomerSite } from "@/services/customerService";
import { fetchInspectionJob, submitInspection } from "../services/jobService";
import { ChecklistItem } from "@/types";

interface InspectionContextType {
  devices: Device[];
  jobs: Job[];
  customers: Customer[];
  sites: Site[];
  ncs: NC[];
  technician: Technician | null;
  selectedCustomerId: string | null;
  selectedSiteId: string | null;
  loginUser: (email: string, password: string) => Promise<void>;
  logoutUser: () => void;
  loading: boolean;
  error: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  setSelectedSiteId: (id: string | null) => void;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  completeJob: (jobId: string) => Promise<void>;
  startJob: (jobId: string) => void;
  getDevicesByJobId: (jobId: string) => Device[];
  getJobById: (jobId: string) => Job | undefined;
  getJobStats: (jobId: string) => { total: number; completed: number; passed: number; failed: number };
  getAssignedCustomers: () => Customer[];
  getAssignedSites: (customerId?: string) => Promise<Site[]>;
  getJobsByStatus: (status: JobStatus) => Job[];
  getJobsByCustomerAndSite: (customerId?: string, siteId?: string) => Job[];
  getDeviceById: (deviceId: string) => Device | undefined;
  getNcsByDeviceId: (deviceId: string) => NC[];

  resetData: () => void;
  assignedCustomers: any;
  assignedSites: any;
  getAssignedJobs : (CustomerId:string, siteId: string) => Promise<Job[]>;
  loadJobDetails: (jobId: string) => Promise<void>;
  checklists: Record<string, ChecklistItem[]>;
  submitInspectionResults: (payload: any) => Promise<void>;
  markDeviceAsVerified: (deviceId: string) => void;
}

const InspectionContext = createContext<InspectionContextType | undefined>(undefined);

const cloneData = <T,>(data: T): T => JSON.parse(JSON.stringify(data));

export function InspectionProvider({ children }: { children: ReactNode }) {
  // Helper to load from localStorage
  const loadFromStorage = <T,>(key: string, items: T) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : items;
    } catch (e) {
      console.error(`Error loading ${key} from storage`, e);
      return items;
    }
  };

  // Devices - loaded from API via loadJobDetails(), stored per job
  // Persist devices to localStorage so they survive page reloads
  const [devicesByJob, setDevicesByJob] = useState<Record<string, Device[]>>(() => loadFromStorage("fts_devicesByJob", {}));
  
  // Checklists - loaded from API via loadJobDetails(), stored per device ID
  // Persist checklists to localStorage so they survive page reloads
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>(() => loadFromStorage("fts_checklists", {}));
  
  // Persist jobs
  const [jobs, setJobs] = useState<Job[]>(() => loadFromStorage("fts_jobs", []));
  
  // Customers and Sites - loaded from API
  const [customers] = useState<Customer[]>([]);
  const [sites] = useState<Site[]>([]);  
  
  // NCs - Not available in current API
  const [ncs, setNcs] = useState<NC[]>([]);
  
  // Persist selections
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(() => loadFromStorage("fts_selectedCustomerId", null));
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(() => loadFromStorage("fts_selectedSiteId", null));
  
  // Persist technician and assigned data
  const [technician, setTechnician] = useState<Technician | undefined>(() => loadFromStorage("fts_technician", undefined));
  const [assignedCustomers, setAssignedCustomers] = useState<Customer[]>(() => loadFromStorage("fts_assignedCustomers", []));
  const [assignedSites, setAssignedSites] = useState<Record<string, Site[]>>(() => loadFromStorage("fts_assignedSites", {})); // Typed as Record since it was being used as map
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem("fts_jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem("fts_selectedCustomerId", JSON.stringify(selectedCustomerId));
  }, [selectedCustomerId]);

  useEffect(() => {
    localStorage.setItem("fts_selectedSiteId", JSON.stringify(selectedSiteId));
  }, [selectedSiteId]);

  // Persist devicesByJob
  useEffect(() => {
    localStorage.setItem("fts_devicesByJob", JSON.stringify(devicesByJob));
  }, [devicesByJob]);

  // Persist checklists
  useEffect(() => {
    localStorage.setItem("fts_checklists", JSON.stringify(checklists));
  }, [checklists]);

  useEffect(() => {
    if (technician) {
      localStorage.setItem("fts_technician", JSON.stringify(technician));
    } else {
      localStorage.removeItem("fts_technician");
    }
  }, [technician]);


  // Load Job Details (Full Payload)
  const loadJobDetails = async (jobName: string) => {
    setLoading(true);
    try {
      const payload = await fetchInspectionJob(jobName);
      if (payload && payload.message) {
        const { devices: apiDevices, checklists: apiChecklists, systems, device_types, inspection_job } = payload.message;

        // Create Lookup Maps
        const systemMap = new Map(systems.map(s => [s.name, s.system_type_name]));
        const deviceTypeMap = new Map(device_types.map(dt => [dt.name, dt.device_type_name]));

        // Update Job Data
        if (inspection_job) {
             setJobs(prevJobs => {
                const existingJobIndex = prevJobs.findIndex(j => j.id === inspection_job.name);
                const existingJob = existingJobIndex >= 0 ? prevJobs[existingJobIndex] : null;
                
                // Try to resolve Site Name
                // We search through all assigned sites arrays to find a match
                let resolvedSiteName = inspection_job.site;
                const allSites = Object.values(assignedSites).flat();
                const matchedSite = allSites.find((s: any) => s.id === inspection_job.site || s.name === inspection_job.site);
                if (matchedSite) {
                    resolvedSiteName = matchedSite.name;
                }

                const updatedJob: Job = {
                    id: inspection_job.name,
                    name: inspection_job.name,
                    type: inspection_job.job_type === "Maintenance" ? "maintenance" : "repair",
                    customerId: inspection_job.customer,
                    customerName: inspection_job.customer,
                    siteId: inspection_job.site,
                    siteName: existingJob?.siteName || resolvedSiteName, 
                    siteAddress: matchedSite?.address || existingJob?.siteAddress || "", 
                    siteGpsLat: matchedSite?.gpsLat || existingJob?.siteGpsLat || 0,
                    siteGpsLng: matchedSite?.gpsLng || existingJob?.siteGpsLng || 0,
                    // Preserve existing dates if they exist, since full payload doesn't include them
                    lastInspectionDate: existingJob?.lastInspectionDate || "",
                    nextDueDate: existingJob?.nextDueDate || "",
                    priority: (() => {
                      const p = inspection_job.priority?.toLowerCase();
                      if (p === 'high') return 'critical';
                      if (p === 'medium') return 'semicritical';
                      if (p === 'low') return 'low';
                      return 'normal';
                    })(),
                    // Use device count from full payload if available (more accurate), otherwise preserve existing
                    estimatedDeviceCount: apiDevices.length > 0 ? apiDevices.length : (existingJob?.estimatedDeviceCount || 0),
                    openNCCount: existingJob?.openNCCount || 0,
                    status: inspection_job.workflow_state === "Completed" ? "completed" : "in-progress",
                    ncReference: existingJob?.ncReference,
                };

                if (existingJobIndex >= 0) {
                    const newJobs = [...prevJobs];
                    newJobs[existingJobIndex] = updatedJob;
                    return newJobs;
                } else {
                    return [...prevJobs, updatedJob];
                }
             });
        }

        // Store devices by job ID using functional update to access current state
        setDevicesByJob(prev => {
          // Get existing devices to preserve verification state from CURRENT state
          const existingDevices = prev[jobName] || [];
          const existingDeviceMap = new Map(existingDevices.map(d => [d.id, d]));

          // Map API Devices to UI Devices
          const mappedDevices: Device[] = apiDevices.map((d) => {
            const existingDevice = existingDeviceMap.get(d.name);
            
            // Lookup device type name and system type name from the maps
            const deviceTypeName = deviceTypeMap.get(d.device_type) || "N/A";
            const systemTypeName = systemMap.get(d.system_type) || "N/A";
            
            return {
              id: d.name, 
              name: d.name, 
              serialNumber: d.serial_number || d.serial_no || "",
              type: deviceTypeName, 
              systemType: systemTypeName,
              building: "", 
              zone: "", 
              locationDescription: d.location || "",
              gpsLat: Number(d.latitude) || 0,
              gpsLng: Number(d.longitude) || 0,
              imageUrl: d.device_image || undefined,
              manufacturer: d.manufacturer || "",
              installationDate: d.installation_date || "",
              manufacturingDate: "", 
              purchaseDate: d.purchase_date || "",
              warrantyStart: "", 
              warrantyEnd: d.warranty_end_date || "",
              expiryDate: d.expiry_date || "",
              status: existingDevice?.status || "pending", 
              jobId: jobName,
              siteId: d.site, // Store site ID from API (e.g., "6s1ctbu4sm")
              isVerified: existingDevice?.isVerified || false, 
            };
          });

          return { ...prev, [jobName]: mappedDevices };
        });

        // Map Checklists by Device ID
        const mappedChecklists: Record<string, ChecklistItem[]> = {};
        
        apiChecklists.forEach((list) => {
             mappedChecklists[list.device_id] = list.checklist_items
               // Removed filter to show all items as per user request

               .map(item => ({
                 id: item.item_id,
                 name: item.inspection_question,
                 type: item.field_type === "Reading" ? "numeric" : "toggle",
                 required: item.is_mandatory || item['is_man datory'],
                 critical: item.severity === "Critical",
                 unit: item.reading_unit || "", 
                 minValue: item.min_value,
                 maxValue: item.max_value,
                 severity: item.severity,
                 requiresPhoto: item.requires_photo,
                 requiresDescription: item.requires_description,
                 isActive: !!item.is_active, // Cast to boolean
                 colorPass: item.color_pass,
                 colorMinor: item.color_minor,
                 colorCritical: item.color_critical,
                 colorOptional: item.color_optional,
              }));
        });

        setChecklists(mappedChecklists);
      }
    } catch (err) {
      console.error("Failed to load job details", err);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("fts_assignedCustomers", JSON.stringify(assignedCustomers));
  }, [assignedCustomers]);

  useEffect(() => {
    localStorage.setItem("fts_assignedSites", JSON.stringify(assignedSites));
  }, [assignedSites]);


  const resetData = useCallback(() => {
    setDevicesByJob({}); // Clear all devices
    setJobs([]); // Clear jobs on reset? Or keep them? Logic may vary. Keeping empty for now as per original.
    setNcs([]); // Clear NCs - not available in API
    setSelectedCustomerId(null);
    setSelectedSiteId(null);
    
    // Clear storage
    localStorage.removeItem("fts_jobs");
    localStorage.removeItem("fts_selectedCustomerId");
    localStorage.removeItem("fts_selectedSiteId");
  }, []);

  const updateDeviceStatus = (deviceId: string, status: DeviceStatus) => {
    setDevicesByJob((prev) => {
      const updated = { ...prev };
      // Find which job contains this device and update it
      Object.keys(updated).forEach(jobId => {
        updated[jobId] = updated[jobId].map(d => 
          d.id === deviceId ? { ...d, status } : d
        );
      });
      return updated;
    });
  };

  const markDeviceAsVerified = (deviceId: string) => {
    console.log('🔍 markDeviceAsVerified called for:', deviceId);
    setDevicesByJob((prev) => {
      const updated = { ...prev };
      // Find which job contains this device and mark it as verified
      Object.keys(updated).forEach(jobId => {
        const deviceIndex = updated[jobId].findIndex(d => d.id === deviceId);
        if (deviceIndex >= 0) {
          console.log('✅ Found device in job:', jobId, 'marking as verified');
          updated[jobId] = updated[jobId].map(d => 
            d.id === deviceId ? { ...d, isVerified: true } : d
          );
          console.log('✅ Device after update:', updated[jobId][deviceIndex]);
        }
      });
      return updated;
    });
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status } : j))
    );
  };

  const startJob = (jobId: string) => {
    updateJobStatus(jobId, 'in-progress');
  };

  const completeJob = async (jobId: string) => {
    try {
      setLoading(true);
      console.log('🏁 Completing job:', jobId);
      
      // Update workflow_state to "Completed" in the backend
      const { updateInspectionJob } = await import('@/services/jobService');
      await updateInspectionJob(jobId, {
        workflow_state: "Completed"
      });
      
      console.log('✅ Job marked as completed in backend');
      
      // Update local state
      updateJobStatus(jobId, 'completed');
    } catch (error) {
      console.error('❌ Failed to complete job:', error);
      setError('Failed to complete job. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getDevicesByJobId = (jobId: string) => {
    return devicesByJob[jobId] || [];
  };

  const getJobById = (jobId: string) => {
    return jobs.find((j) => j.id === jobId);
  };

  const getDeviceById = (deviceId: string) => {
    // Search through all jobs to find the device
    for (const devices of Object.values(devicesByJob)) {
      const device = devices.find(d => d.id === deviceId);
      if (device) return device;
    }
    return undefined;
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
    return customers.filter((c) => technician?.assignedCustomerIds.includes(c.id));
  };
  
  const sitesForSelectedCustomer: Site[] = useMemo(() => {
    if (!selectedCustomerId) return [];
    return (assignedSites as any)[selectedCustomerId] ?? []; 
  }, [assignedSites, selectedCustomerId]);

  
  const getAssignedSites = async (customerName: string) => {
    const sites = await getSitesByCustomer(customerName);
    setAssignedSites(prev => ({ ...prev, [customerName]: sites }));
    return sites;
  };

  const getAssignedJobs = async (customerId: string, siteId: string): Promise<Job[]> => {
    try {
      const jobList = await getJobsByCustomerSite(customerId, siteId);
      setJobs(jobList); // This will trigger the effect to save to localStorage
      return jobList;
    } catch (error) {
      console.error("Error in getAssignedJobs:", error);
      setJobs([]);
      return [];
    }
  };

  const getJobsByStatus = (status: JobStatus) => {
    return jobs.filter((j) => j.status === status);
  };

  const getJobsByCustomerAndSite = (customerId?: string, siteId?: string) => {
    let filteredJobs = jobs; 
    
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



  const submitInspectionResults = async (payload: any) => {
    setLoading(true);
    try {
      const { jobId, deviceId, results, overallResult } = payload;
      
      // Process results and upload photos
      const processedResults = await Promise.all(results.map(async (res: any) => {
        let photoUrl = "";
        if (res.photoFile) {
           const { uploadFile } = await import("@/services/jobService");
           
           const file = new File(
             [res.photoFile], 
             `inspection_photo_${Date.now()}.jpg`,
             { type: res.photoFile.type || 'image/jpeg' }
           );
           
           const uploadedUrl = await uploadFile(file);
           if (uploadedUrl) {
             photoUrl = uploadedUrl;
           } else {
             console.error("Photo upload failed for item:", res.itemId);
           }
        }
        
        const itemResult = res.result === "pass" ? "Pass" : res.result === "minor" ? "Minor" : res.result === "optional" ? "Optional" : "Critical";
        
        return {
          inspection_data: res.question,
          device_id: deviceId,
          checklist_id: res.itemId,
          reading_value: Number(res.value) || 0,
          result: itemResult,
          photo: photoUrl,
          description: res.notes || ""
        };
      }));

      const { api } = await import("@/services/api");
      
      const payloadData = {
        inspection_checklist_result: processedResults
      };
      
      // User requested explicit usage of this PUT API
      // We encode the URL components to ensure spaces and special chars are handled
      // and add headers to prevent 417 errors
      const resource = "Inspection Job";
      const encodedResource = encodeURIComponent(resource).replace(/%20/g, " "); // Frappe often prefers spaces or %20, let's keep it clean or use standard encoding
      // Actuall axios handles encoding. But "Inspection Job" has a space.
      
      console.log('📤 Submitting to PUT API:', `/api/resource/Inspection Job/${jobId}`);
      console.log('📦 Payload:', JSON.stringify(payloadData, null, 2));

      // Match V1 exactly - let Axios handle encoding
      const response = await api.put(
        `/api/resource/Inspection Job/${jobId}`, 
        payloadData
      );
      
      // Refresh job details locally
      await loadJobDetails(jobId);

      // Create NC if inspection failed
      if (overallResult === 'fail') {
        const job = getJobById(jobId);
        const device = getDeviceById(deviceId);
        
        if (job && device && technician) {
          const deviceNameParts = device.id.split('-');
          const uniqueDeviceId = deviceNameParts.length >= 3 
            ? deviceNameParts[deviceNameParts.length - 2]
            : device.id;
          
          if (!device.siteId) {
            console.error('Device is missing siteId, cannot create NC');
            return;
          }
          
          const timestamp = Date.now().toString().slice(-4);
          const deviceNcReference = `FTS-${job.customerName}-${uniqueDeviceId}-${timestamp}`;
          
          const checklistResults = results
            .filter((r: any) => r.result !== 'pass')
            .map((r: any) => {
              const processedItem = processedResults.find((pr: any) => pr.checklist_id === r.itemId);
              
              let readingValue = "";
              if (r.value !== undefined && r.value !== null && r.value !== "" && typeof r.value === 'number') {
                readingValue = r.value.toString();
              } else if (r.result) {
                readingValue = r.result.charAt(0).toUpperCase() + r.result.slice(1);
              }
              
              return {
                device: deviceId,
                inspection_data: r.question,
                reading_value: readingValue,
                description: r.notes || "",
                photo: processedItem?.photo || ""
              };
            });
          
          const { createNC } = await import("@/services/jobService");
          
          const ncPayload = {
            workflow_state: 'Open' as const,
            company: 'FTS Fire Tech Shield',
            customer: job.customerName,
            site: device.siteId,
            inspection_job: jobId,
            technician_name: technician.name,
            technician: technician.email,
            status: 'Open' as const,
            failed_device_list: [
              {
                name: uniqueDeviceId,
                device_nc: deviceNcReference,
                systemtype_nc: device.systemType,
                devicetype_nc: device.type,
              }
            ],
            checklist_result: checklistResults
          };
          
          try {
            await createNC(ncPayload);
          } catch (ncError) {
            console.error('Failed to create NC, but inspection was submitted:', ncError);
          }
        }
      }

    } catch (err: any) {
      console.error("Failed to submit inspection results", err);
      setError("Failed to submit inspection results");
      throw err;
    } finally {
      setLoading(false);
    }
  };

const loginUser = async (email: string, password: string) => {
  try {
    setLoading(true);
    setError(null);

    // Validate credentials (but don't create session - we use token auth)
    console.log('🔐 Validating credentials...');
    try {
      await validateCredentials(email, password);
      console.log('✅ Credentials validated');
    } catch (err: any) {
      console.error('❌ Credential validation failed:', err);
      throw new Error("Invalid email or password. Please check your credentials.");
    }

    // Fetch user details using API token
    console.log('👤 Fetching user details...');
    const user = await fetchUser(email);
    
    console.log('🔍 User data received:', user);
    console.log('🔍 User roles:', user.roles);

    // Role check
    let hasRole = false;
    
    if (user.roles && Array.isArray(user.roles)) {
      hasRole = user.roles.some((r: any) => {
        console.log('🔍 Checking role:', r);
        return r.role === "FTS Technician";
      });
      
      console.log('🔍 Has FTS Technician role:', hasRole);
    } else {
      console.warn('⚠️ User roles field is missing or not an array');
    }

    if (!hasRole) {
      throw new Error(
        "Access denied. Only FTS Technician can login. " +
        "Please contact your administrator to assign the FTS Technician role."
      );
    }
    
    // Fetch customers for this company
    console.log('🏢 Fetching customers for company:', user.company);
    const customers = await getCustomersByCompany(user.company); 
    setAssignedCustomers(customers);
    console.log('✅ Fetched', customers.length, 'customers');
    
    // Map ERP user → Technician
    const technicianData: Technician = {
      id: user.name,
      name: user.full_name,
      email: user.email,
      phone: user.phone || "",
      assignedCustomerIds: customers.map(c => c.id)
    };

    setTechnician(technicianData);
    console.log('✅ Login successful for:', user.full_name);
  } catch (err: any) {
    console.error("❌ Login error:", err);
    
    let errorMessage = "Login failed. Please try again.";
    
    if (err.response) {
      switch (err.response.status) {
        case 401:
          errorMessage = "Invalid email or password.";
          break;
        case 403:
          errorMessage = "Access denied. You don't have permission to access this application.";
          break;
        case 404:
          errorMessage = "User not found. Please check your email address.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later or contact support.";
          break;
        default:
          errorMessage = `Login failed: ${err.response.statusText || 'Unknown error'}`;
      }
    } else if (err.message) {
      errorMessage = err.message;
    } else if (err.request) {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

const logoutUser = async () => {
    try {
        await api.get("/api/method/logout");
    } catch(e) {
        console.warn("Logout API failed", e);
    }
   setTechnician(undefined);
    setAssignedCustomers([]);
    setAssignedSites({});
    
    // Clear ALL localStorage data at once
    localStorage.clear();
};
  return (
    <InspectionContext.Provider
      value={{
        devices: Object.values(devicesByJob).flat(), // Flatten for backward compatibility
        jobs,
        customers,
        sites:sitesForSelectedCustomer,
        ncs,
        technician,
        loginUser,
        logoutUser,
        loading,
        error,
        selectedCustomerId,
        selectedSiteId,
        assignedCustomers,
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
        resetData,
        assignedSites,
        getAssignedJobs,
        loadJobDetails,
        checklists,
        submitInspectionResults,
        markDeviceAsVerified,
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
