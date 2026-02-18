import { Job, Customer, Site } from "../types";
import { api } from "./api";

// Re-export types for use in other modules
export type { Customer, Site };

/**
 * Get all customers filtered by company
 */
export const getCustomersByCompany = async (company: string): Promise<Customer[]> => {
  try {
    const res = await api.get(`/api/resource/Customer`, {
      params: {
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify([["custom_primary_company", "=", company]]),
      },
    });
    return res.data.data;
  } catch (err) {
    console.error("Error fetching customers:", err);
    return [];
  }
};

/**
 * Get sites for a customer
 */
export const getSitesByCustomer = async (customerName: string): Promise<Site[]> => {
  try {
    const res = await api.get(`/api/resource/Site`, {
      params: {
        fields: JSON.stringify(["*"]),
        filters: JSON.stringify([["customer", "=", customerName]]),
      },
    });
    
    // Map API response to Site interface
    const sites: Site[] = res.data.data.map((siteData: any) => ({
      id: siteData.name,
      customerId: siteData.customer,
      name: siteData.site_name || siteData.name,
      address: siteData.address_line_1 || siteData.address || "",
      gpsLat: parseFloat(siteData.latitude) || 0,
      gpsLng: parseFloat(siteData.longitude) || 0,
      totalDevices: 0, // Not available from API
      site_code: siteData.site_code
    }));
    
    console.log('✅ Fetched and mapped sites:', sites);
    return sites;
  } catch (err) {
    console.error("Error fetching sites:", err);
    return [];
  }
};

/**
 * Get Jobs for a customer - now using full payload API for complete data
 */
export const getJobsByCustomerSite = async (customerId: string, siteId: string): Promise<Job[]> => {
  try {
    console.time('⏱️ Total job loading time');
    
    // First, fetch the site details to get complete information
    let siteDetails: Site | null = null;
    try {
      const siteRes = await api.get(`/api/resource/Site/${siteId}`);
      if (siteRes.data?.data) {
        const siteData = siteRes.data.data;
        console.log('🏢 Site API Response:', siteData);
        siteDetails = {
          id: siteData.name,
          customerId: siteData.customer,
        //   name: siteData.site_name || siteData.name,
          name: siteData.siteName || siteData.siteId || "null",
          address: siteData.address_line_1 || siteData.address || "",
          gpsLat: parseFloat(siteData.latitude) || 0,
          gpsLng: parseFloat(siteData.longitude) || 0,
          totalDevices: 0, // Not available from API
          site_code: siteData.site_code
        };
        console.log('✅ Resolved Site Details:', siteDetails);
      }
    } catch (siteErr) {
      console.error('❌ Failed to fetch site details:', siteErr);
    }
    
    // Then, get the list of job names
    const res = await api.get(`/api/resource/Inspection Job`, {
      params: {
        fields: JSON.stringify(["name"]),
        filters: JSON.stringify([["customer", "=", customerId],["site","=",siteId]]),
      },
    });
    
    const jobNames = res.data.data.map((job: any) => job.name);
    console.log(`📋 Found ${jobNames.length} jobs for customer ${customerId}, site ${siteId}`);
    
    if (jobNames.length === 0) {
      console.timeEnd('⏱️ Total job loading time');
      return [];
    }
    
    // ⚡ OPTIMIZATION: Fetch all job payloads in PARALLEL instead of sequentially
    console.log('🚀 Fetching all job payloads in parallel...');
    const jobPromises = jobNames.map(async (jobName: string) => {
      try {
        const payloadRes = await api.get(`/api/method/numanufacturing_ft.api.update_inspection.get_inspection_job_full_payload`, {
          params: { job_name: jobName },
        });
        
        if (payloadRes.data?.message) {
          const { inspection_job, devices } = payloadRes.data.message;
          
          console.log('📦 Job Payload for', jobName, ':', {
            site: inspection_job.site,
            site_name: inspection_job.site_name,
            site_code: inspection_job.site_code,
            site_address: inspection_job.site_address,
            site_gps_lat: inspection_job.site_gps_lat,
            site_gps_lng: inspection_job.site_gps_lng
          });
          
          // Map the full payload to UI Job format, using resolved site details if available
          const job: Job = {
            id: inspection_job.name,
            name: inspection_job.name,
            type: inspection_job.job_type?.toLowerCase() as Job["type"],
            customerId: inspection_job.customer,
            customerName: inspection_job.customer_name || inspection_job.customer,
            siteId: inspection_job.site,
            // Use resolved site details if available, otherwise fallback to payload values
            siteName: siteDetails?.name || inspection_job.site_name || inspection_job.site_code || inspection_job.site,
            siteAddress: siteDetails?.address || inspection_job.site_address || "",
            siteGpsLat: siteDetails?.gpsLat || inspection_job.site_gps_lat || 0,
            siteGpsLng: siteDetails?.gpsLng || inspection_job.site_gps_lng || 0,
            lastInspectionDate: inspection_job.last_inspection_date || "",
            nextDueDate: inspection_job.next_due_date || "",
            priority: (() => {
              const p = inspection_job.priority?.toLowerCase();
              if (p === 'high') return 'critical';
              if (p === 'medium') return 'semicritical';
              if (p === 'low') return 'low';
              return 'normal';
            })() as Job["priority"],
            estimatedDeviceCount: devices?.length || 0,
            openNCCount: 0,
            status: inspection_job.workflow_state === "Completed" ? "completed" : 
                    inspection_job.workflow_state === "In Progress" ? "in-progress" : "not-started",
            ncReference: undefined,
          };
          
          console.log('✅ Mapped Job:', job);
          return job;
        }
        return null;
      } catch (jobErr) {
        console.error(`❌ Error fetching full payload for job ${jobName}:`, jobErr);
        return null;
      }
    });
    
    // Wait for all promises to complete in parallel
    const jobResults = await Promise.all(jobPromises);
    
    // Filter out null values (failed jobs)
    const jobs = jobResults.filter((job): job is Job => job !== null);
    
    console.log(`✅ Successfully loaded ${jobs.length}/${jobNames.length} jobs with full payload`);
    console.timeEnd('⏱️ Total job loading time');
    return jobs;

  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    console.timeEnd('⏱️ Total job loading time');
    return [];
  }
};
