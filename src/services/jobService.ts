import { api } from "./api";
import { AxiosResponse } from "axios";

export interface InspectionJobPayload {
  message: {
    inspection_job: any;
    devices: any[];
    checklists: any[];
    systems: any[];
    device_types: any[];
  };
}

export const fetchInspectionJob = async (jobName: string): Promise<InspectionJobPayload | null> => {
  try {
    const response = await api.get(`/api/method/numanufacturing_ft.api.update_inspection.get_inspection_job_full_payload`, {
      params: {
        job_name: jobName,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching inspection job full payload:", error);
    return null;
  }
};

export const submitInspection = async (payload: any): Promise<AxiosResponse<any> | null> => {
  try {
    console.log('📤 Calling submitInspection API with:', JSON.stringify(payload, null, 2));
    const response = await api.post(`/api/method/numanufacturing_ft.api.update_inspection.update_inspection_results`, payload);
    console.log('✅ API Response:', response.data);
    return response;
  } catch (error: any) {
    console.error("❌ Error submitting inspection:", error);
    console.error("❌ Error response data:", JSON.stringify(error.response?.data, null, 2));
    console.error("❌ Error status:", error.response?.status);
    throw error;
  }
};

export interface NCPayload {
  workflow_state: 'Open';
  company: string;
  customer: string;
  site: string;
  inspection_job: string;
  technician_name: string;
  technician: string;
  status: 'Open';
  failed_device_list: Array<{
    name: string;              // Device ID
    device_nc: string;         // NC reference for this device
    systemtype_nc: string;     // System type
    devicetype_nc: string;     // Device type
  }>;
  checklist_result: Array<{
    device: string;            // Full device name (e.g., "FTS-Akpa Chemicals-5qh6vp89vt-0050")
    inspection_data: string;   // Question/inspection item name
    reading_value: string;     // Can be numerical or text like "minor", "critical", "pass"
    description: string;       // Notes/description
    photo: string;             // Photo URL
  }>;
}

export const createNC = async (payload: NCPayload): Promise<AxiosResponse<any> | null> => {
    try {
        const response = await api.post(`/api/resource/Non Conformity`, payload);
        return response;
    } catch (error: any) {
        console.error("Error creating NC:", error);
        throw error;
    }
}

export const uploadFile = async (file: File | Blob): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("is_private", "1"); 
  formData.append("folder", "Home");

  try {
    const response = await api.post("/api/method/upload_file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.message.file_url;
  } catch (error) {
    console.error("Upload failed", error);
    return null;
  }
};

export const updateInspectionJob = async (jobName: string, payload: any): Promise<AxiosResponse<any> | null> => {
  try {
    const response = await api.put(`/api/resource/Inspection Job/${jobName}`, payload);
    return response;
  } catch (error) {
    console.error("Error updating inspection job:", error);
    throw error;
  }
};
