export type SessionStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type ReservationStatusCode = 1 | 2 | 3 | 4 | 5 | 6 | 8;

export type LocalizedName =
  | string
  | {
      ar?: string | null;
      en?: string | null;
      [key: string]: unknown;
    }
  | null;

export interface CalendarPatient {
  id: number | null;
  name: LocalizedName;
  mobile: string | null;
}

export interface CalendarDoctor {
  id: number;
  name: LocalizedName;
}

export interface CalendarService {
  id: number;
  name: LocalizedName;
}

export interface CalendarReservationSummary {
  id: number;
  status: ReservationStatusCode;
  status_label: string;
  sessions_count: number;
  type: string | null;
}

export interface ReservationCalendarSession {
  id: number;
  reservation_id: number;
  date: string;
  time: string | null;
  start_time: string | null;
  end_time: string | null;
  time_period: string | null;
  status: SessionStatus;
  status_label: string;
  reservation: CalendarReservationSummary;
  patient: CalendarPatient | null;
  doctor: CalendarDoctor | null;
  service: CalendarService | null;
}

export interface ReservationCalendarResponse {
  data: ReservationCalendarSession[];
  message: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ReservationsCalendarParams {
  /** `YYYY-MM` — all sessions in that month */
  month?: string;
  /** `YYYY-MM-DD` — single day (overrides `month` when both are sent) */
  date?: string;
  status?: SessionStatus | '';
  doctor_id?: number | string;
  limit?: number;
  page?: number;
}
