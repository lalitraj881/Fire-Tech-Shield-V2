import { Job } from "@/types";
type JobStatus = "not-started" | "in-progress" | "completed";

// Helper function to safely parse dates from API
const parseDate = (dateValue: any): string => {
  if (!dateValue) return "";
  
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return "";
};

export const mapERPJobToUIJob = (apiJob: any): Job => {
  return {
    id: apiJob.name,
    name: apiJob.name,

    type: apiJob.job_type?.toLowerCase() as Job["type"],

    customerId: apiJob.customer,
    customerName: apiJob.customer,

    siteId: apiJob.site,
    siteName: apiJob.site_code,
    siteAddress: apiJob.site_address || "",
    siteGpsLat: apiJob.site_gps_lat || 0,
    siteGpsLng: apiJob.site_gps_lng || 0,

    lastInspectionDate: parseDate(apiJob.last_inspection_date),
    nextDueDate: parseDate(apiJob.next_due_date),

    priority: apiJob.priority?.toLowerCase() as Job["priority"],

    estimatedDeviceCount: apiJob.total_checklist_items || 0,

    openNCCount: apiJob.total_open_nc || 0,

    ncReference: apiJob.certificate_no || undefined,

    status: mapWorkflowToStatus(apiJob.workflow_state),
  };
};

const mapWorkflowToStatus = (state: string): Job["status"] => {
  if (!state) return "not-started";
  
  switch (state) {
    case "Assigned":
      return "not-started";
    case "In Progress":
      return "in-progress";
    case "Completed":
    case "Closed":
      return "completed";
    default:
      return "not-started";
  }
};
