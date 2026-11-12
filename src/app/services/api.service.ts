import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  AssessmentResult, AwaitingMarks, BookingDetails, Booking, BookingFilter, ChangePasswordRequest,
  CreateSlotRequest, CreateStaffRequest, Criteria, CriteriaRequest, EmailLog, EmailStatus,
  FinaliseResult, Parent, ParentDetails, ResultFilter, Slot, SlotStatus, StaffMember, Student,
  StudentRequest, SubmitMarksRequest, UpdateParentRequest, UpdateSlotRequest, UpdateStaffRequest
} from '../models/models';

type QueryValues = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // Leaves out empty values so they are not sent as ?status=
  private query(values: QueryValues): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  // ---------- Parent ----------
  myProfile() { return this.http.get<ParentDetails>(`${this.base}/Parent/me`); }
  updateMyProfile(body: UpdateParentRequest) { return this.http.put<Parent>(`${this.base}/Parent/me`, body); }

  // ---------- Students ----------
  addStudent(body: StudentRequest) { return this.http.post<Student>(`${this.base}/Student`, body); }
  myStudents() { return this.http.get<Student[]>(`${this.base}/Student/mine`); }
  getStudent(studentNo: number) { return this.http.get<Student>(`${this.base}/Student/${studentNo}`); }
  updateStudent(studentNo: number, body: StudentRequest) {
    return this.http.put<Student>(`${this.base}/Student/${studentNo}`, body);
  }
  deleteStudent(studentNo: number) { return this.http.delete<void>(`${this.base}/Student/${studentNo}`); }
  searchStudents(search?: string) {
    return this.http.get<Student[]>(`${this.base}/Student`, { params: this.query({ search }) });
  }

  // ---------- Slots ----------
  availableSlots() { return this.http.get<Slot[]>(`${this.base}/Slot/available`); }
  allSlots(filter: { from?: string; to?: string; status?: SlotStatus | '' } = {}) {
    return this.http.get<Slot[]>(`${this.base}/Slot`, { params: this.query(filter) });
  }
  getSlot(slotId: number) { return this.http.get<Slot>(`${this.base}/Slot/${slotId}`); }
  createSlot(body: CreateSlotRequest) { return this.http.post<Slot>(`${this.base}/Slot`, body); }
  updateSlot(slotId: number, body: UpdateSlotRequest) { return this.http.put<Slot>(`${this.base}/Slot/${slotId}`, body); }
  deleteSlot(slotId: number) { return this.http.delete<void>(`${this.base}/Slot/${slotId}`); }

  // ---------- Bookings ----------
  book(studentNo: number, slotId: number) {
    return this.http.post<BookingDetails>(`${this.base}/Booking`, { studentNo, slotId });
  }
  myBookings() { return this.http.get<Booking[]>(`${this.base}/Booking/mine`); }
  allBookings(filter: BookingFilter = {}) {
    return this.http.get<Booking[]>(`${this.base}/Booking`, { params: this.query({ ...filter }) });
  }
  getBooking(bookingId: number) { return this.http.get<BookingDetails>(`${this.base}/Booking/${bookingId}`); }
  findBookingByNumber(bookingNumber: string) {
    return this.http.get<BookingDetails>(`${this.base}/Booking/number/${encodeURIComponent(bookingNumber.trim())}`);
  }
  reschedule(bookingId: number, slotId: number) {
    return this.http.put<BookingDetails>(`${this.base}/Booking/${bookingId}`, { slotId });
  }
  cancelBooking(bookingId: number, reason?: string) {
    return this.http.post<BookingDetails>(`${this.base}/Booking/${bookingId}/cancel`, { reason: reason || null });
  }
  completeBooking(bookingId: number) {
    return this.http.post<BookingDetails>(`${this.base}/Booking/${bookingId}/complete`, {});
  }
  revertCompletion(bookingId: number) {
    return this.http.post<BookingDetails>(`${this.base}/Booking/${bookingId}/revert-completion`, {});
  }

  // ---------- Assessment results ----------
  saveMarks(studentNo: number, body: SubmitMarksRequest) {
    return this.http.put<AssessmentResult>(`${this.base}/AssessmentResult/student/${studentNo}`, body);
  }
  getResult(studentNo: number) {
    return this.http.get<AssessmentResult>(`${this.base}/AssessmentResult/student/${studentNo}`);
  }
  allResults(filter: ResultFilter = {}) {
    return this.http.get<AssessmentResult[]>(`${this.base}/AssessmentResult`, { params: this.query({ ...filter }) });
  }
  awaitingMarks() { return this.http.get<AwaitingMarks[]>(`${this.base}/AssessmentResult/awaiting-marks`); }
  finalise(studentNo: number) {
    return this.http.post<FinaliseResult>(`${this.base}/AssessmentResult/student/${studentNo}/finalise`, {});
  }

  // ---------- Pass minimums ----------
  getCriteria() { return this.http.get<Criteria>(`${this.base}/AssessmentCriteria`); }
  saveCriteria(body: CriteriaRequest) { return this.http.put<Criteria>(`${this.base}/AssessmentCriteria`, body); }

  // ---------- Staff accounts ----------
  allStaff() { return this.http.get<StaffMember[]>(`${this.base}/Staff`); }
  createStaff(body: CreateStaffRequest) { return this.http.post<StaffMember>(`${this.base}/Staff`, body); }
  updateStaff(staffNo: number, body: UpdateStaffRequest) {
    return this.http.put<StaffMember>(`${this.base}/Staff/${staffNo}`, body);
  }
  changeMyPassword(body: ChangePasswordRequest) {
    return this.http.post<void>(`${this.base}/Staff/me/change-password`, body);
  }

  // ---------- Email log ----------
  emailLogs(status?: EmailStatus | '', bookingId?: number | null) {
    return this.http.get<EmailLog[]>(`${this.base}/EmailLog`, { params: this.query({ status, bookingId }) });
  }
  resendEmail(emailLogId: number) {
    return this.http.post<EmailLog>(`${this.base}/EmailLog/${emailLogId}/resend`, {});
  }
}