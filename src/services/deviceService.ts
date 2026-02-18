import { api } from "./api";
import { Device } from "@/types";

export interface DeviceApiResponse {
  data: {
    name: string;
    item_code: string;
    serial_no: string;
    device_type: string;
    system_type: string;
    brand: string;
    location: string;
    building: string;
    floor: string;
    zone: string;
    area: string;
    installation_date: string;
    purchase_date: string;
    expiry_date: string;
    warranty_expiry_date: string;
    image: string;
    latitude: number;
    longitude: number;
    status: string;
    site: string;
    customer: string;
  };
}

export const fetchDevice = async (deviceId: string): Promise<{ device: Device, customerId: string } | null> => {
  try {
    // Determine if we are fetching by ID (name) or Serial Number
    // The API resource is likely /api/resource/Device/:id
    // But we might need to search if it's a serial number?
    // User URL suggests ID: FTS-Akpa Chemicals-0uvrgjou48-0051 which looks like the 'name' field in Frappe
    
    const response = await api.get<{ data: any }>(`/api/resource/Device/${encodeURIComponent(deviceId)}`);
    const data = response.data.data;

    if (!data) return null;

    // Map API response to Device interface
    const device: Device = {
      id: data.name,
      name: data.item_code || data.name,
      serialNumber: data.serial_no || "N/A",
      type: data.device_type || "Unknown",
      systemType: data.system_type || "Unknown",
      manufacturer: data.brand || "Unknown",
      locationDescription: data.location || "",
      building: data.building || "",
      zone: data.zone || "",
      jobId: "external-scan", // Placeholder
      status: data.status === "Active" ? "pending" : "pending", // Map status if needed
      isVerified: true, 
      installationDate: data.installation_date,
      manufacturingDate: "", 
      purchaseDate: data.purchase_date,
      warrantyStart: "", 
      warrantyEnd: data.warranty_expiry_date,
      expiryDate: data.expiry_date,
      imageUrl: data.image,
      gpsLat: data.latitude || 0,
      gpsLng: data.longitude || 0,
      siteId: data.site,
    };

    return { device, customerId: data.customer };
  } catch (error) {
    console.error("Error fetching device:", error);
    return null;
  }
};
