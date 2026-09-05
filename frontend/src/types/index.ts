export type ResourceCategory =
  | 'Water'
  | 'Fuel'
  | 'Food'
  | 'Medicine'
  | 'Supplies'
  | 'Ammunition'
  | 'Power';

export type ResourceStatus =
  | 'Healthy'
  | 'Warning'
  | 'Critical';

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  currentStock: number;
  unit: string;
  minLevel: number;
  maxCapacity: number;
  burnRatePerPersonPerDay: number;
  estDays: number;
  status: ResourceStatus;
  campId: string;
  icon: string;
  lastRestocked: string;
  location: string;
  sku: string;
}

export interface Camp {
  id: string;
  name: string;
  type: 'Live' | 'Reserve' | 'Forward Base';
  code: string;
  personnel: number;
  readinessScore: number;
  location: string;
  commander: string;
  status: 'Optimal' | 'Warning' | 'Standby';
  weather: string;
  temperature: string;

  profileImage: string | null;

  // Camp-specific settings
  warningThreshold: number;
  criticalThreshold: number;
  autoAlerts: boolean;
  audioPings: boolean;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  category:
    | 'Fuel'
    | 'Water'
    | 'Medicine'
    | 'Equipment'
    | 'Security'
    | 'Food'
    | 'Supplies'
    | 'Ammunition'
    | 'Power';
  severity: 'High' | 'Medium' | 'Low';
  campId: string;
  campName: string;
  timestamp: string;
  acknowledged: boolean;
  actionRequired: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role:
    | 'Admin'
    | 'Logistics'
    | 'Maintenance'
    | 'Maintenance Supervisor'
    | 'Commander';
  rank: string;
  campId: string;
  avatarUrl: string;
  serviceId: string;
  accessScope?: 'Headquarters' | 'Camp';
}

export interface EquipmentItem {
  id: string;
  name: string;
  category:
    | 'Generator'
    | 'Vehicle'
    | 'Water Purification'
    | 'Comms'
    | 'Medical'
    | 'Power Systems'
    | 'Storage'
    | 'Tools & Maintenance';
  serialNumber: string;
  model?: string;
  status:
    | 'Operational'
    | 'Service Due'
    | 'In Repair'
    | 'Decommissioned';
  healthScore: number;
  fuelConsumptionPerHour?: number;
  operatingHours: number;
  nextServiceDate: string;
  location?: string;
  lastMaintenanceDate?: string;
  campId: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  equipmentId: string;
  equipmentName: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
  dueDate: string;
  description: string;
  campId: string;
}

export type SupplyRequestStatus =
  | 'Submitted'
  | 'Approved'
  | 'In Transit'
  | 'Received'
  | 'Rejected';

export interface SupplyRequest {
  id: string;
  campId: string;
  campName: string;
  category: ResourceCategory;
  resourceName: string;
  quantity: number;
  unit: string;
  urgency: 'Routine' | 'Urgent' | 'Critical';
  reason: string;
  status: SupplyRequestStatus;
  requestedBy: string;
  createdAt: string;
  reviewedBy?: string;
  rejectionReason?: string;
  carrier?: string;
  eta?: string;
  receivedAt?: string;
  sourceCampId?: string;
  sourceResourceId?: string;
  auditLog: SupplyRequestAuditEntry[];
}

export interface SupplyRequestAuditEntry {
  action: string;
  actor: string;
  timestamp: string;
  note?: string;
}

export interface ConsumptionDataPoint {
  date: string;
  day: string;

  // Exact resource that was consumed
  resourceName?: string;
  category?: ResourceCategory;
  quantity?: number;

  // Legacy fields kept for compatibility
  water: number;
  fuel: number;
  food: number;
  medical: number;

  headcount?: number;
  purpose?: string;
  unit?: string;
}