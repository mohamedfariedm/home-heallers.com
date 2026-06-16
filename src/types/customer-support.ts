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
  [key: string]: unknown;
}

export type CustomerSupportWritePayload = Partial<
  Pick<
    CustomerSupportLead,
    'city' | 'state' | 'address_1' | 'name' | 'mobile_phone' | 'source_campaign'
  >
>;
