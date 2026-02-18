import { api } from "./api";

export interface DashboardData {
  site_name: string;
  site_id: string;
  last_inspection_job_name: string;
  last_inspection_date: string;
  next_due_date: string;
  open_nc: number;
  total_devices: number;
}

/**
 * Get dashboard data for a specific site
 */
export const getDashboardData = async (siteId: string): Promise<DashboardData | null> => {
  try {
    const res = await api.get(`/api/method/numanufacturing_ft.api.inspection_job_dashboard.get_inspection_job_dashboard`, {
      params: {
        site: siteId,
      },
    });
    return res.data.message.dashboard;
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return null;
  }
};
