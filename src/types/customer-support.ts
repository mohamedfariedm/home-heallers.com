export interface CustomerSupportLead {
  id: number;
  type: 'operation' | 'marketing';
  type_label: string;
  name: string | null;
  address_1: string | null;
  city: string | null;
  state: string | null;
  source_campaign: string | null;
  mobile_phone: string | null;
  call_count: number | null;
  booking_count: number | null;
  cc: string | null;
  rework: number;
  communication_times: number;
  communication_channel: string | null;
  [key: string]: unknown;
}

export type CustomerSupportWritePayload = Partial<
  Pick<
    CustomerSupportLead,
    | 'city'
    | 'state'
    | 'address_1'
    | 'name'
    | 'mobile_phone'
    | 'source_campaign'
    | 'rework'
    | 'communication_times'
  >
>;
