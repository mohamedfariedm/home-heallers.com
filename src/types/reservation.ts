export interface Reservation {
  id: number;
  status: number;
  status_label: string;
  sessions_count: number;
  total_amount: number;
  notes: string | null;
  operation_notes: string | null;
  cc: string | null;
  rework: number;
  seen: boolean;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export type ReservationWritePayload = Partial<
  Pick<Reservation, 'rework'>
>;
