import { ResourceItem, Camp, AlertItem, UserProfile, EquipmentItem, MaintenanceTask, ConsumptionDataPoint } from '../types';
import hqAdminPhoto from '../../assets/phot.jpeg';

export const initialCamps: Camp[] = [];

export const initialResources: ResourceItem[] = [];

export const initialAlerts: AlertItem[] = [];

export const demoProfiles: UserProfile[] = [
  {
    id: 'usr-admin',
    name: 'Col. Abhishek Pandey',
    email: 'commander@logistics.node',
    role: 'Admin',
    rank: 'Headquarters Command / Logistics Admin',
    campId: 'hq-admin',
    avatarUrl: hqAdminPhoto,
    serviceId: 'SVC-CMD-7709',
    accessScope: 'Headquarters',
  },
];

export const initialEquipment: EquipmentItem[] = [];

export const initialMaintenanceTasks: MaintenanceTask[] = [];

export const consumptionHistory7Days: ConsumptionDataPoint[] = [];
