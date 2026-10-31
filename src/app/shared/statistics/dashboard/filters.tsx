'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { 
  PiMagnifyingGlassBold, 
  PiXBold, 
  PiFunnelBold, 
  PiCaretDownBold, 
  PiCaretUpBold,
  PiArrowCounterClockwiseBold,
} from 'react-icons/pi';
import cn from '@/utils/class-names';
import { useCenters } from '@/framework/centers';
import {
  NOT_SPECIFIED_LABEL,
  SOURCE_CAMPAIGN_NOT_SPECIFIED_VALUE,
  SOURCE_CAMPAIGN_OPTIONS,
} from '@/app/shared/source-campaign-options';
import { getLast10DaysRange as getSharedLast10DaysRange } from '@/utils/default-date-range';

export interface StatisticsFilters {
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
  client_id?: string;
  center_id?: string;
  reservation_statuses?: number[];
  customer_support_types?: string[];
  source_campaigns?: string[];
}

/** Query string shared by the aggregates, monthly and weekly statistics requests. */
export function buildStatisticsQueryParams(filters: StatisticsFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.doctor_id) params.append('doctor_id', filters.doctor_id);
  if (filters.client_id) params.append('client_id', filters.client_id);
  if (filters.center_id) params.append('center_id', filters.center_id);
  filters.reservation_statuses?.forEach((status) =>
    params.append('reservation_statuses[]', status.toString())
  );
  filters.customer_support_types?.forEach((type) =>
    params.append('customer_support_types[]', type)
  );
  filters.source_campaigns?.forEach((campaign) =>
    params.append('source_campaigns[]', campaign)
  );

  return params;
}

interface StatisticsFiltersProps {
  onFilter: (filters: StatisticsFilters) => void;
  className?: string;
}

/** Last 10 days, today inclusive. Matches the dashboard's initial date range. */
function getLast10DaysRange(): { date_from: string; date_to: string } {
  const range = getSharedLast10DaysRange();
  return { date_from: range.from, date_to: range.to };
}

const reservationStatusOptions = [
  { value: '1', labelKey: 'stats_status_reviewing', label: 'Reviewing' },
  { value: '2', labelKey: 'stats_status_awaiting', label: 'Awaiting Confirmation' },
  { value: '3', labelKey: 'stats_status_confirmed', label: 'Confirmed' },
  { value: '4', labelKey: 'stats_status_canceled', label: 'Canceled' },
  { value: '5', labelKey: 'stats_status_completed', label: 'Completed' },
  { value: '6', labelKey: 'stats_status_failed', label: 'Failed' },
  { value: '7', labelKey: 'stats_status_draft', label: 'Draft' },
];

const customerSupportTypeOptions = [
  { value: 'operation', labelKey: 'stats_type_operation', label: 'Inbound' },
  { value: 'marketing', labelKey: 'stats_type_marketing', label: 'Outbound' },
  { value: 'maintenance', labelKey: 'stats_type_maintenance', label: 'Maintenance' },
  { value: 'consultation', labelKey: 'stats_type_consultation', label: 'Consultation' },
  { value: 'emergency', labelKey: 'stats_type_emergency', label: 'Emergency' },
];

const sourceCampaignFilterOptions = [
  ...SOURCE_CAMPAIGN_OPTIONS,
  { value: SOURCE_CAMPAIGN_NOT_SPECIFIED_VALUE, label: NOT_SPECIFIED_LABEL },
];

function toSelectValue(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return String((value as { value: string | number }).value);
  }
  return String(value);
}

function getSelectDisplayName(
  selected: unknown,
  options: Array<{ value: string | number; name: string }>
): string {
  const selectedValue = toSelectValue(selected);
  if (!selectedValue) return '';
  return options.find((option) => String(option.value) === selectedValue)?.name ?? selectedValue;
}

export default function StatisticsFiltersComponent({
  onFilter,
  className,
}: StatisticsFiltersProps) {
  const { t, i18n } = useTranslation('statistics');
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const defaults = useMemo(() => getLast10DaysRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.date_from);
  const [dateTo, setDateTo] = useState(defaults.date_to);
  const [doctorId, setDoctorId] = useState('');
  const [clientId, setClientId] = useState('');
  const [centerId, setCenterId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<string[]>([]);
  const [selectedSourceCampaigns, setSelectedSourceCampaigns] = useState<string[]>([]);
  
  // Doctors, Clients, and Centers lists
  const [doctors, setDoctors] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [clients, setClients] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use centers hook
  const { data: centersData, isLoading: loadingCenters } = useCenters('limit=1000');

  // Fetch doctors and clients on component mount
  useEffect(() => {
    fetchDoctors();
    fetchClients();
  }, []);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await fetch('/api/doctors/list');
      const result = (await response.json()) as any;
      const doctorsData = result.data || result || [];
      
      const normalizedDoctors = doctorsData.map((doctor: any) => ({
        id: doctor.id,
        name: typeof doctor.name === 'object' 
          ? { ar: doctor.name.ar || '', en: doctor.name.en || '' }
          : { ar: '', en: doctor.name || '' }
      }));
      
      setDoctors(normalizedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch('/api/clients/list');
      const result = (await response.json()) as any;
      const clientsData = result.data || result || [];
      
      const normalizedClients = clientsData.map((client: any) => ({
        id: client.id,
        name: typeof client.name === 'object' 
          ? { ar: client.name.ar || '', en: client.name.en || '' }
          : { ar: '', en: client.name || '' }
      }));
      
      setClients(normalizedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Normalize centers data from the hook
  const centersResponse = centersData?.data || centersData;
  const centersArray = Array.isArray(centersResponse?.data) 
    ? centersResponse.data 
    : Array.isArray(centersResponse) 
    ? centersResponse 
    : [];
  
  const normalizedCenters: Array<{ id: number; name: { en: string; ar: string } }> = centersArray.map((center: any) => ({
    id: center.id,
    name: typeof center.name === 'object' 
      ? { ar: center.name.ar || '', en: center.name.en || '' }
      : { ar: '', en: center.name || '' }
  }));

  const doctorOptions = [
    {
      value: '',
      name: loadingDoctors
        ? t('shared_loading', 'Loading...')
        : t('stats_select_doctor', 'Select Doctor'),
    },
    ...doctors.map((doctor) => ({
      value: String(doctor.id),
      name:
        doctor.name?.[lang] ||
        doctor.name?.en ||
        doctor.name?.ar ||
        t('stats_doctor_n', { id: doctor.id, defaultValue: 'Doctor {{id}}' }),
    })),
  ];

  const clientOptions = [
    {
      value: '',
      name: loadingClients
        ? t('shared_loading', 'Loading...')
        : t('stats_select_client', 'Select Client'),
    },
    ...clients.map((client) => ({
      value: String(client.id),
      name:
        client.name?.[lang] ||
        client.name?.en ||
        client.name?.ar ||
        t('stats_client_n', { id: client.id, defaultValue: 'Client {{id}}' }),
    })),
  ];

  const centerOptions = [
    {
      value: '',
      name: loadingCenters
        ? t('shared_loading', 'Loading...')
        : t('stats_select_center', 'Select Center'),
    },
    ...normalizedCenters.map((center) => ({
      value: String(center.id),
      name:
        center.name?.[lang] ||
        center.name?.en ||
        center.name?.ar ||
        t('stats_center_n', { id: center.id, defaultValue: 'Center {{id}}' }),
    })),
  ];

  const handleApplyFilters = () => {
    const filters: StatisticsFilters = {};
    const normalizedDoctorId = toSelectValue(doctorId);
    const normalizedClientId = toSelectValue(clientId);
    const normalizedCenterId = toSelectValue(centerId);
    
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (normalizedDoctorId) filters.doctor_id = normalizedDoctorId;
    if (normalizedClientId) filters.client_id = normalizedClientId;
    if (normalizedCenterId) filters.center_id = normalizedCenterId;
    if (selectedStatuses.length > 0) {
      filters.reservation_statuses = selectedStatuses.map(s => parseInt(s));
    }
    if (selectedSupportTypes.length > 0) {
      filters.customer_support_types = selectedSupportTypes;
    }
    if (selectedSourceCampaigns.length > 0) {
      filters.source_campaigns = selectedSourceCampaigns;
    }

    onFilter(filters);
  };

  const handleReset = () => {
    setDateFrom(defaults.date_from);
    setDateTo(defaults.date_to);
    setDoctorId('');
    setClientId('');
    setCenterId('');
    setSelectedStatuses([]);
    setSelectedSupportTypes([]);
    setSelectedSourceCampaigns([]);
    onFilter({ date_from: defaults.date_from, date_to: defaults.date_to });
  };

  const handleLast10Days = () => {
    setDateFrom(defaults.date_from);
    setDateTo(defaults.date_to);
  };
  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleSupportType = (type: string) => {
    setSelectedSupportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleSourceCampaign = (campaign: string) => {
    setSelectedSourceCampaigns((prev) =>
      prev.includes(campaign) ? prev.filter((c) => c !== campaign) : [...prev, campaign]
    );
  };

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800', className)}>
      <div
        className={cn(
          'flex items-center justify-between p-5',
          isOpen && 'border-b border-gray-100 dark:border-gray-700'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex bg-blue-50 p-2 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <PiFunnelBold className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {t('shared_filters', 'Filters')}
          </h3>
        </div>
        <Button 
          variant="text" 
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <PiCaretUpBold className="h-5 w-5" />
          ) : (
            <PiCaretDownBold className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="p-5">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('shared_date_from', 'Date From')}
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full"
            inputClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg"
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('shared_date_to', 'Date To')}
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full"
            inputClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg"
          />
        </div>

        {/* Doctor Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('stats_doctor', 'Doctor')}
          </label>
          <SelectBox
            value={doctorId}
            onChange={(value) => setDoctorId(toSelectValue(value))}
            getOptionValue={(option) => option.value}
            displayValue={(selected) => getSelectDisplayName(selected, doctorOptions)}
            options={doctorOptions}
            placeholder={t('stats_select_doctor', 'Select Doctor')}
            className="w-full"
            selectClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-[38px]"
          />
        </div>

        {/* Client Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('stats_client', 'Client')}
          </label>
          <SelectBox
            value={clientId}
            onChange={(value) => setClientId(toSelectValue(value))}
            getOptionValue={(option) => option.value}
            displayValue={(selected) => getSelectDisplayName(selected, clientOptions)}
            options={clientOptions}
            placeholder={t('stats_select_client', 'Select Client')}
            className="w-full"
            selectClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-[38px]"
          />
        </div>

        {/* Center Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('stats_center', 'Center')}
          </label>
          <SelectBox
            value={centerId}
            onChange={(value) => setCenterId(toSelectValue(value))}
            getOptionValue={(option) => option.value}
            displayValue={(selected) => getSelectDisplayName(selected, centerOptions)}
            options={centerOptions}
            placeholder={t('stats_select_center', 'Select Center')}
            className="w-full"
            selectClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-[38px]"
          />
        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reservation Statuses */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('stats_reservation_status', 'Reservation Status')}
          </label>
          <div className="flex flex-wrap gap-2">
            {reservationStatusOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={selectedStatuses.includes(option.value) ? 'solid' : 'outline'}
                onClick={() => toggleStatus(option.value)}
                className={cn(
                  'rounded-full px-4 h-8 transition-all duration-200 border',
                  selectedStatuses.includes(option.value)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm hover:bg-blue-700'
                    : 'bg-transparent border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {t(option.labelKey, option.label)}
              </Button>
            ))}
          </div>
        </div>

        {/* Customer Support Types */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {t('stats_support_type', 'Customer Support Type')}
          </label>
          <div className="flex flex-wrap gap-2">
            {customerSupportTypeOptions.map((option) => {
              return (
                <Button
                  key={option.value}
                  size="sm"
                  variant={selectedSupportTypes.includes(option.value) ? 'solid' : 'outline'}
                  onClick={() => toggleSupportType(option.value)}
                  className={cn(
                    'rounded-full px-4 h-8 transition-all duration-200 border',
                    selectedSupportTypes.includes(option.value)
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                      : 'bg-transparent border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  )}
                >
                  {t(option.labelKey, option.label)}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source Campaigns */}
      <div className="mt-6 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {t('stats_source_campaign', 'Source Campaign')}
        </label>
        <div className="flex flex-wrap gap-2">
          {sourceCampaignFilterOptions.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={selectedSourceCampaigns.includes(option.value) ? 'solid' : 'outline'}
              onClick={() => toggleSourceCampaign(option.value)}
              className={cn(
                'rounded-full px-4 h-8 transition-all duration-200 border',
                selectedSourceCampaigns.includes(option.value)
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm hover:bg-purple-700'
                  : 'bg-transparent border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {t(
                option.value === SOURCE_CAMPAIGN_NOT_SPECIFIED_VALUE
                  ? 'campaign_not_specified'
                  : `campaign_${option.value}`,
                option.label
              )}
            </Button>
          ))}
        </div>
      </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            <Button
              variant="text"
              onClick={handleLast10Days}
              className="me-auto text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20"
            >
              <PiArrowCounterClockwiseBold className="me-1.5 h-4 w-4" />
              {t('stats_last_10_days', 'Last 10 days')}
            </Button>
            <Button
              variant="text"
              onClick={handleReset}
              className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
            >
              <PiXBold className="me-1.5 h-4 w-4" />
              {t('shared_reset_filters', 'Reset Filters')}
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-gray-900 px-8 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
            >
              <PiMagnifyingGlassBold className="me-1.5 h-4 w-4" />
              {t('shared_apply_filters', 'Apply Filters')}
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
