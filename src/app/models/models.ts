export type Role = 'Parent' | 'Admin' | 'Clerk';
export type SlotStatus = 'Open' | 'Closed' | 'Cancelled';
export type BookingStatus = 'Confirmed' | 'Cancelled' | 'Completed';
export type AssessmentOutcome = 'Pending' | 'Passed' | 'Failed';
export type EmailStatus = 'Sent' | 'Failed';
export type EmailType =
  | 'BookingConfirmation' | 'BookingUpdated' | 'BookingCancelled'
  | 'AssessmentFeedback' | 'AssessmentFeedbackCorrected';

// ---------- Auth ----------
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse {
  token: string; expiresAtUtc: string; role: Role; userId: number; displayName: string;
}
export interface RegisterParentRequest {
  firstName: string; lastName: string; email: string; phoneNumber: string; password: string;
}

// ---------- Parent and students ----------
export interface Parent {
  parentId: number; firstName: string; lastName: string; email: string; phoneNumber: string;
}
export interface Student {
  studentNo: number; firstName: string; lastName: string;
  grade: string; homeLanguage: string; parentId: number; parentName: string;
}
export interface StudentRequest {
  firstName: string; lastName: string; grade: string; homeLanguage: string;
}
export interface StudentWithBookings extends Student { bookings: Booking[]; }
export interface ParentDetails extends Parent { students: StudentWithBookings[]; }
export interface UpdateParentRequest { firstName: string; lastName: string; phoneNumber: string; }

// ---------- Slots ----------
export interface Slot {
  slotId: number; assessmentDate: string; startTime: string; endTime: string;
  maxBookings: number; activeBookings: number; availablePlaces: number;
  status: SlotStatus; isFull: boolean; isBookable: boolean; displayStatus: string;
}
export interface CreateSlotRequest {
  assessmentDate: string; startTime: string; endTime: string; maxBookings: number;
}
export interface UpdateSlotRequest extends CreateSlotRequest { status: SlotStatus; }

// ---------- Bookings ----------
export interface Booking {
  bookingId: number; bookingNumber: string; status: BookingStatus;
  studentNo: number; studentName: string; slotId: number;
  assessmentDate: string; startTime: string; endTime: string; dateMade: string;
}
export interface BookingDetails extends Booking {
  parentId: number; parentName: string; parentEmail: string; parentPhoneNumber: string;
  studentGrade: string; studentHomeLanguage: string;
  lastModifiedAt: string | null; cancelledAt: string | null; cancellationReason: string | null;
}
export interface BookingFilter {
  slotId?: number | null; status?: BookingStatus | '' | null;
  from?: string | null; to?: string | null; studentNo?: number | null;
}

// ---------- Results ----------
export interface AssessmentResult {
  assessmentResultId: number; studentNo: number; studentName: string;
  grade: string; homeLanguage: string; bookingNumber: string | null;
  mathematicsMark: number | null; englishMark: number | null; homeLanguageMark: number | null;
  outcome: AssessmentOutcome; isComplete: boolean; missingSubjects: string[];
  isFinalised: boolean; finalisedAt: string | null; lastUpdatedAt: string;
  hasBeenSentToParent: boolean | null; capturedByName: string | null;
}
export interface SubmitMarksRequest {
  mathematicsMark?: number | null; englishMark?: number | null; homeLanguageMark?: number | null;
}
export interface FinaliseResult { result: AssessmentResult; emailSent: boolean; message: string; }
export interface AwaitingMarks {
  studentNo: number; studentName: string; grade: string; homeLanguage: string;
  bookingNumber: string; assessmentDate: string;
}
export interface ResultFilter {
  isFinalised?: boolean | null; outcome?: AssessmentOutcome | '' | null; search?: string | null;
}

// ---------- Criteria ----------
export interface Criteria {
  isSet: boolean;
  minimumMathematics: number | null; minimumEnglish: number | null; minimumHomeLanguage: number | null;
  updatedAt: string | null; updatedByName: string | null;
}
export interface CriteriaRequest {
  minimumMathematics: number; minimumEnglish: number; minimumHomeLanguage: number;
}

// ---------- Staff ----------
export interface StaffMember {
  staffNo: number; firstName: string; lastName: string; email: string;
  phoneNumber: string; roleName: 'Admin' | 'Clerk'; isActive: boolean;
}
export interface CreateStaffRequest {
  firstName: string; lastName: string; email: string; phoneNumber: string;
  password: string; roleName: 'Admin' | 'Clerk';
}
export interface UpdateStaffRequest {
  firstName: string; lastName: string; phoneNumber: string;
  roleName: 'Admin' | 'Clerk'; isActive: boolean;
}
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }

// ---------- Email log ----------
export interface EmailLog {
  emailLogId: number; toAddress: string; subject: string; type: EmailType;
  status: EmailStatus; errorMessage: string | null; createdAt: string;
  sentAt: string | null; bookingId: number | null;
}