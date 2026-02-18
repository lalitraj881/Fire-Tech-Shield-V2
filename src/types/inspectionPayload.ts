export interface InspectionJobPayload {
  message: {
    inspection_job: any;
    devices: any[];
    checklists: any[];
    systems: any[];
    device_types: any[];
  };
}
