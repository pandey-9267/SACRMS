import {
  AlertItem,
  Camp,
  ConsumptionDataPoint,
  EquipmentItem,
  MaintenanceTask,
  ResourceCategory,
  ResourceItem,
  SupplyRequest,
  SupplyRequestStatus,
  UserProfile,
} from '../types';

export type ActiveView =
  | 'dashboard'
  | 'camps'
  | 'resources'
  | 'consumption'
  | 'equipment'
  | 'maintenance'
  | 'alerts'
  | 'reports'
  | 'users'
  | 'settings'
  | 'requests';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface PendingCampRequest {
  id: string;
  campId: string;
  campName: string;
  requestedBy: string;
  resourceName: string;
  quantity: number;
  unit: string;
  urgency: 'Routine' | 'Urgent' | 'Critical';
  reason: string;
}

export interface AppContextType {
  theme: 'plain' | 'army';
  setTheme: (theme: 'plain' | 'army') => void;
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  canAccessView: (view: ActiveView) => boolean;
  selectedCampId: string;
  setSelectedCampId: (campId: string) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  backendAvailable: boolean;
  retryBackendConnection: () => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  createCampProfile: (camp: {
    name: string;
    code: string;
    type: Camp['type'];
    location: string;
    commander: string;
    personnel: number;
    readinessScore: number;
    weather: string;
    temperature: string;
    profileImage?: File | null;
  }) => Promise<{
    id: string;
    profileEmail: string;
    profilePassword: string;
  } | null>;
  deleteCampProfile: (campId: string) => Promise<void>;
  resetAllData: () => void;
  camps: Camp[];
  currentCamp: Camp;
  resources: ResourceItem[];
  currentCampResources: ResourceItem[];
  addResource: (
    resource: Omit<ResourceItem, 'id' | 'status' | 'estDays'>
  ) => void;
  updateResource: (id: string, updates: Partial<ResourceItem>) => void;
  deleteResource: (id: string) => void;
  restockResource: (id: string, addedAmount: number, notes?: string) => void;
  transferResource: (
    resourceId: string,
    targetCampId: string,
    amount: number
  ) => void;
  consumptionHistory: ConsumptionDataPoint[];
  recordConsumption: (entry: {
    resourceName: string;
    category: ResourceCategory;
    date: string;
    quantity: number;
    headcount: number;
    purpose: string;
    unit: string;
  }) => Promise<void>;
  isRecordConsumptionModalOpen: boolean;
  setIsRecordConsumptionModalOpen: (open: boolean) => void;
  alerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  dispatchResupplyForAlert: (id: string) => void;
  equipment: EquipmentItem[];
  addEquipment: (equipment: Omit<EquipmentItem, 'id'>) => void;
  updateEquipmentStatus: (
    id: string,
    status: EquipmentItem['status']
  ) => void;
  isAddEquipmentModalOpen: boolean;
  setIsAddEquipmentModalOpen: (open: boolean) => void;
  maintenanceTasks: MaintenanceTask[];
  updateTaskStatus: (
    id: string,
    status: MaintenanceTask['status']
  ) => void;
  addMaintenanceTask: (
    task: Omit<MaintenanceTask, 'id'>
  ) => Promise<void>;
  supplyRequests: SupplyRequest[];
  submitSupplyRequest: (
    request: Omit<
      SupplyRequest,
      | 'id'
      | 'status'
      | 'createdAt'
      | 'requestedBy'
      | 'campId'
      | 'campName'
      | 'auditLog'
    >
  ) => Promise<void>;
  updateSupplyRequestStatus: (
    id: string,
    status: SupplyRequestStatus,
    details?: {
      reason?: string;
      carrier?: string;
      eta?: string;
    }
  ) => Promise<void>;
  isAddResourceModalOpen: boolean;
  setIsAddResourceModalOpen: (open: boolean) => void;
  isQuickRestockModalOpen: boolean;
  setIsQuickRestockModalOpen: (open: boolean) => void;
  activeRestockResource: ResourceItem | null;
  setActiveRestockResource: (res: ResourceItem | null) => void;
  isHelpModalOpen: boolean;
  setIsHelpModalOpen: (open: boolean) => void;
  isAppsDrawerOpen: boolean;
  setIsAppsDrawerOpen: (open: boolean) => void;
  isDispatchModalOpen: boolean;
  setIsDispatchModalOpen: (open: boolean) => void;
  pendingCampRequests: PendingCampRequest[];
  setPendingCampRequests: (
    requests:
      | PendingCampRequest[]
      | ((prev: PendingCampRequest[]) => PendingCampRequest[])
  ) => void;
  clearPendingCampRequest: (id: string) => void;
  toasts: ToastMessage[];
  addToast: (
    type: ToastMessage['type'],
    title: string,
    message: string
  ) => void;
  removeToast: (id: string) => void;
}
