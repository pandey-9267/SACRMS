import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  ResourceItem,
  Camp,
  AlertItem,
  UserProfile,
  EquipmentItem,
  MaintenanceTask,
  ResourceCategory,
  ResourceStatus,
  SupplyRequest,
  SupplyRequestStatus,
  SupplyRequestAuditEntry,
  ConsumptionDataPoint,
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

interface AppContextType {
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

  updateResource: (
    id: string,
    updates: Partial<ResourceItem>
  ) => void;

  deleteResource: (id: string) => void;

  restockResource: (
    id: string,
    addedAmount: number,
    notes?: string
  ) => void;

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

  addEquipment: (
    equipment: Omit<EquipmentItem, 'id'>
  ) => void;

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

  setActiveRestockResource: (
    res: ResourceItem | null
  ) => void;

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

const AppContext = createContext<
  AppContextType | undefined
>(undefined);

const API_BASE_URL =
  'https://sacrms.onrender.com/api';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem('sacrms_token');

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type':
          'application/json',

        ...(token
          ? {
            Authorization: `Bearer ${token}`,
          }
          : {}),

        ...options.headers,
      },
    }
  );

  const payload =
    await response.json().catch(
      () => null
    );

  if (!response.ok) {
    throw new Error(
      payload?.message ||
      'Backend request failed'
    );
  }

  return payload as T;
}

const roleViews: Record<
  UserProfile['role'],
  ActiveView[]
> = {
  Admin: [
    'dashboard',
    'camps',
    'resources',
    'consumption',
    'equipment',
    'maintenance',
    'alerts',
    'reports',
    'users',
    'settings',
    'requests',
  ],

  Logistics: [
    'dashboard',
    'resources',
    'consumption',
    'equipment',
    'maintenance',
    'alerts',
    'reports',
    'settings',
    'requests',
  ],

  Maintenance: [
    'dashboard',
    'camps',
    'equipment',
    'maintenance',
    'alerts',
    'reports',
  ],

  'Maintenance Supervisor': [
    'dashboard',
    'camps',
    'equipment',
    'maintenance',
    'alerts',
    'reports',
  ],

  Commander: [
    'dashboard',
    'camps',
    'alerts',
    'reports',
  ],
};

export const AppProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [backendAvailable, setBackendAvailable] =
    useState(false);

  const [backendCheckVersion, setBackendCheckVersion] =
    useState(0);

  const [theme, setTheme] =
    useState<'plain' | 'army'>(() => {
      return localStorage.getItem(
        'sacrms_theme'
      ) === 'army'
        ? 'army'
        : 'plain';
    });

  const [currentView, setCurrentView] =
    useState<ActiveView>('dashboard');

const [selectedCampId, setSelectedCampIdState] =
  useState<string>(() => {
    const saved =
      localStorage.getItem(
        'sacrms_selected_camp'
      );

    return saved &&
      /^[a-f\d]{24}$/i.test(saved)
      ? saved
      : '';
  });

const setSelectedCampId = (campId: string) => {
  setSelectedCampIdState(campId);

  if (campId) {
    localStorage.setItem(
      'sacrms_selected_camp',
      campId
    );
  }
};

  const [currentUser, setCurrentUser] =
    useState<UserProfile | null>(() => {
      if (
        !localStorage.getItem(
          'sacrms_token'
        )
      ) {
        return null;
      }

      const saved =
        localStorage.getItem(
          'sacrms_user'
        );

      if (saved) {
        try {
          const user =
            JSON.parse(
              saved
            ) as UserProfile;

          return user.name ===
            'Col. Marcus Vance'
            ? {
              ...user,
              name: 'Col. Abhishek Pandey',
            }
            : user;
        } catch (error) {
          console.error(error);
        }
      }

      return null;
    });

  const canAccessView = (
    view: ActiveView
  ) => {
    return currentUser
      ? roleViews[
        currentUser.role
      ].includes(view)
      : false;
  };

  const [camps, setCamps] =
    useState<Camp[]>([]);

  const [resources, setResources] =
    useState<ResourceItem[]>([]);

  const [alerts, setAlerts] =
    useState<AlertItem[]>([]);

  const [equipment, setEquipment] =
    useState<EquipmentItem[]>([]);

  const [
    isAddEquipmentModalOpen,
    setIsAddEquipmentModalOpen,
  ] = useState(false);

  const [
    maintenanceTasks,
    setMaintenanceTasks,
  ] = useState<MaintenanceTask[]>([]);

  const [
    supplyRequests,
    setSupplyRequests,
  ] = useState<SupplyRequest[]>([]);

  const [
    consumptionHistory,
    setConsumptionHistory,
  ] = useState<ConsumptionDataPoint[]>(
    []
  );

  const [
    isRecordConsumptionModalOpen,
    setIsRecordConsumptionModalOpen,
  ] = useState(false);

  const [
    isAddResourceModalOpen,
    setIsAddResourceModalOpen,
  ] = useState(false);

  const [
    isQuickRestockModalOpen,
    setIsQuickRestockModalOpen,
  ] = useState(false);

  const [
    activeRestockResource,
    setActiveRestockResource,
  ] = useState<ResourceItem | null>(
    null
  );

  const [
    isHelpModalOpen,
    setIsHelpModalOpen,
  ] = useState(false);

  const [
    isAppsDrawerOpen,
    setIsAppsDrawerOpen,
  ] = useState(false);

  const [
    isDispatchModalOpen,
    setIsDispatchModalOpen,
  ] = useState(false);

  const [
    pendingCampRequests,
    setPendingCampRequests,
  ] = useState<PendingCampRequest[]>(
    () => {
      const saved =
        localStorage.getItem(
          'sacrms_pending_requests'
        );

      if (!saved) return [];

      try {
        return JSON.parse(
          saved
        ) as PendingCampRequest[];
      } catch (error) {
        console.error(error);
        return [];
      }
    }
  );

  const [toasts, setToasts] =
    useState<ToastMessage[]>([]);

  const addToast = (
    type: ToastMessage['type'],
    title: string,
    message: string
  ) => {
    const id =
      `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`;

    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        message,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.filter(
          (toast) =>
            toast.id !== id
        )
      );
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) =>
      prev.filter(
        (toast) =>
          toast.id !== id
      )
    );
  };

  const hasRole = (
    ...roles: UserProfile['role'][]
  ) => {
    return (
      !!currentUser &&
      roles.includes(currentUser.role)
    );
  };

  // ============================================================
  // BACKEND CONNECTION CHECK
  // ============================================================

  useEffect(() => {
    let isMounted = true;

    const checkBackend = async () => {
      try {
        const response =
          await fetch(
            `${API_BASE_URL}/health`,
            {
              cache: 'no-store',
            }
          );

        if (isMounted) {
          setBackendAvailable(
            response.ok
          );
        }
      } catch {
        if (isMounted) {
          setBackendAvailable(false);
        }
      }
    };

    checkBackend();

    const intervalId =
      window.setInterval(
        checkBackend,
        5000
      );

    return () => {
      isMounted = false;
      window.clearInterval(
        intervalId
      );
    };
  }, [backendCheckVersion]);

  const retryBackendConnection = () => {
    setBackendCheckVersion(
      (version) => version + 1
    );
  };

  // ============================================================
  // CAMP SELECTION
  // ============================================================

  useEffect(() => {
    if (
      currentUser?.role !== 'Admin' &&
      currentUser?.campId &&
      currentUser.campId !==
      selectedCampId
    ) {
      setSelectedCampId(
        currentUser.campId
      );
    }
  }, [
    currentUser,
    selectedCampId,
  ]);

  // ============================================================
  // LOAD BACKEND DATA
  // ============================================================

  useEffect(() => {
    if (
      !backendAvailable ||
      !currentUser
    ) {
      return;
    }

    const loadBackendData =
      async () => {
        try {
          const campData =
            await apiRequest<
              Array<
                Record<string, unknown>
              >
            >('/camps');

         const mappedCamps: Camp[] =
  campData.map(
    (camp) => ({
      id: String(
        camp._id
      ),

      name: String(
        camp.name
      ),

      type:
        camp.type as Camp['type'],

      code: String(
        camp.code
      ),

      personnel: Number(
        camp.personnel || 0
      ),

      readinessScore:
        camp.status ===
          'Optimal'
          ? 100
          : camp.status ===
            'Warning'
            ? 60
            : 30,

      location: String(
        camp.location
      ),

      commander: String(
        camp.commander
      ),

      status:
        camp.status as Camp['status'],

      weather: String(
        camp.weather ||
        'No data'
      ),

      temperature: String(
        camp.temperature ||
        'N/A'
      ),

      // Camp-specific settings
      warningThreshold:
        Number(
          camp.warningThreshold ?? 45
        ),

      criticalThreshold:
        Number(
          camp.criticalThreshold ?? 20
        ),

      autoAlerts:
        camp.autoAlerts ??
        true,

      audioPings:
        camp.audioPings ??
        false,
    })
  );

setCamps(mappedCamps);
         if (currentUser.role === 'Admin') {
  const savedCampId =
    localStorage.getItem(
      'sacrms_selected_camp'
    );

  const savedCampExists =
    savedCampId &&
    mappedCamps.some(
      (camp) =>
        camp.id === savedCampId
    );

  if (
    savedCampExists &&
    savedCampId !== selectedCampId
  ) {
    setSelectedCampId(
      savedCampId
    );
  } else if (
    !savedCampExists &&
    !selectedCampId &&
    mappedCamps[0]
  ) {
    setSelectedCampId(
      mappedCamps[0].id
    );
  }
}

          const campId =
            currentUser.role ===
              'Admin'
              ? selectedCampId
              : currentUser.campId;

          if (campId) {
            const resourceData =
              await apiRequest<
                Array<
                  Record<string, unknown>
                >
              >(
                `/resources?campId=${encodeURIComponent(
                  campId
                )}`
              );

            setResources(
              resourceData.map(
                (resource) => {
                  const resourceCampId =
                    String(
                      resource.campId
                    );

                  const resourceCamp =
                    mappedCamps.find(
                      (camp) =>
                        camp.id ===
                        resourceCampId
                    );

                  const currentStock =
                    Number(
                      resource.currentStock ||
                      0
                    );

                  const minLevel =
                    Number(
                      resource.minLevel ||
                      0
                    );

                  const maxCapacity =
                    Number(
                      resource.maxCapacity ||
                      0
                    );

                  const burnRate =
                    Number(
                      resource.burnRatePerPersonPerDay ||
                      0
                    );

                  const personnel =
                    resourceCamp?.personnel ||
                    1;

                  const dailyDemand =
                    burnRate *
                    personnel;

                  const estDays =
                    dailyDemand > 0
                      ? Number(
                        (
                          currentStock /
                          dailyDemand
                        ).toFixed(1)
                      )
                      : 99;

                  const ratio =
                    maxCapacity > 0
                      ? currentStock /
                      maxCapacity
                      : 0;

                  const status: ResourceStatus =
                    currentStock <=
                      minLevel ||
                      ratio <= 0.2
                      ? 'Critical'
                      : ratio <= 0.45
                        ? 'Warning'
                        : 'Healthy';

                  return {
                    id: String(
                      resource._id
                    ),

                    name: String(
                      resource.name
                    ),

                    category:
                      resource.category as ResourceCategory,

                    currentStock,

                    unit: String(
                      resource.unit
                    ),

                    minLevel,

                    maxCapacity,

                    burnRatePerPersonPerDay:
                      burnRate,

                    estDays,

                    status,

                    campId:
                      resourceCampId,

                    icon: 'inventory_2',

                    lastRestocked: '',

                    location: String(
                      resource.location
                    ),

                    sku: String(
                      resource.sku
                    ),
                  };
                }
              )
            );

            const consumptionData =
              await apiRequest<
                Array<
                  Record<string, unknown>
                >
              >(
                `/consumption?campId=${encodeURIComponent(
                  campId
                )}`
              );

            setConsumptionHistory(
              consumptionData.map(
                (record) => {
                  const quantity =
                    Number(
                      record.quantity || 0
                    );

                  const category =
                    record.category as
                    | ResourceCategory
                    | undefined;

                  const resourceName =
                    record.resourceName
                      ? String(
                        record.resourceName
                      )
                      : '';

                  const date =
                    String(
                      record.date
                    );

                  const day =
                    new Date(
                      `${date}T00:00:00`
                    ).toLocaleDateString(
                      'en-US',
                      {
                        weekday: 'short',
                      }
                    );

                  return {
                    date,

                    day,

                    // ==================================================
                    // EXACT RESOURCE INFORMATION
                    // ==================================================

                    resourceName,

                    category,

                    quantity,

                    // ==================================================
                    // LEGACY FIELDS
                    // Keep these so existing UI/data does not break.
                    // ==================================================

                    water:
                      category === 'Water'
                        ? quantity
                        : 0,

                    fuel:
                      category === 'Fuel'
                        ? quantity
                        : 0,

                    food:
                      category === 'Food'
                        ? quantity
                        : 0,

                    medical:
                      category === 'Medicine'
                        ? quantity
                        : 0,

                    // ==================================================
                    // ADDITIONAL INFORMATION
                    // ==================================================

                    headcount:
                      Number(
                        record.headcount || 0
                      ),

                    purpose:
                      String(
                        record.purpose || ''
                      ),

                    unit:
                      String(
                        record.unit || ''
                      ),
                  };
                }
              )
            );
          }

          const requestData =
            await apiRequest<
              Array<
                Record<string, unknown>
              >
            >('/requests');

          setSupplyRequests(
            requestData.map(
              (request) => ({
                id: String(
                  request._id
                ),

                campId:
                  typeof request.campId ===
                    'object' &&
                    request.campId !== null
                    ? String(
                      (
                        request.campId as Record<
                          string,
                          unknown
                        >
                      )._id
                    )
                    : String(
                      request.campId
                    ),

                campName:
                  typeof request.campId ===
                    'object' &&
                    request.campId !== null
                    ? String(
                      (
                        request.campId as Record<
                          string,
                          unknown
                        >
                      ).name
                    )
                    : '',

                category:
                  request.category as ResourceCategory,

                resourceName:
                  String(
                    request.resourceName
                  ),

                quantity: Number(
                  request.quantity
                ),

                unit: String(
                  request.unit
                ),

                urgency:
                  request.urgency as SupplyRequest['urgency'],

                reason: String(
                  request.reason
                ),

                status:
                  request.status as SupplyRequestStatus,

                requestedBy:
                  typeof request.requestedBy ===
                    'object' &&
                    request.requestedBy !== null
                    ? String(
                      (
                        request.requestedBy as Record<
                          string,
                          unknown
                        >
                      ).name
                    )
                    : String(
                      request.requestedBy
                    ),

                createdAt: String(
                  request.createdAt
                ),

                carrier:
                  request.carrier
                    ? String(
                      request.carrier
                    )
                    : undefined,

                eta:
                  request.eta
                    ? String(
                      request.eta
                    )
                    : undefined,

                rejectionReason:
                  request.rejectionReason
                    ? String(
                      request.rejectionReason
                    )
                    : undefined,

                receivedAt:
                  request.receivedAt
                    ? String(
                      request.receivedAt
                    )
                    : undefined,

                sourceResourceId:
                  request.sourceResourceId
                    ? String(
                      request.sourceResourceId
                    )
                    : undefined,

                auditLog: [],
              })
            )
          );

          const equipmentData =
            await apiRequest<
              Array<
                Record<string, unknown>
              >
            >(
              `/equipment?campId=${encodeURIComponent(
                campId || ''
              )}`
            );

          setEquipment(
            equipmentData.map(
              (item) => ({
                id: String(
                  item._id
                ),

                name: String(
                  item.name
                ),

                category:
                  item.category as EquipmentItem['category'],

                serialNumber:
                  String(
                    item.serialNumber
                  ),

                model:
                  item.model
                    ? String(
                      item.model
                    )
                    : undefined,

                status:
                  item.status as EquipmentItem['status'],

                healthScore:
                  Number(
                    item.healthScore ||
                    0
                  ),

                operatingHours:
                  Number(
                    item.operatingHours ||
                    0
                  ),

                nextServiceDate:
                  item.nextServiceDate
                    ? String(
                      item.nextServiceDate
                    ).slice(0, 10)
                    : '',

                location:
                  item.location
                    ? String(
                      item.location
                    )
                    : undefined,

                lastMaintenanceDate:
                  item.lastMaintenanceDate
                    ? String(
                      item.lastMaintenanceDate
                    )
                    : undefined,

                campId: String(
                  item.campId
                ),
              })
            )
          );

          const maintenanceData =
            await apiRequest<
              Array<
                Record<string, unknown>
              >
            >(
              `/maintenance?campId=${encodeURIComponent(
                campId || ''
              )}`
            );

          setMaintenanceTasks(
            maintenanceData.map(
              (item) => ({
                id: String(
                  item._id
                ),

                title: String(
                  item.title
                ),

                equipmentId:
                  String(
                    item.equipmentId
                  ),

                equipmentName: '',

                priority:
                  item.priority as MaintenanceTask['priority'],

                status:
                  item.status as MaintenanceTask['status'],

                assignedTo: String(
                  item.assignedTo ||
                  ''
                ),

                dueDate:
                  item.dueDate
                    ? String(
                      item.dueDate
                    )
                    : '',

                description:
                  String(
                    item.description ||
                    ''
                  ),

                campId: String(
                  item.campId
                ),
              })
            )
          );
        } catch (error) {
          addToast(
            'error',
            'Backend Data Error',
            error instanceof Error
              ? error.message
              : 'Unable to load records from MongoDB.'
          );
        }
      };

    loadBackendData();
  }, [
    backendAvailable,
    currentUser,
    selectedCampId,
  ]);

  // ============================================================
  // THEME
  // ============================================================

  useEffect(() => {
    document.body.classList.toggle(
      'army-mode',
      theme === 'army'
    );

    localStorage.setItem(
      'sacrms_theme',
      theme
    );
  }, [theme]);

  // ============================================================
  // SAVE USER
  // ============================================================

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        'sacrms_user',
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem(
        'sacrms_user'
      );
    }
  }, [currentUser]);

  // ============================================================
  // CURRENT CAMP
  // ============================================================

  const currentCamp: Camp =
    camps.find(
      (camp) =>
        camp.id === selectedCampId
    ) ||
    camps[0] || {
      id: 'hq-admin',
      name: 'No Camp Selected',
      type: 'Live',
      code: 'HQ-EMPTY',
      personnel: 0,
      readinessScore: 0,
      location: 'Awaiting camp creation',
      commander: 'Headquarters Admin',
      status: 'Standby',
      weather: 'No data',
      temperature: 'N/A',
    };

  const currentCampResources =
    resources.filter(
      (resource) =>
        resource.campId ===
        currentCamp.id
    );

  // ============================================================
  // RESOURCE HELPERS
  // ============================================================

  const calculateStatus = (
    current: number,
    min: number,
    max: number
  ): ResourceStatus => {
    const ratio =
      max > 0
        ? current / max
        : 0;

    if (
      current <= min ||
      ratio <= 0.2
    ) {
      return 'Critical';
    }

    if (ratio <= 0.45) {
      return 'Warning';
    }

    return 'Healthy';
  };

  const calculateEstDays = (
    current: number,
    burnRate: number,
    personnel: number
  ): number => {
    const dailyDemand =
      burnRate * personnel;

    if (dailyDemand <= 0) {
      return 99;
    }

    return Number(
      (
        current / dailyDemand
      ).toFixed(1)
    );
  };

  const getCampPersonnel = (
    campId: string
  ): number => {
    return (
      camps.find(
        (camp) =>
          camp.id === campId
      )?.personnel || 1
    );
  };

  const normalizeResourceName = (
    name: string
  ): string => {
    return name
      .trim()
      .toLowerCase();
  };

  // ============================================================
  // OPERATIONAL ALERT ENGINE
  // ============================================================

  const buildOperationalAlerts = (
    resourceList: ResourceItem[],
    equipmentList: EquipmentItem[],
    maintenanceList: MaintenanceTask[],
    campList: Camp[]
  ): AlertItem[] => {
    const generated: AlertItem[] = [];

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    // ----------------------------------------------------------
    // RESOURCE ALERTS
    // ----------------------------------------------------------

    resourceList.forEach(
      (resource) => {
        const camp =
          campList.find(
            (item) =>
              item.id ===
              resource.campId
          );

        if (!camp) return;

        const stock =
          Number(
            resource.currentStock ||
            0
          );

        const minLevel =
          Number(
            resource.minLevel ||
            0
          );

        const maxCapacity =
          Number(
            resource.maxCapacity ||
            0
          );

        const runway =
          Number(
            resource.estDays ||
            0
          );

        const ratio =
          maxCapacity > 0
            ? stock /
            maxCapacity
            : 0;

        let severity:
          | AlertItem['severity']
          | null = null;

        if (
          stock <= minLevel ||
          ratio <= 0.2 ||
          runway <= 2
        ) {
          severity = 'High';
        } else if (
          ratio <= 0.45 ||
          runway <= 5
        ) {
          severity = 'Medium';
        }

        if (!severity) return;

        generated.push({
          id: `auto-resource-${resource.id}`,

          title:
            severity === 'High'
              ? `${resource.name} Stock Critical`
              : `${resource.name} Stock Warning`,

          description:
            `${camp.name} has ${stock.toLocaleString()} ${resource.unit} of ${resource.name} remaining. ` +
            `Estimated operational runway is ${runway.toFixed(1)} days.`,

          category:
            resource.category as AlertItem['category'],

          severity,

          campId: camp.id,

          campName:
            camp.name,

          timestamp:
            'Operational',

          acknowledged:
            false,

          actionRequired:
            severity === 'High'
              ? `Initiate emergency resupply for ${resource.name}.`
              : `Review ${resource.name} consumption and arrange replenishment.`,
        });
      }
    );

    // ----------------------------------------------------------
    // EQUIPMENT ALERTS
    // ----------------------------------------------------------

    equipmentList.forEach(
      (item) => {
        const camp =
          campList.find(
            (campItem) =>
              campItem.id ===
              item.campId
          );

        if (!camp) return;

        const status =
          String(
            item.status || ''
          ).toLowerCase();

        const health =
          Number(
            item.healthScore || 0
          );

        let severity:
          | AlertItem['severity']
          | null = null;

        let title = '';
        let description = '';
        let actionRequired = '';

        // Failed equipment
        if (
          status === 'failed' ||
          status === 'offline' ||
          status === 'down'
        ) {
          severity = 'High';

          title =
            `${item.name} Equipment Failure`;

          description =
            `${item.name} (${item.serialNumber}) at ${camp.name} is currently marked as ${item.status}.`;

          actionRequired =
            'Create a maintenance work order and remove the asset from operational service.';
        }

        // Very low health
        else if (
          health > 0 &&
          health <= 20
        ) {
          severity = 'High';

          title =
            `${item.name} Critical Health`;

          description =
            `${item.name} (${item.serialNumber}) has an equipment health score of ${health}%.`;

          actionRequired =
            'Immediate maintenance inspection required.';
        }

        // Low health
        else if (
          health > 20 &&
          health <= 45
        ) {
          severity = 'Medium';

          title =
            `${item.name} Health Degraded`;

          description =
            `${item.name} (${item.serialNumber}) has a reduced health score of ${health}%.`;

          actionRequired =
            'Schedule preventive maintenance before equipment reliability deteriorates further.';
        }

        // Upcoming service
        if (
          item.nextServiceDate &&
          !severity
        ) {
          const serviceDate =
            new Date(
              item.nextServiceDate
            );

          serviceDate.setHours(
            0,
            0,
            0,
            0
          );

          const diffMs =
            serviceDate.getTime() -
            today.getTime();

          const daysUntilService =
            Math.ceil(
              diffMs /
              (1000 *
                60 *
                60 *
                24)
            );

          if (
            daysUntilService < 0
          ) {
            severity = 'High';

            title =
              `${item.name} Service Overdue`;

            description =
              `${item.name} (${item.serialNumber}) at ${camp.name} is overdue for scheduled maintenance.`;

            actionRequired =
              'Open or update a maintenance work order immediately.';
          } else if (
            daysUntilService <= 7
          ) {
            severity = 'Medium';

            title =
              `${item.name} Service Due Soon`;

            description =
              `${item.name} (${item.serialNumber}) is scheduled for maintenance in ${daysUntilService} day${daysUntilService === 1 ? '' : 's'}.`;

            actionRequired =
              'Confirm maintenance availability and schedule the service window.';
          }
        }

        if (!severity) return;

        generated.push({
          id: `auto-equipment-${item.id}`,

          title,

          description,

          category: 'Power',

          severity,

          campId: camp.id,

          campName:
            camp.name,

          timestamp:
            'Operational',

          acknowledged:
            false,

          actionRequired,
        });
      }
    );

    // ----------------------------------------------------------
    // MAINTENANCE WORK ORDER ALERTS
    // ----------------------------------------------------------

    maintenanceList.forEach(
      (task) => {
        const camp =
          campList.find(
            (campItem) =>
              campItem.id ===
              task.campId
          );

        if (!camp) return;

        const status =
          String(
            task.status || ''
          ).toLowerCase();

       

        if (!task.dueDate) {
          return;
        }

        const dueDate =
          new Date(
            task.dueDate
          );

        dueDate.setHours(
          0,
          0,
          0,
          0
        );

        const diffMs =
          dueDate.getTime() -
          today.getTime();

        const daysUntilDue =
          Math.ceil(
            diffMs /
            (1000 *
              60 *
              60 *
              24)
          );

        if (
          daysUntilDue < 0
        ) {
          generated.push({
            id: `auto-maintenance-${task.id}`,

            title:
              'Maintenance Work Order Overdue',

            description:
              `${task.title} at ${camp.name} has passed its due date and is still ${task.status}.`,

            category: 'Power',

            severity: 'High',

            campId:
              camp.id,

            campName:
              camp.name,

            timestamp:
              'Operational',

            acknowledged:
              false,

            actionRequired:
              'Escalate the maintenance task and complete the required service immediately.',
          });
        } else if (
          daysUntilDue <= 3
        ) {
          generated.push({
            id: `auto-maintenance-${task.id}`,

            title:
              'Maintenance Due Soon',

            description:
              `${task.title} at ${camp.name} is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}.`,

            category: 'Power',

            severity: 'Medium',

            campId:
              camp.id,

            campName:
              camp.name,

            timestamp:
              'Operational',

            acknowledged:
              false,

            actionRequired:
              'Confirm assigned personnel and ensure the maintenance task is completed on schedule.',
          });
        }
      }
    );

    return generated;
  };

  // ============================================================
  // SYNC GENERATED OPERATIONAL ALERTS
  // IMPORTANT: THIS MUST BE OUTSIDE buildOperationalAlerts()
  // ============================================================

  useEffect(() => {
    const generatedAlerts =
      buildOperationalAlerts(
        resources,
        equipment,
        maintenanceTasks,
        camps
      );

    setAlerts((prev) => {
      // Keep manually-created alerts
      // such as supply-request alerts.
      const manualAlerts =
        prev.filter(
          (alert) =>
            !alert.id.startsWith(
              'auto-'
            )
        );

      // Preserve acknowledgement state
      // for existing generated alerts.
      const previousAutoAlerts =
        new Map(
          prev
            .filter((alert) =>
              alert.id.startsWith(
                'auto-'
              )
            )
            .map((alert) => [
              alert.id,
              alert.acknowledged,
            ])
        );

      const savedAcknowledgedAlerts =
        new Set<string>(
          JSON.parse(
            localStorage.getItem(
              `sacrms_acknowledged_alerts_${currentUser?.id || 'guest'
              }`
            ) || '[]'
          )
        );

      const synchronizedAutoAlerts =
        generatedAlerts.map(
          (alert) => ({
            ...alert,

            acknowledged:
              previousAutoAlerts.get(
                alert.id
              ) ??
              savedAcknowledgedAlerts.has(
                alert.id
              ),
          })
        );

      return [
        ...synchronizedAutoAlerts,
        ...manualAlerts,
      ];
    });
  }, [
    resources,
    equipment,
    maintenanceTasks,
    camps,
    currentUser?.id,
  ]);

  // ============================================================
  // RECORD CONSUMPTION
  // ============================================================

  const recordConsumption =
    async (
      entry: {
        resourceName: string;
        category: ResourceCategory;
        date: string;
        quantity: number;
        headcount: number;
        purpose: string;
        unit: string;
      }
    ) => {
      if (
        !hasRole(
          'Admin',
          'Logistics'
        )
      ) {
        addToast(
          'warning',
          'Access Restricted',
          'Only Admin and Logistics personnel can record consumption.'
        );

        return;
      }

      if (
        entry.quantity <= 0
      ) {
        addToast(
          'error',
          'Invalid Quantity',
          'Consumption quantity must be greater than zero.'
        );

        return;
      }

      const matchingResource =
        resources.find(
          (resource) =>
            resource.campId ===
            currentCamp.id &&
            resource.category ===
            entry.category &&
            normalizeResourceName(
              resource.name
            ) ===
            normalizeResourceName(
              entry.resourceName
            )
        );

      if (
        !matchingResource
      ) {
        addToast(
          'error',
          'Resource Not Found',
          `No ${entry.resourceName} inventory was found in ${currentCamp.name}.`
        );

        return;
      }

      if (
        matchingResource.currentStock <
        entry.quantity
      ) {
        addToast(
          'error',
          'Insufficient Stock',
          `Only ${matchingResource.currentStock.toLocaleString()} ${matchingResource.unit} of ${matchingResource.name} is currently available.`
        );

        return;
      }

      try {
        // -------------------------------------------------------
        // 1. SAVE CONSUMPTION
        // -------------------------------------------------------

        await apiRequest(
          '/consumption',
          {
            method: 'POST',

            body: JSON.stringify({
              ...entry,
              campId:
                currentCamp.id,
            }),
          }
        );

        // -------------------------------------------------------
        // 2. CALCULATE NEW STOCK
        // -------------------------------------------------------

        const newStock =
          matchingResource.currentStock -
          entry.quantity;

        const newStatus =
          calculateStatus(
            newStock,
            matchingResource.minLevel,
            matchingResource.maxCapacity
          );

        const newEstDays =
          calculateEstDays(
            newStock,
            matchingResource.burnRatePerPersonPerDay,
            currentCamp.personnel
          );

        // -------------------------------------------------------
        // 3. UPDATE RESOURCE IN MONGODB
        // -------------------------------------------------------

        await apiRequest(
          `/resources/${encodeURIComponent(
            matchingResource.id
          )}`,
          {
            method: 'PATCH',

            body: JSON.stringify({
              currentStock:
                newStock,
            }),
          }
        );

        // -------------------------------------------------------
        // 4. UPDATE RESOURCE STATE
        // -------------------------------------------------------

        setResources(
          (prev) =>
            prev.map(
              (resource) =>
                resource.id ===
                  matchingResource.id
                  ? {
                    ...resource,

                    currentStock:
                      newStock,

                    status:
                      newStatus,

                    estDays:
                      newEstDays,
                  }
                  : resource
            )
        );

        // -------------------------------------------------------
        // 5. HISTORY ENTRY
        // -------------------------------------------------------

        const dateValue = new Date(
          `${entry.date}T00:00:00`
        );

        const day = dateValue.toLocaleDateString(
          'en-US',
          {
            weekday: 'short',
          }
        );

        // -------------------------------------------------------
        // 6. ADD HISTORY
        // IMPORTANT:
        // Store the exact resource + category.
        // Do NOT collapse Supplies/Ammunition into Medical.
        // -------------------------------------------------------

        setConsumptionHistory((prev) => [
          {
            date: entry.date,
            day,

            // Exact resource consumed
            resourceName: entry.resourceName,
            category: entry.category,
            quantity: entry.quantity,

            // Keep legacy values for existing UI
            water:
              entry.category === 'Water'
                ? entry.quantity
                : 0,

            fuel:
              entry.category === 'Fuel'
                ? entry.quantity
                : 0,

            food:
              entry.category === 'Food'
                ? entry.quantity
                : 0,

            medical:
              entry.category === 'Medicine'
                ? entry.quantity
                : 0,

            headcount: entry.headcount,
            purpose: entry.purpose,
            unit: entry.unit,
          },

          ...prev,
        ]);

        addToast(
          'success',
          'Consumption Recorded',
          `${entry.quantity.toLocaleString()} ${entry.unit} of ${entry.resourceName} recorded.`
        );
      } catch (error) {
        addToast(
          'error',
          'Consumption save failed',
          error instanceof Error
            ? error.message
            : 'Unable to save consumption to MongoDB.'
        );
      }
    };

  // ============================================================
  // EQUIPMENT
  // ============================================================

  const addEquipment =
    async (
      equipmentData: Omit<
        EquipmentItem,
        'id'
      >
    ) => {
      if (
        !hasRole(
          'Admin',
          'Logistics',
          'Maintenance',
          'Maintenance Supervisor'
        )
      ) {
        addToast(
          'warning',
          'Access Restricted',
          'You do not have permission to add equipment.'
        );

        return;
      }

      try {
        const saved =
          await apiRequest<
            Record<
              string,
              unknown
            >
          >(
            '/equipment',
            {
              method: 'POST',

              body: JSON.stringify({
                ...equipmentData,
                campId:
                  currentCamp.id,
              }),
            }
          );

        const newEquipment:
          EquipmentItem = {
          ...equipmentData,

          id: String(
            saved._id
          ),

          campId: String(
            saved.campId
          ),

          healthScore:
            Number(
              saved.healthScore ||
              equipmentData.healthScore ||
              0
            ),

          operatingHours:
            Number(
              saved.operatingHours ||
              equipmentData.operatingHours ||
              0
            ),

          nextServiceDate:
            saved.nextServiceDate
              ? String(
                saved.nextServiceDate
              ).slice(0, 10)
              : equipmentData.nextServiceDate,
        };

        setEquipment(
          (prev) => [
            newEquipment,
            ...prev,
          ]
        );

        addToast(
          'success',
          'Equipment Added',
          `${equipmentData.name} was saved to MongoDB for ${currentCamp.name}.`
        );
      } catch (error) {
        addToast(
          'error',
          'Equipment save failed',
          error instanceof Error
            ? error.message
            : 'Unable to save equipment to MongoDB.'
        );
      }
    };

  // ============================================================
  // LOGIN
  // ============================================================

  const login = (
    email: string,
    password: string
  ) => {
    if (!backendAvailable) {
      addToast(
        'error',
        'Backend Offline',
        'Start the SACRMS backend before signing in.'
      );

      return;
    }

    apiRequest<{
      token: string;
      user: UserProfile;
    }>(
      '/auth/login',
      {
        method: 'POST',

        body: JSON.stringify({
          email,
          password,
        }),
      }
    )
      .then(
        ({
          token,
          user,
        }) => {
          localStorage.setItem(
            'sacrms_token',
            token
          );

          setCurrentUser(user);

          if (user.campId) {
            setSelectedCampId(
              user.campId
            );
          }

          setCurrentView(
            'dashboard'
          );

          addToast(
            'success',
            'Authentication Verified',
            `Welcome back, ${user.rank} ${user.name}`
          );
        }
      )
      .catch(
        (error: unknown) => {
          addToast(
            'error',
            'Authentication Failed',
            error instanceof Error
              ? error.message
              : 'Invalid service email or passcode.'
          );
        }
      );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem(
      'sacrms_user'
    );

    localStorage.removeItem(
      'sacrms_token'
    );

    setCurrentUser(null);

    addToast(
      'info',
      'Logged Out',
      'Your session has been terminated securely.'
    );
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetAllData = () => {
    setCamps([]);
    setResources([]);
    setAlerts([]);
    setEquipment([]);
    setMaintenanceTasks([]);
    setSupplyRequests([]);
    setConsumptionHistory([]);
    setPendingCampRequests([]);

    localStorage.removeItem(
      'sacrms_camps'
    );

    localStorage.removeItem(
      'sacrms_resources'
    );

    localStorage.removeItem(
      'sacrms_alerts'
    );

    localStorage.removeItem(
      'sacrms_equipment'
    );

    localStorage.removeItem(
      'sacrms_tasks'
    );

    localStorage.removeItem(
      'sacrms_supply_requests'
    );

    localStorage.removeItem(
      'sacrms_pending_requests'
    );

    localStorage.removeItem(
      'sacrms_profiles'
    );

    localStorage.removeItem(
      'sacrms_profile_passwords'
    );

    localStorage.removeItem(
      'sacrms_user'
    );

    setCurrentUser(null);

    addToast(
      'success',
      'Data Reset',
      'All camp data and records have been cleared to zero.'
    );
  };

  // ============================================================
  // CREATE CAMP PROFILE
  // ============================================================

  const createCampProfile =
    async (
      campData: {
        name: string;
        code: string;
        type: Camp['type'];
        location: string;
        commander: string;
        personnel: number;
        readinessScore: number;
        weather: string;
        temperature: string;
      }
    ) => {
      if (!hasRole('Admin')) {
        addToast(
          'warning',
          'Access Restricted',
          'Only the HQ Admin can create camps and camp credentials.'
        );

        return null;
      }

      const safeName =
        campData.name.trim();

      const safeCode =
        campData.code.trim();

      if (
        !safeName ||
        !safeCode
      ) {
        addToast(
          'error',
          'Camp validation failed',
          'Camp name and code are required.'
        );

        return null;
      }

      const normalizedName =
        safeName
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            '-'
          )
          .replace(
            /^-|-$/g,
            ''
          );

      const profileEmail =
        `logistics.lead@${normalizedName}.mil`;

      try {
        const result =
          await apiRequest<{
            camp: Record<
              string,
              unknown
            >;

            leader: {
              id: string;
              name: string;
              email: string;
              serviceId: string;
            };

            temporaryPassword:
            string;
          }>(
            '/camps',
            {
              method: 'POST',

              body: JSON.stringify({
                name: safeName,

                code: safeCode,

                type:
                  campData.type,

                personnel:
                  Math.max(
                    0,
                    campData.personnel
                  ),

                location:
                  campData.location.trim(),

                commander:
                  campData.commander.trim() ||
                  'HQ Assigned Commander',

                weather:
                  campData.weather.trim() ||
                  'Clear',

                temperature:
                  campData.temperature.trim() ||
                  'N/A',

                leader: {
                  name:
                    campData.commander.trim() ||
                    'Camp Logistics Lead',

                  email:
                    profileEmail,

                  rank:
                    `${safeName} Logistics Lead`,
                },
              }),
            }
          );

        const camp =
          result.camp;

        const createdCamp:
          Camp = {
          id: String(
            camp._id
          ),

          name: String(
            camp.name
          ),

          type:
            camp.type as Camp['type'],

          code: String(
            camp.code
          ),

          personnel:
            Number(
              camp.personnel
            ),

          readinessScore:
            campData.readinessScore,

          location:
            String(
              camp.location
            ),

          commander:
            String(
              camp.commander
            ),

          status:
            camp.status as Camp['status'],

          weather:
            campData.weather.trim() ||
            'Clear',

          temperature:
            campData.temperature.trim() ||
            '22°C / 72°F',
        };

        const newProfile:
          UserProfile = {
          id:
            result.leader.id,

          name:
            result.leader.name,

          email:
            result.leader.email,

          role: 'Logistics',

          rank:
            `${safeName} Logistics Lead`,

          campId:
            createdCamp.id,

          avatarUrl:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',

          serviceId:
            result.leader.serviceId,

          accessScope:
            'Camp',
        };

        const existingProfiles =
          JSON.parse(
            localStorage.getItem(
              'sacrms_profiles'
            ) || '[]'
          ) as UserProfile[];

        const existingPasswords =
          JSON.parse(
            localStorage.getItem(
              'sacrms_profile_passwords'
            ) || '{}'
          ) as Record<
            string,
            string
          >;

        localStorage.setItem(
          'sacrms_profiles',
          JSON.stringify([
            ...existingProfiles,
            newProfile,
          ])
        );

        existingPasswords[
          profileEmail.toLowerCase()
        ] =
          result.temporaryPassword;

        localStorage.setItem(
          'sacrms_profile_passwords',
          JSON.stringify(
            existingPasswords
          )
        );

        setCamps(
          (prev) => [
            createdCamp,
            ...prev,
          ]
        );

        setSelectedCampId(
          createdCamp.id
        );

        setCurrentView(
          'dashboard'
        );

        addToast(
          'success',
          'Camp created',
          `${safeName} was saved to MongoDB with generated credentials.`
        );

        return {
          id:
            createdCamp.id,

          profileEmail,

          profilePassword:
            result.temporaryPassword,
        };
      } catch (error) {
        addToast(
          'error',
          'Camp creation failed',
          error instanceof Error
            ? error.message
            : 'Unable to save camp to MongoDB.'
        );

        return null;
      }
    };

  // ============================================================
  // DELETE CAMP
  // ============================================================

  const deleteCampProfile =
    async (
      campId: string
    ) => {
      if (!hasRole('Admin')) {
        addToast(
          'warning',
          'Access Restricted',
          'Only HQ Admin can remove camp credentials.'
        );

        return;
      }

      const targetCamp =
        camps.find(
          (camp) =>
            camp.id === campId
        );

      if (!targetCamp) {
        addToast(
          'error',
          'Camp not found',
          'The selected camp profile does not exist.'
        );

        return;
      }

      try {
        await apiRequest(
          `/camps/${encodeURIComponent(
            campId
          )}`,
          {
            method: 'DELETE',
          }
        );
      } catch (error) {
        addToast(
          'error',
          'Camp deletion failed',
          error instanceof Error
            ? error.message
            : 'Unable to delete camp from MongoDB.'
        );

        return;
      }

      const storedProfiles =
        JSON.parse(
          localStorage.getItem(
            'sacrms_profiles'
          ) || '[]'
        ) as UserProfile[];

      const storedPasswords =
        JSON.parse(
          localStorage.getItem(
            'sacrms_profile_passwords'
          ) || '{}'
        ) as Record<
          string,
          string
        >;

      const relatedEmails =
        storedProfiles
          .filter(
            (profile) =>
              profile.campId ===
              campId
          )
          .map(
            (profile) =>
              profile.email.toLowerCase()
          );

      relatedEmails.forEach(
        (email) => {
          delete storedPasswords[
            email
          ];
        }
      );

      const remainingProfiles =
        storedProfiles.filter(
          (profile) =>
            profile.campId !==
            campId
        );

      localStorage.setItem(
        'sacrms_profiles',
        JSON.stringify(
          remainingProfiles
        )
      );

      localStorage.setItem(
        'sacrms_profile_passwords',
        JSON.stringify(
          storedPasswords
        )
      );

      setCamps(
        (prev) =>
          prev.filter(
            (camp) =>
              camp.id !== campId
          )
      );

      setResources(
        (prev) =>
          prev.filter(
            (resource) =>
              resource.campId !==
              campId
          )
      );

      setAlerts(
        (prev) =>
          prev.filter(
            (alert) =>
              alert.campId !==
              campId
          )
      );

      setEquipment(
        (prev) =>
          prev.filter(
            (item) =>
              item.campId !==
              campId
          )
      );

      setMaintenanceTasks(
        (prev) =>
          prev.filter(
            (task) =>
              task.campId !==
              campId
          )
      );

      setSupplyRequests(
        (prev) =>
          prev.filter(
            (request) =>
              request.campId !==
              campId
          )
      );

      setPendingCampRequests(
        (prev) =>
          prev.filter(
            (request) =>
              request.campId !==
              campId
          )
      );

      if (
        currentUser?.campId ===
        campId
      ) {
        setCurrentUser(null);
      }

      const fallbackCampId =
        camps.find(
          (camp) =>
            camp.id !== campId
        )?.id ||
        'hq-admin';

      setSelectedCampId(
        fallbackCampId
      );

      addToast(
        'success',
        'Camp deleted',
        `${targetCamp.name} and its generated credentials were removed.`
      );
    };

  // ============================================================
  // AUTHORIZED VIEW
  // ============================================================

  const setAuthorizedView = (
    view: ActiveView
  ) => {
    if (canAccessView(view)) {
      setCurrentView(view);
      return;
    }

    addToast(
      'warning',
      'Access Restricted',
      `${currentUser?.role ||
      'This role'
      } personnel do not have access to ${view}.`
    );
  };

  // ============================================================
  // ADD RESOURCE
  // ============================================================

  const addResource =
    async (
      resData: Omit<
        ResourceItem,
        'id' |
        'status' |
        'estDays'
      >
    ) => {
      if (
        !hasRole(
          'Admin',
          'Logistics'
        )
      ) {
        addToast(
          'warning',
          'Access Restricted',
          'Only Admin and Logistics personnel can modify resources.'
        );

        return;
      }

      const status =
        calculateStatus(
          resData.currentStock,
          resData.minLevel,
          resData.maxCapacity
        );

      const estDays =
        calculateEstDays(
          resData.currentStock,
          resData.burnRatePerPersonPerDay,
          currentCamp.personnel
        );

      try {
        const saved =
          await apiRequest<
            Record<
              string,
              unknown
            >
          >(
            '/resources',
            {
              method: 'POST',

              body: JSON.stringify({
                ...resData,

                campId:
                  currentCamp.id,
              }),
            }
          );

        const newResource:
          ResourceItem = {
          ...resData,

          id: String(
            saved._id
          ),

          campId: String(
            saved.campId
          ),

          status,

          estDays,
        };

        setResources(
          (prev) => [
            newResource,
            ...prev,
          ]
        );

        addToast(
          'success',
          'Resource Created',
          `${newResource.name} was saved to MongoDB for ${currentCamp.name}`
        );
      } catch (error) {
        addToast(
          'error',
          'Resource save failed',
          error instanceof Error
            ? error.message
            : 'Unable to save resource to MongoDB.'
        );
      }
    };

  // ============================================================
  // UPDATE RESOURCE
  // ============================================================

  const updateResource = (
    id: string,
    updates: Partial<ResourceItem>
  ) => {
    if (
      !hasRole(
        'Admin',
        'Logistics'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Logistics personnel can modify resources.'
      );

      return;
    }

    apiRequest(
      `/resources/${encodeURIComponent(
        id
      )}`,
      {
        method: 'PATCH',

        body: JSON.stringify(
          updates
        ),
      }
    ).catch(
      (error: unknown) =>
        addToast(
          'error',
          'Resource update failed',
          error instanceof Error
            ? error.message
            : 'Unable to update resource in MongoDB.'
        )
    );

    setResources(
      (prev) =>
        prev.map(
          (item) => {
            if (
              item.id !== id
            ) {
              return item;
            }

            const merged = {
              ...item,
              ...updates,
            };

            const status =
              calculateStatus(
                merged.currentStock,
                merged.minLevel,
                merged.maxCapacity
              );

            const estDays =
              calculateEstDays(
                merged.currentStock,
                merged.burnRatePerPersonPerDay,
                currentCamp.personnel
              );

            return {
              ...merged,
              status,
              estDays,
            };
          }
        )
    );

    addToast(
      'info',
      'Inventory Updated',
      'Resource parameters synchronized.'
    );
  };

  // ============================================================
  // DELETE RESOURCE
  // ============================================================

  const deleteResource = (
    id: string
  ) => {
    if (
      !hasRole(
        'Admin',
        'Logistics'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Logistics personnel can modify resources.'
      );

      return;
    }

    const item =
      resources.find(
        (resource) =>
          resource.id === id
      );

    apiRequest(
      `/resources/${encodeURIComponent(
        id
      )}`,
      {
        method: 'DELETE',
      }
    ).catch(
      (error: unknown) =>
        addToast(
          'error',
          'Resource deletion failed',
          error instanceof Error
            ? error.message
            : 'Unable to delete resource from MongoDB.'
        )
    );

    setResources(
      (prev) =>
        prev.filter(
          (resource) =>
            resource.id !== id
        )
    );

    addToast(
      'warning',
      'Resource Removed',
      `${item?.name || 'Item'} was archived.`
    );
  };

  // ============================================================
  // RESTOCK RESOURCE
  // ============================================================

  const restockResource = (
    id: string,
    addedAmount: number,
    notes?: string
  ) => {
    if (
      !hasRole(
        'Admin',
        'Logistics'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Logistics personnel can restock resources.'
      );

      return;
    }

    const item =
      resources.find(
        (resource) =>
          resource.id === id
      );

    if (item) {
      apiRequest(
        `/resources/${encodeURIComponent(
          id
        )}`,
        {
          method: 'PATCH',

          body: JSON.stringify({
            currentStock:
              Math.min(
                item.maxCapacity,
                item.currentStock +
                addedAmount
              ),
          }),
        }
      ).catch(
        (error: unknown) =>
          addToast(
            'error',
            'Restock save failed',
            error instanceof Error
              ? error.message
              : 'Unable to save restock to MongoDB.'
          )
      );
    }

    setResources(
      (prev) =>
        prev.map(
          (resource) => {
            if (
              resource.id !== id
            ) {
              return resource;
            }

            const newStock =
              Math.min(
                resource.maxCapacity,
                resource.currentStock +
                addedAmount
              );

            const status =
              calculateStatus(
                newStock,
                resource.minLevel,
                resource.maxCapacity
              );

            const estDays =
              calculateEstDays(
                newStock,
                resource.burnRatePerPersonPerDay,
                currentCamp.personnel
              );

            return {
              ...resource,

              currentStock:
                newStock,

              status,

              estDays,

              lastRestocked:
                new Date()
                  .toISOString()
                  .split('T')[0],
            };
          }
        )
    );

    addToast(
      'success',
      'Restock Completed',
      `Added +${addedAmount.toLocaleString()} to stock balance.${notes
        ? ` (${notes})`
        : ''
      }`
    );
  };

  // ============================================================
  // TRANSFER RESOURCE
  // ============================================================

  const transferResource = (
    resourceId: string,
    targetCampId: string,
    amount: number
  ) => {
    if (
      !hasRole(
        'Admin',
        'Logistics'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Logistics personnel can transfer resources.'
      );

      return;
    }

    const sourceItem =
      resources.find(
        (resource) =>
          resource.id ===
          resourceId
      );

    if (
      !sourceItem ||
      sourceItem.currentStock <
      amount
    ) {
      addToast(
        'error',
        'Transfer Failed',
        'Insufficient stock available for inter-camp transfer.'
      );

      return;
    }

    const targetCamp =
      camps.find(
        (camp) =>
          camp.id ===
          targetCampId
      );

    setResources(
      (prev) =>
        prev.map(
          (item) => {
            if (
              item.id !==
              resourceId
            ) {
              return item;
            }

            const newStock =
              item.currentStock -
              amount;

            const status =
              calculateStatus(
                newStock,
                item.minLevel,
                item.maxCapacity
              );

            const estDays =
              calculateEstDays(
                newStock,
                item.burnRatePerPersonPerDay,
                currentCamp.personnel
              );

            return {
              ...item,

              currentStock:
                newStock,

              status,

              estDays,
            };
          }
        )
    );

    addToast(
      'success',
      'Transfer Dispatched',
      `Transferred ${amount.toLocaleString()} ${sourceItem.unit} of ${sourceItem.name} to ${targetCamp?.name ||
      targetCampId
      }`
    );
  };

  // ============================================================
  // ACKNOWLEDGE ALERT
  // ============================================================

const acknowledgeAlert = (
  id: string
) => {
  if (
    !hasRole(
      'Admin',
      'Logistics',
      'Maintenance',
      'Commander'
    )
  ) {
    addToast(
      'warning',
      'Access Restricted',
      'This role cannot acknowledge alerts.'
    );

    return;
  }

  const alertToAcknowledge =
    alerts.find(
      (alert) => alert.id === id
    );

  if (!alertToAcknowledge) {
    return;
  }

  // ============================================================
  // RESOURCE ALERTS CANNOT BE ACKNOWLEDGED.
  //
  // They must disappear only when the actual resource
  // problem is resolved.
  // ============================================================

  if (
    alertToAcknowledge.id.startsWith(
      'auto-resource-'
    )
  ) {
    addToast(
      'warning',
      'Action Required',
      'Resource alerts cannot be dismissed. Resolve the stock issue through the resupply process.'
    );

    return;
  }

  // ============================================================
  // MAINTENANCE COMPLETION ACKNOWLEDGEMENT
  // ============================================================

  const acknowledgedAlertIds =
    new Set<string>(
      JSON.parse(
        localStorage.getItem(
          `sacrms_acknowledged_alerts_${
            currentUser?.id || 'guest'
          }`
        ) || '[]'
      )
    );

  acknowledgedAlertIds.add(id);

  localStorage.setItem(
    `sacrms_acknowledged_alerts_${
      currentUser?.id || 'guest'
    }`,
    JSON.stringify(
      Array.from(
        acknowledgedAlertIds
      )
    )
  );

  setAlerts(
    (prev) =>
      prev.map(
        (alert) =>
          alert.id === id
            ? {
                ...alert,
                acknowledged: true,
              }
            : alert
      )
  );

  addToast(
    'info',
    'Alert Acknowledged',
    'Maintenance completion has been acknowledged by the camp.'
  );
};

  // ============================================================
  // DISPATCH RESUPPLY
  // ============================================================

  const dispatchResupplyForAlert = (
    id: string
  ) => {
    if (
      !hasRole(
        'Admin',
        'Logistics'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Logistics personnel can dispatch resupply.'
      );

      return;
    }

    setAlerts(
      (prev) =>
        prev.map(
          (alert) =>
            alert.id === id
              ? {
                ...alert,
                acknowledged:
                  true,
              }
              : alert
        )
    );

    addToast(
      'success',
      'Emergency Resupply Authorized',
      'Automated logistical dispatch order logged in flight queue.'
    );
  };

  // ============================================================
  // UPDATE EQUIPMENT STATUS
  // ============================================================

  const updateEquipmentStatus = (
    id: string,
    status: EquipmentItem['status']
  ) => {
    if (
      !hasRole(
        'Admin',
        'Logistics',
        'Maintenance',
        'Maintenance Supervisor'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Maintenance personnel can update equipment.'
      );

      return;
    }

    apiRequest(
      `/equipment/${encodeURIComponent(
        id
      )}`,
      {
        method: 'PATCH',

        body: JSON.stringify({
          status,
        }),
      }
    ).catch(
      (error: unknown) =>
        addToast(
          'error',
          'Equipment update failed',
          error instanceof Error
            ? error.message
            : 'Unable to update equipment in MongoDB.'
        )
    );

    setEquipment(
      (prev) =>
        prev.map(
          (equipmentItem) =>
            equipmentItem.id === id
              ? {
                ...equipmentItem,
                status,
              }
              : equipmentItem
        )
    );

    addToast(
      'info',
      'Equipment Status Updated',
      `Asset maintenance profile updated to: ${status}`
    );
  };

  // ============================================================
  // UPDATE MAINTENANCE TASK
  // ============================================================

  const updateTaskStatus = (
    id: string,
    status: MaintenanceTask['status']
  ) => {
    if (
      !hasRole(
        'Admin',
        'Maintenance',
        'Maintenance Supervisor'
      )
    ) {
      addToast(
        'warning',
        'Access Restricted',
        'Only Admin and Maintenance personnel can update work orders.'
      );

      return;
    }

    apiRequest(
      `/maintenance/${encodeURIComponent(
        id
      )}`,
      {
        method: 'PATCH',

        body: JSON.stringify({
          status,
        }),
      }
    ).catch(
      (error: unknown) =>
        addToast(
          'error',
          'Task update failed',
          error instanceof Error
            ? error.message
            : 'Unable to update task in MongoDB.'
        )
    );

    setMaintenanceTasks(
      (prev) =>
        prev.map(
          (task) =>
            task.id === id
              ? {
                ...task,
                status,
              }
              : task
        )
    );

    const updatedTask = maintenanceTasks.find(
      (task) => task.id === id
    );

    if (status === 'Completed') {
      addToast(
        'success',
        'Maintenance Completed',
        `${updatedTask?.title || 'Maintenance work order'} has been completed. Camp ${currentCamp.name} has been notified.`
      );
    } else {
      addToast(
        'success',
        'Task Updated',
        `Work order transitioned to: ${status}`
      );
    }
  };

  // ============================================================
  // CREATE MAINTENANCE WORK ORDER
  // ============================================================

  const addMaintenanceTask =
    async (
      taskData: Omit<
        MaintenanceTask,
        'id'
      >
    ) => {
      if (
        !hasRole(
          'Admin',
          'Logistics',
          'Maintenance',
          'Maintenance Supervisor'
        )
      ) {
        addToast(
          'warning',
          'Access Restricted',
          'Only authorized personnel can create work orders.'
        );

        return;
      }

      if (
        !taskData.equipmentId
      ) {
        addToast(
          'error',
          'Equipment Required',
          'Select a valid equipment asset before creating the work order.'
        );

        return;
      }

      if (
        !taskData.title?.trim()
      ) {
        addToast(
          'error',
          'Title Required',
          'Enter a title for the maintenance work order.'
        );

        return;
      }

      if (
        !/^[a-f\d]{24}$/i.test(
          String(
            taskData.equipmentId
          )
        )
      ) {
        addToast(
          'error',
          'Invalid Equipment',
          'The selected equipment does not have a valid MongoDB ID. Please select the equipment again.'
        );

        return;
      }

      try {
        const saved =
          await apiRequest<
            Record<
              string,
              unknown
            >
          >(
            '/maintenance',
            {
              method: 'POST',

              body: JSON.stringify({
                ...taskData,

                campId:
                  currentCamp.id,

                equipmentId:
                  String(
                    taskData.equipmentId
                  ),
              }),
            }
          );

        const newTask:
          MaintenanceTask = {
          ...taskData,

          id: String(
            saved._id
          ),

          campId: String(
            saved.campId
          ),

          equipmentId: String(
            saved.equipmentId
          ),

          dueDate:
            saved.dueDate
              ? String(
                saved.dueDate
              )
              : taskData.dueDate,
        };

        setMaintenanceTasks(
          (prev) => [
            newTask,
            ...prev,
          ]
        );

        addToast(
          'success',
          'Work Order Logged',
          `Task assigned to ${taskData.assignedTo || 'Maintenance Team'}.`
        );
      } catch (error) {
        addToast(
          'error',
          'Task save failed',
          error instanceof Error
            ? error.message
            : 'Unable to save task to MongoDB.'
        );
      }
    };

  // ============================================================
  // SUPPLY REQUEST
  // ============================================================

const submitSupplyRequest = async (
  requestData: Omit<
    SupplyRequest,
    | 'id'
    | 'status'
    | 'createdAt'
    | 'requestedBy'
    | 'campId'
    | 'campName'
    | 'auditLog'
  >
) => {
  if (!hasRole('Logistics')) {
    addToast(
      'warning',
      'Access Restricted',
      'Only camp-side Logistics personnel can submit supply requests.'
    );

    return;
  }

  // ============================================================
  // 1. FIND THE REAL RESOURCE FIRST
  // ============================================================

  const matchingResource =
    currentCampResources.find(
      (resource) =>
        normalizeResourceName(resource.name) ===
        normalizeResourceName(
          requestData.resourceName
        ) &&
        resource.category ===
          requestData.category
    );

  // ============================================================
  // 2. STOP IMMEDIATELY IF RESOURCE DOES NOT EXIST
  // ============================================================

  if (!matchingResource) {
    addToast(
      'error',
      'Request Not Saved',
      `The resource "${requestData.resourceName}" does not exist in ${currentCamp.name}. Select an existing camp resource.`
    );

    return;
  }

  // ============================================================
  // 3. VALIDATE QUANTITY
  // ============================================================

  if (
    requestData.quantity <= 0
  ) {
    addToast(
      'error',
      'Invalid Quantity',
      'Request quantity must be greater than zero.'
    );

    return;
  }

  // ============================================================
  // 4. USE THE ACTUAL RESOURCE DATA
  // ============================================================

  const createdAt =
    new Date()
      .toISOString()
      .slice(0, 16)
      .replace('T', ' ');

  const newRequest:
    SupplyRequest = {
    ...requestData,

    // Always use the actual inventory resource name.
    resourceName:
      matchingResource.name,

    // Always use the actual inventory category.
    category:
      matchingResource.category,

    // Use actual inventory unit.
    unit:
      matchingResource.unit,

    id:
      `req-${Date.now()}`,

    campId:
      currentCamp.id,

    campName:
      currentCamp.name,

    status:
      'Submitted',

    requestedBy:
      currentUser?.name ||
      'Camp Logistics Cell',

    createdAt,

    auditLog: [
      {
        action:
          'Submitted',

        actor:
          currentUser?.name ||
          'Camp Logistics Cell',

        timestamp:
          createdAt,
      },
    ],
  };

  // ============================================================
  // 5. SAVE TO MONGODB FIRST
  // ============================================================

  try {
    const savedRequest =
      await apiRequest<
        Record<string, unknown>
      >(
        '/requests',
        {
          method: 'POST',

          body: JSON.stringify({
            resourceId:
              matchingResource.id,

            quantity:
              requestData.quantity,

            unit:
              matchingResource.unit,

            urgency:
              requestData.urgency,

            reason:
              requestData.reason,
          }),
        }
      );

    // ==========================================================
    // 6. USE MONGODB ID
    // ==========================================================

    const mongoRequestId =
      String(
        savedRequest._id ||
          newRequest.id
      );

    const persistedRequest:
      SupplyRequest = {
      ...newRequest,

      id:
        mongoRequestId,
    };

    // ==========================================================
    // 7. ONLY NOW UPDATE FRONTEND STATE
    // ==========================================================

    setSupplyRequests(
      (prev) => [
        persistedRequest,
        ...prev,
      ]
    );

    // ==========================================================
    // 8. CREATE HQ NOTIFICATION
    // ==========================================================

    const alertCategory:
      AlertItem['category'] =
      matchingResource.category;

    const alertSeverity:
      AlertItem['severity'] =
      requestData.urgency ===
        'Critical'
        ? 'High'
        : requestData.urgency ===
          'Urgent'
          ? 'Medium'
          : 'Low';

    const adminAlert:
      AlertItem = {
      id:
        `alert-${mongoRequestId}`,

      title:
        'New Camp Requirement Submitted',

      description:
        `${currentCamp.name} requested ${requestData.quantity.toLocaleString()} ${matchingResource.unit} of ${matchingResource.name}. Reason: ${requestData.reason}`,

      category:
        alertCategory,

      severity:
        alertSeverity,

      campId:
        currentCamp.id,

      campName:
        currentCamp.name,

      timestamp:
        'Just now',

      acknowledged:
        false,

      actionRequired:
        'Review and approve or reject the requirement from the HQ Supply Requests queue.',
    };

    setAlerts(
      (prev) => [
        adminAlert,
        ...prev,
      ]
    );

    // ==========================================================
    // 9. CAMP PENDING REQUEST
    // ==========================================================

    const pendingRequest:
      PendingCampRequest = {
      id:
        mongoRequestId,

      campId:
        currentCamp.id,

      campName:
        currentCamp.name,

      requestedBy:
        newRequest.requestedBy,

      resourceName:
        matchingResource.name,

      quantity:
        requestData.quantity,

      unit:
        matchingResource.unit,

      urgency:
        requestData.urgency,

      reason:
        requestData.reason,
    };

    setPendingCampRequests(
      (prev) => [
        pendingRequest,
        ...prev,
      ]
    );

    // ==========================================================
    // 10. SUCCESS
    // ==========================================================

    addToast(
      'success',
      'Requirement Submitted',
      `${matchingResource.name} request sent from ${currentCamp.name}.`
    );

    addToast(
      'info',
      'HQ Notification',
      `New requirement sent to HQ for review. ${currentCamp.name} is awaiting approval.`
    );

  } catch (error) {

    addToast(
      'error',
      'Request Save Failed',
      error instanceof Error
        ? error.message
        : 'Unable to save request to MongoDB.'
    );

  }
};

  // ============================================================
  // CLEAR PENDING REQUEST
  // ============================================================

  const clearPendingCampRequest = (
    id: string
  ) => {
    setPendingCampRequests(
      (prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
    );
  };

  // ============================================================
  // UPDATE SUPPLY REQUEST STATUS
  // ============================================================

const updateSupplyRequestStatus = async (
  id: string,
  status: SupplyRequestStatus,
  details: {
    reason?: string;
    carrier?: string;
    eta?: string;
  } = {}
) => {
  const canProcessAsAdmin =
    hasRole('Admin');

  const request =
    supplyRequests.find(
      (item) => item.id === id
    );

  if (!request) {
    addToast(
      'error',
      'Request Not Found',
      'The selected supply request no longer exists in the queue.'
    );

    return;
  }

  // ============================================================
  // VALIDATE STATUS TRANSITION
  // ============================================================

  const validAdminTransition =
    canProcessAsAdmin &&
    (
      (request.status === 'Submitted' &&
        (status === 'Approved' ||
          status === 'Rejected')) ||

      (request.status === 'Approved' &&
        (status === 'In Transit' ||
          status === 'Rejected'))
    );

  const canConfirmAsCamp =
    hasRole('Logistics') &&
    request.campId ===
      currentCamp.id &&
    request.status === 'In Transit' &&
    status === 'Received';

  if (
    !validAdminTransition &&
    !canConfirmAsCamp
  ) {
    // If the requested status is already the current
    // status, do nothing. This prevents duplicate clicks
    // from showing a false error.
    if (
      request.status === status
    ) {
      return;
    }

    addToast(
      'warning',
      'Invalid Status Transition',
      `${request.status} cannot be changed to ${status}.`
    );

    return;
  }

  // ============================================================
  // ACTOR + TIMESTAMP
  // ============================================================

  const actor =
    currentUser?.name ||
    'Central Logistics';

  const timestamp =
    new Date()
      .toISOString()
      .slice(0, 16)
      .replace('T', ' ');

  // ============================================================
  // SAVE STATUS TO MONGODB FIRST
  // ============================================================

  try {
    const savedRequest =
      await apiRequest<
        Record<string, unknown>
      >(
        `/requests/${encodeURIComponent(
          id
        )}/status`,
        {
          method: 'PATCH',

          body: JSON.stringify({
            status,

            carrier:
              details.carrier,

            eta:
              details.eta,

            rejectionReason:
              details.reason,
          }),
        }
      );

    // ==========================================================
    // DISPATCH
    //
    // There is NO separate HQ inventory.
    // Dispatch only changes:
    //
    // Approved → In Transit
    //
    // Stock is added only when the camp confirms receipt.
    // ==========================================================

    let dispatchedSourceResourceId:
      string | undefined;

    if (
      status === 'In Transit' &&
      canProcessAsAdmin
    ) {
      dispatchedSourceResourceId =
        request.sourceResourceId;
    }

    // ==========================================================
    // RECEIVED
    //
    // Add the requested quantity to the camp resource
    // only after the camp confirms physical receipt.
    // ==========================================================

    if (
      status === 'Received' &&
      canConfirmAsCamp
    ) {
      const destination =
        resources.find(
          (item) =>
            item.campId ===
              request.campId &&
            item.category ===
              request.category &&
            normalizeResourceName(
              item.name
            ) ===
              normalizeResourceName(
                request.resourceName
              )
        );

      if (destination) {
        const newStock =
          Math.min(
            destination.maxCapacity,
            destination.currentStock +
              request.quantity
          );

        const newStatus =
          calculateStatus(
            newStock,
            destination.minLevel,
            destination.maxCapacity
          );

        const newEstDays =
          calculateEstDays(
            newStock,
            destination.burnRatePerPersonPerDay,
            getCampPersonnel(
              destination.campId
            )
          );

        // Update MongoDB resource
        await apiRequest(
          `/resources/${encodeURIComponent(
            destination.id
          )}`,
          {
            method: 'PATCH',

            body: JSON.stringify({
              currentStock:
                newStock,
            }),
          }
        );

        // Update frontend resource
        setResources(
          (prev) =>
            prev.map(
              (item) =>
                item.id ===
                destination.id
                  ? {
                      ...item,

                      currentStock:
                        newStock,

                      status:
                        newStatus,

                      estDays:
                        newEstDays,

                      lastRestocked:
                        timestamp,
                    }
                  : item
            )
        );
      }
    }

    // ==========================================================
    // UPDATE LOCAL REQUEST STATE
    // ONLY AFTER MONGODB SUCCESS
    // ==========================================================

    const auditEntry:
      SupplyRequestAuditEntry = {
      action:
        status,

      actor,

      timestamp,

      note:
        details.reason ||
        details.carrier,
    };

    setSupplyRequests(
      (prev) =>
        prev.map(
          (requestItem) =>
            requestItem.id === id
              ? {
                  ...requestItem,

                  // Prefer the server's status when available.
                  status:
                    (savedRequest.status as SupplyRequestStatus) ||
                    status,

                  reviewedBy:
                    actor,

                  rejectionReason:
                    details.reason ||
                    requestItem.rejectionReason,

                  carrier:
                    details.carrier ||
                    requestItem.carrier,

                  eta:
                    details.eta ||
                    requestItem.eta,

                  sourceCampId:
                    status === 'In Transit'
                      ? currentUser?.campId ||
                        requestItem.sourceCampId
                      : requestItem.sourceCampId,

                  sourceResourceId:
                    status === 'In Transit'
                      ? dispatchedSourceResourceId ||
                        requestItem.sourceResourceId
                      : requestItem.sourceResourceId,

                  receivedAt:
                    status === 'Received'
                      ? timestamp
                      : requestItem.receivedAt,

                  auditLog: [
                    ...(requestItem.auditLog ||
                      []),

                    auditEntry,
                  ],
                }
              : requestItem
        )
    );

    // ==========================================================
    // CLEAR PENDING REQUEST
    // ==========================================================

    if (
      status === 'Approved' ||
      status === 'Rejected' ||
      status === 'Received'
    ) {
      clearPendingCampRequest(
        id
      );
    }

    // ==========================================================
    // SUCCESS MESSAGE
    // ==========================================================

    if (status === 'In Transit') {
      addToast(
        'success',
        'Dispatch Confirmed',
        `${request.resourceName} request has been dispatched and is now in transit.`
      );
    } else if (
      status === 'Received'
    ) {
      addToast(
        'success',
        'Supply Received',
        `${request.quantity.toLocaleString()} ${request.unit} of ${request.resourceName} has been added to ${currentCamp.name} inventory.`
      );
    } else {
      addToast(
        'success',
        `Request ${status}`,
        `Supply request marked as ${status.toLowerCase()}.`
      );
    }

  } catch (error) {

    addToast(
      'error',
      'Request Update Failed',
      error instanceof Error
        ? error.message
        : 'Unable to update the supply request in MongoDB.'
    );
  }
};

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,

        currentView,

        setCurrentView:
          setAuthorizedView,

        canAccessView,

        selectedCampId,
        setSelectedCampId,

        currentUser,
        setCurrentUser,

        backendAvailable,
        retryBackendConnection,

        isAuthenticated:
          !!currentUser,

        login,
        logout,

        createCampProfile,
        deleteCampProfile,

        resetAllData,

        camps,
        currentCamp,

        resources,
        currentCampResources,

        addResource,
        updateResource,
        deleteResource,
        restockResource,
        transferResource,

        consumptionHistory,

        recordConsumption,

        isRecordConsumptionModalOpen,
        setIsRecordConsumptionModalOpen,

        alerts,

        acknowledgeAlert,
        dispatchResupplyForAlert,

        equipment,

        addEquipment,
        updateEquipmentStatus,

        isAddEquipmentModalOpen,
        setIsAddEquipmentModalOpen,

        maintenanceTasks,

        updateTaskStatus,
        addMaintenanceTask,

        supplyRequests,

        submitSupplyRequest,
        updateSupplyRequestStatus,

        isAddResourceModalOpen,
        setIsAddResourceModalOpen,

        isQuickRestockModalOpen,
        setIsQuickRestockModalOpen,

        activeRestockResource,
        setActiveRestockResource,

        isHelpModalOpen,
        setIsHelpModalOpen,

        isAppsDrawerOpen,
        setIsAppsDrawerOpen,

        isDispatchModalOpen,
        setIsDispatchModalOpen,

        pendingCampRequests,
        setPendingCampRequests,

        clearPendingCampRequest,

        toasts,

        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context =
    useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within an AppProvider'
    );
  }

  return context;
};