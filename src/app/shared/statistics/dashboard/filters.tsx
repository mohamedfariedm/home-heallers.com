'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SelectBox from '@/components/ui/select';
import { 
  PiMagnifyingGlassBold, 
  PiXBold, 
  PiFunnelBold, 
  PiCaretDownBold, 
  PiCaretUpBold 
} from 'react-icons/pi';
import cn from '@/utils/class-names';

export interface StatisticsFilters {
  date_from?: string;
  date_to?: string;
  doctor_id?: string;
  client_id?: string;
  reservation_statuses?: number[];
  customer_support_types?: string[];
  source_campaign?: string;
}

interface StatisticsFiltersProps {
  onFilter: (filters: StatisticsFilters) => void;
  className?: string;
}

const reservationStatusOptions = [
  { value: '1', label: 'Reviewing' },
  { value: '2', label: 'Awaiting Confirmation' },
  { value: '3', label: 'Confirmed' },
  { value: '4', label: 'Canceled' },
  { value: '5', label: 'Completed' },
  { value: '6', label: 'Failed' },
];

const customerSupportTypeOptions = [
  { value: 'operation', label: 'Operation' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' },
];

export default function StatisticsFiltersComponent({
  onFilter,
  className,
}: StatisticsFiltersProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [clientId, setClientId] = useState('');
  const [sourceCampaign, setSourceCampaign] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSupportTypes, setSelectedSupportTypes] = useState<string[]>([]);
  
  // Doctors and Clients lists
  const [doctors, setDoctors] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [clients, setClients] = useState<Array<{ id: number; name: { en: string; ar: string } }>>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch doctors and clients on component mount
  useEffect(() => {
    fetchDoctors();
    fetchClients();
  }, []);

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const response = await fetch('/api/doctors/list');
      const result = await response.json();
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
      const result = await response.json();
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

  const handleApplyFilters = () => {
    const filters: StatisticsFilters = {};
    
    if (dateFrom) filters.date_from = dateFrom;
    if (dateTo) filters.date_to = dateTo;
    if (doctorId) filters.doctor_id = doctorId;
    if (clientId) filters.client_id = clientId;
    if (sourceCampaign) filters.source_campaign = sourceCampaign;
    if (selectedStatuses.length > 0) {
      filters.reservation_statuses = selectedStatuses.map(s => parseInt(s));
    }
    if (selectedSupportTypes.length > 0) {
      filters.customer_support_types = selectedSupportTypes;
    }

    onFilter(filters);
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setDoctorId('');
    setClientId('');
    setSourceCampaign('');
    setSelectedStatuses([]);
    setSelectedSupportTypes([]);
    onFilter({});
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

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800', className)}>
      <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex bg-blue-50 p-2 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
              <PiFunnelBold className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Filters</h3>
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
      
      <div className={cn('grid transition-all duration-300 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100 p-5' : 'grid-rows-[0fr] opacity-0 p-0 overflow-hidden')}>
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Date From */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Date From
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
            Date To
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
            Doctor
          </label>
          <SelectBox
            value={doctorId}
            onChange={setDoctorId}
            options={[
              { value: '', name: loadingDoctors ? 'Loading...' : 'Select Doctor' },
              ...doctors.map(doctor => ({
                value: String(doctor.id),
                name: doctor.name?.ar || doctor.name?.en || `Doctor ${doctor.id}`
              }))
            ]}
            placeholder="Select Doctor"
            className="w-full"
            selectClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-[38px]"
          />
        </div>

        {/* Client Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Client
          </label>
          <SelectBox
            value={clientId}
            onChange={setClientId}
            options={[
              { value: '', name: loadingClients ? 'Loading...' : 'Select Client' },
              ...clients.map(client => ({
                value: String(client.id),
                name: client.name?.ar || client.name?.en || `Client ${client.id}`
              }))
            ]}
            placeholder="Select Client"
            className="w-full"
            selectClassName="border-gray-200 dark:border-gray-700 focus:ring-blue-500 rounded-lg h-[38px]"
          />
        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reservation Statuses */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Reservation Status
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
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Customer Support Types */}
        <div className="space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Customer Support Type
          </label>
          <div className="flex flex-wrap gap-2">
            {customerSupportTypeOptions.map((option) => (
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
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="text"
            onClick={handleReset}
            className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
          >
            <PiXBold className="me-1.5 h-4 w-4" />
            Reset Filters
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-gray-900 px-8 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900"
          >
            <PiMagnifyingGlassBold className="me-1.5 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
