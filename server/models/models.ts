import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        'Admin',
        'Logistics',
        'Maintenance',
        'Maintenance Supervisor',
      ],
      required: true,
    },

    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      default: null,
    },

    rank: {
      type: String,
      required: true,
    },

    serviceId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const campSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        'Live',
        'Reserve',
        'Forward Base',
      ],
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
    },

    personnel: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
    },

    commander: {
      type: String,
      required: true,
    },

    weather: {
      type: String,
      default: 'Clear',
    },

    temperature: {
      type: String,
      default: 'N/A',
    },

    status: {
      type: String,
      enum: [
        'Optimal',
        'Warning',
        'Standby',
      ],
      default: 'Standby',
    },

    // ==========================================================
    // CAMP-SPECIFIC SETTINGS
    // ==========================================================

    warningThreshold: {
      type: Number,
      default: 45,
      min: 0,
      max: 100,
    },

    criticalThreshold: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },

    autoAlerts: {
      type: Boolean,
      default: true,
    },

    audioPings: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const resourceSchema = new Schema(
  {
    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
    },

    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
    },

    minLevel: {
      type: Number,
      required: true,
      min: 0,
    },

    maxCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    burnRatePerPersonPerDay: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const consumptionSchema = new Schema(
  {
    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },

    resourceName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    headcount: {
      type: Number,
      required: true,
      min: 0,
    },

    purpose: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const supplyRequestSchema = new Schema(
  {
    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },

    resourceName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      required: true,
    },

    urgency: {
      type: String,
      enum: [
        'Routine',
        'Urgent',
        'Critical',
      ],
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        'Submitted',
        'Approved',
        'In Transit',
        'Received',
        'Rejected',
      ],
      default: 'Submitted',
    },

    sourceResourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
      default: null,
    },

    carrier: String,

    eta: String,

    rejectionReason: String,

    receivedAt: Date,
  },
  {
    timestamps: true,
  }
);

const equipmentSchema = new Schema(
  {
    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: String,
      required: true,
    },

    model: String,

    status: {
      type: String,
      required: true,
    },

    healthScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    operatingHours: {
      type: Number,
      min: 0,
    },

    location: String,

    lastMaintenanceDate: String,

    nextServiceDate: Date,
  },
  {
    timestamps: true,
  }
);

const maintenanceSchema = new Schema(
  {
    campId: {
      type: Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },

    equipmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    assignedTo: String,

    dueDate: Date,

    description: String,
  },
  {
    timestamps: true,
  }
);

const auditLogSchema = new Schema(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      required: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    details: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

export const User = model(
  'User',
  userSchema
);

export const Camp = model(
  'Camp',
  campSchema
);

export const Resource = model(
  'Resource',
  resourceSchema
);

export const Consumption = model(
  'Consumption',
  consumptionSchema
);

export const SupplyRequest = model(
  'SupplyRequest',
  supplyRequestSchema
);

export const Equipment = model(
  'Equipment',
  equipmentSchema
);

export const MaintenanceTask = model(
  'MaintenanceTask',
  maintenanceSchema
);

export const AuditLog = model(
  'AuditLog',
  auditLogSchema
);