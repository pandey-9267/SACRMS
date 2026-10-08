import { UserProfile } from '../types';
import { ActiveView } from './contextTypes';

export const roleViews: Record<
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
