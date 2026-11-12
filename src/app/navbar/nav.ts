import { Role } from '../models/models';

export interface NavItem { label: string; path: string; description: string; }

const parentItems: NavItem[] = [
  { label: 'My students', path: '/parent/students', description: 'Add your children, see their bookings and results.' },
  { label: 'Book assessment', path: '/parent/book', description: 'Choose an available slot for your child.' },
  { label: 'My details', path: '/parent/profile', description: 'Update your name and phone number.' }
];

const staffItems: NavItem[] = [
  { label: 'Check-in', path: '/staff/checkin', description: 'Look up a booking number and mark the child as arrived.' },
  { label: 'Bookings', path: '/staff/bookings', description: 'View, move or cancel bookings.' },
  { label: 'Slots', path: '/staff/slots', description: 'Create and manage assessment slots.' },
  { label: 'Students', path: '/staff/students', description: 'Search for students.' },
  { label: 'Marks', path: '/staff/marks', description: 'Enter marks, then finalise and send results.' },
  { label: 'Emails', path: '/staff/emails', description: 'See emails that failed and send them again.' },
  { label: 'My password', path: '/staff/password', description: 'Change your own password.' }
];

const adminItems: NavItem[] = [
  { label: 'Pass minimums', path: '/admin/criteria', description: 'Set the minimum mark for each subject.' },
  { label: 'Staff accounts', path: '/admin/staff', description: 'Create and manage staff accounts.' }
];

export function navFor(role: Role | null): NavItem[] {
  switch (role) {
    case 'Parent': return parentItems;
    case 'Clerk': return staffItems;
    case 'Admin': return [...staffItems, ...adminItems];
    default: return [];
  }
}