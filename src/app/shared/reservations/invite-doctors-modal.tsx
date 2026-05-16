'use client';
import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import client from '@/framework/utils';
import Spinner from '@/components/ui/spinner';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { useGroups } from '@/framework/groups';

interface DoctorGroup {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string | { ar: string; en: string };
  email?: string;
  groups?: DoctorGroup[];
}

function doctorBelongsToGroup(doctor: Doctor, groupId: string): boolean {
  if (!groupId) return true;
  const groups = doctor.groups ?? [];
  return groups.some((g) => String(g.id) === groupId);
}

function getDoctorGroupNames(doctor: Doctor): string[] {
  const groups = doctor.groups ?? [];
  return groups.map((g) => g.name).filter(Boolean);
}

interface InviteDoctorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number;
}

export default function InviteDoctorsModal({
  isOpen,
  onClose,
  reservationId,
}: InviteDoctorsModalProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const { data: groupsData, isLoading: isLoadingGroups } = useGroups(
    'page=1&limit=500'
  );

  const groupOptions = useMemo(() => {
    const raw = groupsData?.data;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return list.map((g: { id: number; name: string }) => ({
      id: g.id,
      name: g.name,
    }));
  }, [groupsData?.data]);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
      setSelectedDoctorIds([]);
      setSearchTerm('');
      setSelectedGroupId('');
    }
  }, [isOpen]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/doctors/list');
      const result = await response.json();
      const doctorsData = result.data || result || [];
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDoctor = (doctorId: number) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const handleSubmit = async () => {
    if (selectedDoctorIds.length === 0) {
      toast.error('Please select at least one doctor');
      return;
    }

    setSubmitting(true);
    try {
      await client.reservations.inviteDoctors({
        reservation_id: reservationId,
        doctor_ids: selectedDoctorIds,
      });
      toast.success('Doctors invited successfully');
      onClose();
    } catch (error: any) {
      console.error('Error inviting doctors:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to invite doctors'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    const searchLower = searchTerm.trim().toLowerCase();

    return doctors.filter((doctor) => {
      if (!doctorBelongsToGroup(doctor, selectedGroupId)) {
        return false;
      }

      if (!searchLower) {
        return true;
      }

      const doctorName =
        typeof doctor.name === 'string'
          ? doctor.name
          : doctor.name?.en || doctor.name?.ar || 'Unknown';
      const name = doctorName.toLowerCase();
      const email = (doctor.email || '').toLowerCase();
      const groupNames = getDoctorGroupNames(doctor)
        .join(' ')
        .toLowerCase();

      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        groupNames.includes(searchLower)
      );
    });
  }, [doctors, searchTerm, selectedGroupId]);

  const getDoctorName = (doctor: Doctor): string => {
    if (typeof doctor.name === 'string') {
      return doctor.name;
    }
    return doctor.name?.en || doctor.name?.ar || 'Unknown';
  };

  // Get selected doctors from filtered list
  const selectedFilteredDoctorIds = useMemo(() => {
    return filteredDoctors
      .map((d) => d.id)
      .filter((id) => selectedDoctorIds.includes(id));
  }, [filteredDoctors, selectedDoctorIds]);

  // Check if all filtered doctors are selected
  const allFilteredSelected =
    filteredDoctors.length > 0 &&
    selectedFilteredDoctorIds.length === filteredDoctors.length;

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      // Deselect all filtered doctors
      const filteredIds = filteredDoctors.map((d) => d.id);
      setSelectedDoctorIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Select all filtered doctors
      const filteredIds = filteredDoctors.map((d) => d.id);
      setSelectedDoctorIds((prev) => {
        const newIds = [...prev];
        filteredIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="m-auto w-full max-w-md rounded-lg bg-white p-6">
        <Title as="h3" className="mb-4 text-lg font-semibold">
          Invite Doctors to Reservation #{reservationId}
        </Title>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {doctors.length === 0 ? (
              <Text className="py-4 text-center text-gray-500">
                No doctors available
              </Text>
            ) : (
              <>
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Filter by group
                    </label>
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      disabled={isLoadingGroups}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    >
                      <option value="">All groups</option>
                      {groupOptions.map((group) => (
                        <option key={group.id} value={String(group.id)}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or group..."
                    className="w-full"
                    prefix={
                      <PiMagnifyingGlassBold className="h-4 w-4 text-gray-500" />
                    }
                    clearable
                    onClear={() => setSearchTerm('')}
                  />
                </div>

                <div className="mb-3 flex items-center justify-between border-b pb-2">
                  <Text className="font-medium">
                    {searchTerm || selectedGroupId
                      ? `Select Doctors (${filteredDoctors.length} found)`
                      : 'Select Doctors'}
                  </Text>
                  {filteredDoctors.length > 0 && (
                    <Button
                      variant="text"
                      onClick={handleSelectAll}
                      className="text-sm"
                    >
                      {allFilteredSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>

                <div className="max-h-80 space-y-2 overflow-y-auto">
                  {filteredDoctors.length === 0 ? (
                    <Text className="py-8 text-center text-gray-500">
                      No doctors found
                      {searchTerm ? ` matching "${searchTerm}"` : ''}
                      {selectedGroupId
                        ? ` in group "${groupOptions.find((g) => String(g.id) === selectedGroupId)?.name ?? ''}"`
                        : ''}
                    </Text>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedDoctorIds.includes(doctor.id)}
                          onChange={() => handleToggleDoctor(doctor.id)}
                          className="cursor-pointer"
                        />
                        <div className="flex-1">
                          <Text className="font-medium">
                            {getDoctorName(doctor)}
                          </Text>
                          {doctor.email && (
                            <Text className="text-xs text-gray-500">
                              {doctor.email}
                            </Text>
                          )}
                          {getDoctorGroupNames(doctor).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {getDoctorGroupNames(doctor).map((groupName) => (
                                <Badge
                                  key={`${doctor.id}-${groupName}`}
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {groupName}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  Selected: {selectedDoctorIds.length} / {doctors.length}
                  {(searchTerm || selectedGroupId) &&
                    filteredDoctors.length !== doctors.length && (
                    <span className="ml-2 text-gray-400">
                      (Showing {filteredDoctors.length} filtered)
                    </span>
                  )}
                </div>
              </>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedDoctorIds.length === 0}
                isLoading={submitting}
              >
                Invite Selected Doctors
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
