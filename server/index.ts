import 'dotenv/config';
import express, { Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { connectDatabase } from './config/db';

import {
  AuditLog,
  Camp,
  Consumption,
  Equipment,
  MaintenanceTask,
  Resource,
  SupplyRequest,
  User,
} from './models/models';

import {
  AuthRequest,
  requireAuth,
  requireRole,
} from './middleware/auth';

const app = express();

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/camps',
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname);
      const filename = `camp-${Date.now()}${extension}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
  },
});

const port = Number(
  process.env.PORT || 4000
);

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN ||
      'http://localhost:3000',
  }),
);

app.use(express.json());

app.use(
  '/uploads',
  express.static(
    path.resolve('uploads'),
  ),
);

// ============================================================
// HELPERS
// ============================================================

function deleteCampImage(profileImage?: string | null) {
  if (!profileImage) {
    return;
  }

  let imagePath = profileImage;

  // If the database contains a full URL such as:
  // https://sacrms.onrender.com/uploads/camps/camp-123.jpeg
  // extract only the pathname.
  if (/^https?:\/\//i.test(profileImage)) {
    try {
      imagePath = new URL(profileImage).pathname;
    } catch {
      return;
    }
  }

  // Only delete images uploaded by SACRMS.
  // Do NOT delete external generated avatars such as ui-avatars.com.
  if (!imagePath.startsWith('/uploads/camps/')) {
    return;
  }

  const fileName = path.basename(imagePath);

  const filePath = path.resolve(
    process.cwd(),
    'uploads',
    'camps',
    fileName,
  );

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);

      console.log(
        `Deleted camp image: ${fileName}`,
      );
    }
  } catch (error) {
    console.error(
      `Failed to delete camp image: ${fileName}`,
      error,
    );
  }
}

function idIsValid(
  value: unknown,
): value is string {
  return (
    typeof value === 'string' &&
    isValidObjectId(value)
  );
}

function generateCampAvatar(
  name: string,
  code: string,
): string {
  const cleanName = String(name).trim();
  const cleanCode = String(code).trim();

  const initials =
    cleanName
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    cleanCode.slice(0, 2).toUpperCase() ||
    'CP';

  // Include the unique camp code so different camps
  // get different generated avatars.
  const avatarName = `${initials} ${cleanCode}`;

  const label = encodeURIComponent(avatarName);

  return `https://ui-avatars.com/api/?name=${label}&size=256&background=0f172a&color=ffffff&bold=true`;
}

// ============================================================
// CREATE STARTER RESOURCES
// ============================================================

async function createStarterResources(
  camp: {
    _id: unknown;
    code: string;
  },
) {
  const resourceCode = String(camp.code)
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();

  await Resource.insertMany([
    {
      campId: camp._id,
      name: '5.56MM Ammunition',
      sku: `AMM-${resourceCode}`,
      category: 'Ammunition',
      currentStock: 12000,
      unit: 'Rounds',
      minLevel: 3000,
      maxCapacity: 20000,
      burnRatePerPersonPerDay: 0.8,
      location: 'Storage Bay Sector-A',
    },

    {
      campId: camp._id,
      name: 'Diesel Fuel',
      sku: `FUL-${resourceCode}`,
      category: 'Fuel',
      currentStock: 6000,
      unit: 'L',
      minLevel: 2500,
      maxCapacity: 20000,
      burnRatePerPersonPerDay: 2.5,
      location: 'Fuel Storage Bay',
    },

    {
      campId: camp._id,
      name: 'Field Tents',
      sku: `SUP-${resourceCode}`,
      category: 'Supplies',
      currentStock: 120,
      unit: 'Units',
      minLevel: 30,
      maxCapacity: 200,
      burnRatePerPersonPerDay: 0.005,
      location: 'Storage Bay Sector-A',
    },

    {
      campId: camp._id,
      name: 'Medical Kits',
      sku: `MED-${resourceCode}`,
      category: 'Medicine',
      currentStock: 300,
      unit: 'Units',
      minLevel: 75,
      maxCapacity: 1000,
      burnRatePerPersonPerDay: 0.02,
      location: 'Medical Store',
    },

    {
      campId: camp._id,
      name: 'Potable Water',
      sku: `WTR-${resourceCode}`,
      category: 'Water',
      currentStock: 12000,
      unit: 'L',
      minLevel: 4000,
      maxCapacity: 25000,
      burnRatePerPersonPerDay: 4,
      location: 'Storage Bay Sector-A',
    },

    {
      campId: camp._id,
      name: 'Rations (MREs)',
      sku: `FOD-${resourceCode}`,
      category: 'Food',
      currentStock: 3600,
      unit: 'Boxes',
      minLevel: 1000,
      maxCapacity: 5000,
      burnRatePerPersonPerDay: 1,
      location: 'Quartermaster Store',
    },
  ]);
}

// ============================================================
// AUDIT
// ============================================================

async function audit(
  req: AuthRequest,
  action: string,
  entityType: string,
  entityId: string,
  details?: unknown,
) {
  if (req.user) {
    await AuditLog.create({
      actorId: req.user.id,
      action,
      entityType,
      entityId,
      details,
    });
  }
}

// ============================================================
// HEALTH
// ============================================================

app.get(
  '/api/health',
  (_req, res) => {
    return res.json({
      status: 'ok',
      service: 'SACRMS API',
    });
  },
);

// ============================================================
// AUTH
// ============================================================

app.post(
  '/api/auth/login',
  async (req, res) => {
    const {
      email,
      password,
    } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required',
      });
    }

    const user =
      await User.findOne({
        email: email
          .toLowerCase()
          .trim(),
      });

    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.passwordHash,
      ))
    ) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      {
        id: String(user._id),
      },
      process.env.JWT_SECRET ||
      'development-secret',
      {
        expiresIn: '8h',
      },
    );

    return res.json({
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campId: user.campId,
        rank: user.rank,
        serviceId: user.serviceId,
        avatarUrl: '/assets/phot.jpeg',
        accessScope: 'Headquarters',
      },
    });
  },
);

// ============================================================
// CAMPS
// ============================================================

app.post(
  '/api/camps',
  requireAuth,
  requireRole('Admin'),
  upload.single('profileImage'),
  async (
    req: AuthRequest,
    res,
  ) => {
    const {
      name,
      type,
      code,
      personnel,
      location,
      commander,
      weather,
      temperature,
    } = req.body;

    // FormData sends leader as a JSON string.
    // Convert it back into an object.
    let leader;

    try {
      leader =
        typeof req.body.leader === 'string'
          ? JSON.parse(req.body.leader)
          : req.body.leader;
    } catch {
      return res.status(400).json({
        message: 'Invalid leader details.',
      });
    }

    // Uploaded image, if Admin selected one.
    const uploadedProfileImage = req.file
      ? `/uploads/camps/${req.file.filename}`
      : null;

    // Validate camp + leader details.
    if (
      !name ||
      !type ||
      !code ||
      !location ||
      !commander ||
      !leader?.name ||
      !leader?.email ||
      !leader?.rank
    ) {
      return res.status(400).json({
        message: 'Camp and leader details are required',
      });
    }

    // Create camp.
    // If an image was uploaded, use it.
    // Otherwise generate a unique camp avatar.
    const camp =
      await Camp.create({
        name,
        type,
        code,
        personnel: Number(
          personnel || 0,
        ),
        location,
        commander,
        weather:
          weather || 'Clear',
        temperature:
          temperature || 'N/A',

        profileImage:
          uploadedProfileImage ||
          generateCampAvatar(
            name,
            code,
          ),
      });

    // Create starter resources for the new camp.
    await createStarterResources(
      camp,
    );

    // Generate temporary password.
    const passwordCampName =
      String(name)
        .trim()
        .replace(
          /[^a-z0-9]+/gi,
          '_',
        )
        .replace(
          /^_+|_+$/g,
          '',
        )
        .toUpperCase();

    const temporaryPassword =
      `SACRMS_${passwordCampName}`;

    // Create Camp Logistics user.
    const user =
      await User.create({
        name: leader.name,

        email:
          leader.email
            .toLowerCase(),

        passwordHash:
          await bcrypt.hash(
            temporaryPassword,
            12,
          ),

        role: 'Logistics',

        campId:
          camp._id,

        rank:
          leader.rank,

        serviceId:
          `SVC-${String(
            code,
          ).toUpperCase()}`,
      });

    // Audit camp creation.
    await audit(
      req,
      'CREATE_CAMP',
      'Camp',
      String(camp._id),
      {
        leaderId: user._id,
      },
    );

    // Send created camp + credentials back to frontend.
    return res.status(201).json({
      camp,

      leader: {
        id: user._id,
        name: user.name,
        email: user.email,
        serviceId:
          user.serviceId,
      },

      temporaryPassword,
    });
  },
);

app.get(
  '/api/camps',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const filter =
      req.user?.role === 'Admin'
        ? {}
        : {
          _id: req.user?.campId,
        };

    return res.json(
      await Camp.find(filter).sort({
        name: 1,
      }),
    );
  },
);

app.patch('/api/camps/:id/settings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const campId = req.params.id;

    const {
      warningThreshold,
      criticalThreshold,
      autoAlerts,
      audioPings,
    } = req.body;

    // Validate threshold values
    if (
      typeof warningThreshold !== 'number' ||
      typeof criticalThreshold !== 'number' ||
      warningThreshold < 0 ||
      warningThreshold > 100 ||
      criticalThreshold < 0 ||
      criticalThreshold > 100
    ) {
      return res.status(400).json({
        message: 'Threshold values must be between 0 and 100.',
      });
    }

    // Critical must be lower than Warning
    if (criticalThreshold >= warningThreshold) {
      return res.status(400).json({
        message: 'Critical threshold must be lower than warning threshold.',
      });
    }

    // Only Admin can modify any camp.
    // Logistics can modify only their own camp.
    if (
      req.user?.role !== 'Admin' &&
      !(
        req.user?.role === 'Logistics' &&
        req.user?.campId === campId
      )
    ) {
      return res.status(403).json({
        message: 'You are not allowed to modify this camp settings.',
      });
    }

    const camp = await Camp.findByIdAndUpdate(
      campId,
      {
        warningThreshold,
        criticalThreshold,
        autoAlerts: Boolean(autoAlerts),
        audioPings: Boolean(audioPings),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!camp) {
      return res.status(404).json({
        message: 'Camp not found.',
      });
    }

    // Record the change
    if (req.user?.id) {
      await AuditLog.create({
        actorId: req.user.id,
        action: 'UPDATE_CAMP_SETTINGS',
        entityType: 'Camp',
        entityId: camp._id,
        details: {
          warningThreshold: camp.warningThreshold,
          criticalThreshold: camp.criticalThreshold,
          autoAlerts: camp.autoAlerts,
          audioPings: camp.audioPings,
        },
      });
    }

    res.json({
      message: 'Camp settings updated successfully.',
      camp,
    });
  } catch (error) {
    console.error('UPDATE CAMP SETTINGS ERROR:', error);

    res.status(500).json({
      message: 'Failed to update camp settings.',
    });
  }
});

app.delete(
  '/api/camps/:id',
  requireAuth,
  requireRole('Admin'),
  async (
    req: AuthRequest,
    res,
  ) => {
    const { id } = req.params;

    // ----------------------------------------------------------
    // VALIDATE CAMP ID
    // ----------------------------------------------------------

    if (!idIsValid(id)) {
      return res.status(400).json({
        message: 'Invalid camp ID',
      });
    }

    // ----------------------------------------------------------
    // FIND CAMP FIRST
    // ----------------------------------------------------------
    // We must find the camp before deleting it because we need
    // its profileImage path.

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({
        message: 'Camp not found',
      });
    }

    // Save the image path before deleting the camp.
    const profileImage = camp.profileImage;

    // ----------------------------------------------------------
    // DELETE RELATED DATA
    // ----------------------------------------------------------

    await Promise.all([
      User.deleteMany({
        campId: id,
      }),

      Resource.deleteMany({
        campId: id,
      }),

      Consumption.deleteMany({
        campId: id,
      }),

      Equipment.deleteMany({
        campId: id,
      }),

      MaintenanceTask.deleteMany({
        campId: id,
      }),

      SupplyRequest.deleteMany({
        campId: id,
      }),
    ]);

    // ----------------------------------------------------------
    // DELETE CAMP
    // ----------------------------------------------------------

    await Camp.findByIdAndDelete(id);

    // ----------------------------------------------------------
    // DELETE UPLOADED CAMP IMAGE
    // ----------------------------------------------------------
    // Only local SACRMS uploaded images are deleted.
    // Generated ui-avatars images are external and are ignored.

    deleteCampImage(profileImage);

    // ----------------------------------------------------------
    // AUDIT
    // ----------------------------------------------------------

    await audit(
      req,
      'DELETE_CAMP',
      'Camp',
      id,
      {
        deletedProfileImage:
          profileImage || null,
      },
    );

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    return res.json({
      success: true,
      message:
        'Camp, related records, and uploaded image deleted successfully',
    });
  },
);

// ============================================================
// RESOURCES
// ============================================================

app.get(
  '/api/resources',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const campId =
      req.user?.role === 'Admin'
        ? String(
          req.query.campId || '',
        )
        : req.user?.campId;

    if (
      !campId ||
      !idIsValid(campId)
    ) {
      return res.status(400).json({
        message:
          'A valid campId is required',
      });
    }

    const camp =
      await Camp.findById(
        campId,
      ).select('_id code');

    if (!camp) {
      return res.status(404).json({
        message: 'Camp not found',
      });
    }

    if (
      (await Resource.countDocuments({
        campId,
      })) === 0
    ) {
      await createStarterResources(
        camp,
      );
    }

    return res.json(
      await Resource.find({
        campId,
      }).sort({
        name: 1,
      }),
    );
  },
);

app.post(
  '/api/resources',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const {
      campId,
      name,
      sku,
      category,
      currentStock,
      unit,
      minLevel,
      maxCapacity,
      burnRatePerPersonPerDay,
      location,
    } = req.body;

    const targetCampId =
      req.user?.role === 'Admin'
        ? campId
        : req.user?.campId;

    if (
      !idIsValid(
        targetCampId,
      ) ||
      !name ||
      !sku ||
      !category ||
      !unit ||
      !location
    ) {
      return res.status(400).json({
        message:
          'Valid resource details are required',
      });
    }

    const resource =
      await Resource.create({
        campId: targetCampId,
        name,
        sku,
        category,
        currentStock: Number(
          currentStock || 0,
        ),
        unit,
        minLevel: Number(
          minLevel || 0,
        ),
        maxCapacity: Number(
          maxCapacity || 0,
        ),
        burnRatePerPersonPerDay:
          Number(
            burnRatePerPersonPerDay ||
            0,
          ),
        location,
      });

    await audit(
      req,
      'CREATE_RESOURCE',
      'Resource',
      String(resource._id),
      {
        campId: targetCampId,
      },
    );

    return res.status(201).json(
      resource,
    );
  },
);

app.patch(
  '/api/resources/:id',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const { id } =
      req.params;

    if (!idIsValid(id)) {
      return res.status(400).json({
        message:
          'Invalid resource ID',
      });
    }

    const resource =
      await Resource.findById(id);

    if (
      !resource ||
      (
        req.user?.role !==
        'Admin' &&
        String(
          resource.campId,
        ) !== req.user?.campId
      )
    ) {
      return res.status(404).json({
        message:
          'Resource not found',
      });
    }

    Object.assign(
      resource,
      req.body,
    );

    await resource.save();

    await audit(
      req,
      'UPDATE_RESOURCE',
      'Resource',
      id,
      req.body,
    );

    return res.json(
      resource,
    );
  },
);

app.delete(
  '/api/resources/:id',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const { id } =
      req.params;

    if (!idIsValid(id)) {
      return res.status(400).json({
        message:
          'Invalid resource ID',
      });
    }

    const resource =
      await Resource.findById(id);

    if (
      !resource ||
      (
        req.user?.role !==
        'Admin' &&
        String(
          resource.campId,
        ) !== req.user?.campId
      )
    ) {
      return res.status(404).json({
        message:
          'Resource not found',
      });
    }

    await resource.deleteOne();

    await audit(
      req,
      'DELETE_RESOURCE',
      'Resource',
      id,
    );

    return res.json({
      message:
        'Resource deleted',
    });
  },
);

// ============================================================
// CONSUMPTION
// ============================================================

app.get(
  '/api/consumption',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const campId =
      req.user?.role === 'Admin'
        ? String(
          req.query.campId || '',
        )
        : req.user?.campId;

    if (
      !campId ||
      !idIsValid(campId)
    ) {
      return res.status(400).json({
        message:
          'A valid campId is required',
      });
    }

    return res.json(
      await Consumption.find({
        campId,
      }).sort({
        date: -1,
        createdAt: -1,
      }),
    );
  },
);

app.post(
  '/api/consumption',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const {
      campId,
      resourceName,
      category,
      date,
      quantity,
      headcount,
      purpose,
      unit,
    } = req.body;

    const targetCampId =
      req.user?.role === 'Admin'
        ? campId
        : req.user?.campId;

    if (
      !idIsValid(
        targetCampId,
      ) ||
      !resourceName ||
      !category ||
      !date ||
      !unit ||
      !purpose ||
      Number(quantity) < 0 ||
      Number(headcount) < 0
    ) {
      return res.status(400).json({
        message:
          'Valid consumption details are required',
      });
    }

    const record =
      await Consumption.create({
        campId: targetCampId,
        resourceName,
        category,
        date,
        quantity: Number(
          quantity,
        ),
        headcount: Number(
          headcount,
        ),
        purpose,
        unit,
        recordedBy:
          req.user?.id,
      });

    await audit(
      req,
      'RECORD_CONSUMPTION',
      'Consumption',
      String(record._id),
      {
        campId:
          targetCampId,
        quantity,
      },
    );

    return res.status(201).json(
      record,
    );
  },
);

// ============================================================
// SUPPLY REQUESTS
// ============================================================

// CAMP SUBMITS REQUEST

app.post(
  '/api/requests',
  requireAuth,
  requireRole('Logistics'),
  async (
    req: AuthRequest,
    res,
  ) => {
    const {
      resourceId,
      quantity,
      unit,
      urgency,
      reason,
    } = req.body;

    if (
      !idIsValid(resourceId) ||
      !Number.isInteger(
        quantity,
      ) ||
      quantity < 1 ||
      !unit ||
      !urgency ||
      !reason
    ) {
      return res.status(400).json({
        message:
          'Valid resource, quantity, unit, urgency, and reason are required',
      });
    }

    const resource =
      await Resource.findOne({
        _id: resourceId,
        campId:
          req.user?.campId,
      });

    if (!resource) {
      return res.status(404).json({
        message:
          'Resource is not available in your assigned camp',
      });
    }

    const request =
      await SupplyRequest.create({
        campId:
          req.user?.campId,

        requestedBy:
          req.user?.id,

        resourceId,

        resourceName:
          resource.name,

        category:
          resource.category,

        quantity,

        unit,

        urgency,

        reason,
      });

    await audit(
      req,
      'SUBMIT_REQUEST',
      'SupplyRequest',
      String(request._id),
      {
        quantity,
        resourceId,
      },
    );

    return res.status(201).json(
      request,
    );
  },
);

// GET REQUESTS

app.get(
  '/api/requests',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const filter =
      req.user?.role === 'Admin'
        ? {}
        : {
          campId:
            req.user?.campId,
        };

    return res.json(
      await SupplyRequest.find(
        filter,
      )
        .populate(
          'campId requestedBy resourceId',
        )
        .sort({
          createdAt: -1,
        }),
    );
  },
);

// ============================================================
// UPDATE SUPPLY REQUEST STATUS
//
// WORKFLOW:
//
// SUBMITTED
//     ↓
// APPROVED
//     ↓
// IN TRANSIT
//     ↓
// RECEIVED
//     ↓
// CAMP RESOURCE STOCK UPDATED
//
// IMPORTANT:
// There is currently NO separate HQ inventory.
// Therefore Dispatch does NOT deduct from an HQ resource.
//
// Stock is added to the camp ONLY after Confirm Received.
// ============================================================

app.patch(
  '/api/requests/:id/status',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const { id } =
      req.params;

    const {
      status,
      carrier,
      eta,
      rejectionReason,
    } = req.body;

    // ----------------------------------------------------------
    // VALIDATE REQUEST ID
    // ----------------------------------------------------------

    if (!idIsValid(id)) {
      return res.status(400).json({
        message:
          'Invalid request ID',
      });
    }

    // ----------------------------------------------------------
    // FIND REQUEST
    // ----------------------------------------------------------

    const request =
      await SupplyRequest.findById(
        id,
      );

    if (!request) {
      return res.status(404).json({
        message:
          'Request not found',
      });
    }

    // ----------------------------------------------------------
    // IDENTIFY ROLE
    // ----------------------------------------------------------

    const admin =
      req.user?.role === 'Admin';

    const ownCamp =
      req.user?.role ===
      'Logistics' &&
      String(
        request.campId,
      ) === req.user?.campId;

    // ----------------------------------------------------------
    // CAMP:
    //
    // IN TRANSIT → RECEIVED
    // ----------------------------------------------------------

    const canReceive =
      ownCamp &&
      request.status ===
      'In Transit' &&
      status === 'Received';

    // ----------------------------------------------------------
    // HQ / ADMIN:
    //
    // SUBMITTED → APPROVED
    // SUBMITTED → REJECTED
    // APPROVED  → IN TRANSIT
    // ----------------------------------------------------------

    const adminTransition =
      admin &&
      (
        (
          request.status ===
          'Submitted' &&
          (
            status ===
            'Approved' ||
            status ===
            'Rejected'
          )
        )
        ||
        (
          request.status ===
          'Approved' &&
          status ===
          'In Transit'
        )
      );

    // ----------------------------------------------------------
    // BLOCK INVALID TRANSITIONS
    // ----------------------------------------------------------

    if (
      !canReceive &&
      !adminTransition
    ) {
      return res.status(403).json({
        message:
          'This status transition is not allowed',
      });
    }

    // ==========================================================
    // APPROVED → IN TRANSIT
    // ==========================================================
    //
    // We intentionally DO NOT check Resource stock here.
    //
    // Why?
    //
    // Your current SACRMS database contains CAMP resources.
    // It does not yet contain a separate CENTRAL/HQ warehouse.
    //
    // Therefore HQ Dispatch simply authorizes the shipment.
    //
    // ==========================================================

    if (
      status === 'In Transit'
    ) {
      request.carrier =
        carrier ||
        'Central Logistics';

      request.eta =
        eta ||
        'Pending';

      await audit(
        req,
        'REQUEST_DISPATCHED',
        'SupplyRequest',
        id,
        {
          resource:
            request.resourceName,

          quantity:
            request.quantity,

          unit:
            request.unit,

          campId:
            request.campId,

          carrier:
            request.carrier,

          eta:
            request.eta,
        },
      );
    }

    // ==========================================================
    // IN TRANSIT → RECEIVED
    // ==========================================================
    //
    // ONLY HERE DO WE ADD STOCK.
    //
    // Example:
    //
    // Existing MRE stock = 920
    // Request             = 2500
    //
    // New stock           = 3420
    //
    // ==========================================================

    if (
      status === 'Received'
    ) {
      const destination =
        await Resource.findOne({
          campId:
            request.campId,

          _id:
            request.resourceId,

          name:
            request.resourceName,
        });

      // --------------------------------------------------------
      // DESTINATION RESOURCE MUST EXIST
      // --------------------------------------------------------

      if (!destination) {
        return res.status(409).json({
          message:
            'Destination resource no longer exists',
        });
      }

      // --------------------------------------------------------
      // CALCULATE NEW STOCK
      // --------------------------------------------------------

      const previousStock =
        Number(
          destination.currentStock ||
          0,
        );

      const requestedQuantity =
        Number(
          request.quantity || 0,
        );

      const newStock =
        Math.min(
          Number(
            destination.maxCapacity ||
            0,
          ),

          previousStock +
          requestedQuantity,
        );

      // --------------------------------------------------------
      // UPDATE RESOURCE
      // --------------------------------------------------------

      destination.currentStock =
        newStock;

      await destination.save();

      // --------------------------------------------------------
      // RECORD RECEIPT TIME
      // --------------------------------------------------------

      request.receivedAt =
        new Date();

      // --------------------------------------------------------
      // AUDIT RECEIPT
      // --------------------------------------------------------

      await audit(
        req,
        'REQUEST_RECEIVED',
        'SupplyRequest',
        id,
        {
          resource:
            request.resourceName,

          quantity:
            requestedQuantity,

          unit:
            request.unit,

          previousStock,

          newStock,

          campId:
            request.campId,
        },
      );
    }

    // ==========================================================
    // SAVE REQUEST
    // ==========================================================

    request.status =
      status;

    if (carrier) {
      request.carrier =
        carrier;
    }

    if (eta) {
      request.eta =
        eta;
    }

    if (rejectionReason) {
      request.rejectionReason =
        rejectionReason;
    }

    await request.save();

    // ==========================================================
    // GENERAL AUDIT
    // ==========================================================

    await audit(
      req,
      `REQUEST_${status
        .toUpperCase()
        .replace(
          ' ',
          '_',
        )}`,
      'SupplyRequest',
      id,
      {
        carrier,
        eta,
        rejectionReason,
      },
    );

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return res.json(
      request,
    );
  },
);

// ============================================================
// EQUIPMENT
// ============================================================

app.get(
  '/api/equipment',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const requestedCampId =
      typeof req.query.campId ===
        'string'
        ? req.query.campId
        : undefined;

    const filter =
      req.user?.role ===
        'Admin' &&
        requestedCampId
        ? {
          campId:
            requestedCampId,
        }
        : {
          campId:
            req.user?.campId,
        };

    return res.json(
      await Equipment.find(
        filter,
      ),
    );
  },
);

app.post(
  '/api/equipment',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
    'Maintenance',
    'Maintenance Supervisor',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const targetCampId =
      req.user?.role === 'Admin'
        ? req.body.campId
        : req.user?.campId;

    if (
      !idIsValid(
        targetCampId,
      ) ||
      !req.body.name ||
      !req.body.serialNumber ||
      !req.body.category
    ) {
      return res.status(400).json({
        message:
          'Valid equipment details are required',
      });
    }

    const equipment =
      await Equipment.create({
        ...req.body,
        campId:
          targetCampId,
      });

    await audit(
      req,
      'CREATE_EQUIPMENT',
      'Equipment',
      String(
        equipment._id,
      ),
    );

    return res.status(201).json(
      equipment,
    );
  },
);

app.patch(
  '/api/equipment/:id',
  requireAuth,
  requireRole(
    'Admin',
    'Maintenance',
    'Maintenance Supervisor',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const { id } =
      req.params;

    if (!idIsValid(id)) {
      return res.status(400).json({
        message:
          'Invalid equipment ID',
      });
    }

    const equipment =
      await Equipment.findById(
        id,
      );

    if (
      !equipment ||
      (
        req.user?.role !==
        'Admin' &&
        String(
          equipment.campId,
        ) !== req.user?.campId
      )
    ) {
      return res.status(404).json({
        message:
          'Equipment not found',
      });
    }

    Object.assign(
      equipment,
      req.body,
    );

    await equipment.save();

    await audit(
      req,
      'UPDATE_EQUIPMENT',
      'Equipment',
      id,
      req.body,
    );

    return res.json(
      equipment,
    );
  },
);

// ============================================================
// MAINTENANCE
// ============================================================

app.get(
  '/api/maintenance',
  requireAuth,
  async (
    req: AuthRequest,
    res,
  ) => {
    const requestedCampId =
      typeof req.query.campId ===
        'string'
        ? req.query.campId
        : undefined;

    const filter =
      req.user?.role ===
        'Admin' &&
        requestedCampId
        ? {
          campId:
            requestedCampId,
        }
        : {
          campId:
            req.user?.campId,
        };

    return res.json(
      await MaintenanceTask.find(
        filter,
      ),
    );
  },
);

app.post(
  '/api/maintenance',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
    'Maintenance',
    'Maintenance Supervisor',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const targetCampId =
      req.user?.role === 'Admin'
        ? req.body.campId
        : req.user?.campId;

    if (
      !idIsValid(
        targetCampId,
      ) ||
      !idIsValid(
        req.body.equipmentId,
      ) ||
      !req.body.title
    ) {
      return res.status(400).json({
        message:
          'Valid maintenance details are required',
      });
    }

    const task =
      await MaintenanceTask.create({
        ...req.body,
        campId:
          targetCampId,
      });

    await audit(
      req,
      'CREATE_MAINTENANCE_TASK',
      'MaintenanceTask',
      String(task._id),
    );

    return res.status(201).json(
      task,
    );
  },
);

app.patch(
  '/api/maintenance/:id',
  requireAuth,
  requireRole(
    'Admin',
    'Logistics',
    'Maintenance',
    'Maintenance Supervisor',
  ),
  async (
    req: AuthRequest,
    res,
  ) => {
    const { id } =
      req.params;

    if (!idIsValid(id)) {
      return res.status(400).json({
        message:
          'Invalid maintenance ID',
      });
    }

    const task =
      await MaintenanceTask.findById(
        id,
      );

    if (
      !task ||
      (
        req.user?.role !==
        'Admin' &&
        String(
          task.campId,
        ) !== req.user?.campId
      )
    ) {
      return res.status(404).json({
        message:
          'Maintenance task not found',
      });
    }

    Object.assign(
      task,
      req.body,
    );

    await task.save();

    await audit(
      req,
      'UPDATE_MAINTENANCE_TASK',
      'MaintenanceTask',
      id,
      req.body,
    );

    return res.json(
      task,
    );
  },
);

// =========================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(
      'SERVER ERROR:',
      error,
    );

    return res.status(500).json({
      message:
        error?.message ||
        'Internal server error',
    });
  },
);

// =======================================================
// START SERVER
// ============================================================

connectDatabase()
  .then(() =>
    app.listen(
      port,
      () =>
        console.log(
          `SACRMS API listening on http://localhost:${port}`,
        ),
    ),
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });