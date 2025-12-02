'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  FileText,
  Calculator,
  Receipt,
} from 'lucide-react';
import { ActionIcon } from '@/components/rizzui/action-icon';
import { PiXBold } from 'react-icons/pi';
import Spinner from '@/components/ui/spinner';
import FormGroup from '@/components/form-group';
import { useModal } from '../modal-views/use-modal';
import { useCreateInvoices, useUpdateInvoices } from '@/framework/invoices';
import { usePatients } from '@/framework/patients';
import { useDoctors } from '@/framework/doctors';
import { useCategories } from '@/framework/categories'; // <-- NEW

// -------------------- Zod Schemas --------------------
const InvoiceDetailSchema = z.object({
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  customer_name: z.string().min(1, 'Customer name is required'),
  category_id: z.coerce.number().min(1, 'Category selection is required'),
  category_name: z.string().min(1, 'Category name is required'),
  session_price: z.coerce.number().min(0, 'Session price must be non-negative'),
  session_count: z.coerce.number().min(1, 'Session count must be at least 1'),
  doctor_id: z.coerce.number().min(1, 'Doctor selection is required'),
  national_id: z.union([z.string(), z.number(), z.null()]).optional(),
  tax_percentage: z.enum(['0%', '15%', '20%', 'معافاه']).default('15%'),
});

const InvoiceFormSchema = z.object({
  invoice_number: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  discount: z.coerce.number().min(0, 'Discount must be non-negative'),
  total_before_tax: z.coerce
    .number()
    .min(0, 'Total before tax must be non-negative'),
  tax_total: z.coerce.number().min(0, 'Tax total must be non-negative'),
  grand_total: z.coerce.number().min(0, 'Grand total must be non-negative'),
  balance_due: z.coerce.number().min(0, 'Balance due must be non-negative'),
  status: z
    .enum(['قيد الانتظار', 'موافق عليه', 'ملغاة'])
    .default('قيد الانتظار'),
  notes: z.string().optional(),
  details: z
    .array(InvoiceDetailSchema)
    .min(1, 'At least one invoice detail is required'),
});

type InvoiceFormInput = z.infer<typeof InvoiceFormSchema>;

// -------------------- Types --------------------
interface InvoiceDetail {
  id?: string | number | null;
  customer_name: string;
  category_id: number | string;
  category_name: string;
  session_price: number | string;
  session_count: number | string;
  doctor_id: number | string;
  national_id?: string | number | null;
  tax_percentage?: string;
}

interface Invoice {
  id?: string | number;
  invoice_number: string;
  invoice_date: string;
  discount: number | string;
  total_before_tax: number | string;
  tax_total: number | string;
  grand_total: number | string;
  balance_due: number | string;
  status: string;
  notes?: string;
  details: InvoiceDetail[];
}

// -------------------- Helpers --------------------
const taxRateFrom = (v: unknown): number => {
  if (v == null) return 0.15;
  const s = String(v).trim();
  if (s === 'معافاه') return 0;
  if (s.endsWith('%')) {
    const n = Number(s.replace('%', '').trim());
    return isNaN(n) ? 0 : n / 100;
  }
  const n = Number(s);
  if (!isNaN(n)) return n > 1 ? n / 100 : n;
  return 0;
};

const toNum = (v: unknown) => Number(v ?? 0) || 0;

// -------------------- Per-line Calculation Hook --------------------
const useInvoiceCalculations = (
  details: Array<{
    session_price: number | string;
    session_count: number | string;
    tax_percentage?: string | number | null;
  }>,
  discount: string | number,
  setValue: (name: any, value: any) => void
) => {
  useEffect(() => {
    const totalBeforeTax = details.reduce((sum, d) => {
      const price = toNum(d.session_price);
      const count = toNum(d.session_count);
      return sum + price * count;
    }, 0);

    const taxTotal = details.reduce((sum, d) => {
      const price = toNum(d.session_price);
      const count = toNum(d.session_count);
      const lineTotal = price * count;
      const rate = taxRateFrom(d.tax_percentage ?? '15%');
      return sum + lineTotal * rate;
    }, 0);

    const grandTotal = totalBeforeTax + taxTotal - toNum(discount);
    const balanceDue = grandTotal;

    setValue('total_before_tax', totalBeforeTax);
    setValue('tax_total', taxTotal);
    setValue('grand_total', grandTotal);
    setValue('balance_due', balanceDue);
  }, [details, discount, setValue]);
};

// -------------------- Component --------------------
export default function InvoiceManager({
  initValues,
}: {
  initValues?: Invoice;
}) {
  const { closeModal } = useModal();
  const [editingDetail, setEditingDetail] = useState<InvoiceDetail | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [detailErrors, setDetailErrors] = useState<z.ZodError | null>(null);

  const { mutate: create, isPending: isCreating } = useCreateInvoices();
  const { mutate: update, isPending: isUpdating } = useUpdateInvoices();
  const { data: clientData, isLoading: clientsLoading } = usePatients('');
  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors('');
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories(''); // <-- NEW

  const statusOptions = [
    { value: 'قيد الانتظار', label: 'قيد الانتظار' },
    { value: 'موافق عليه', label: 'موافق عليه' },
    { value: 'ملغاة', label: 'ملغاة' },
  ];
  const taxPercentageOptions = [
    { value: '0%', label: '0%' },
    { value: '15%', label: '15%' },
    { value: '20%', label: '20%' },
    { value: 'معافاه', label: 'معافاه' },
  ];

  // ---------- useForm ----------
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InvoiceFormInput>({
    resolver: zodResolver(InvoiceFormSchema),
    defaultValues: {
      invoice_number:
        initValues?.invoice_number ||
        `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      invoice_date:
        initValues?.invoice_date || new Date().toISOString().split('T')[0],
      discount: initValues?.discount || 0,
      total_before_tax: initValues?.total_before_tax || 0,
      tax_total: initValues?.tax_total || 0,
      grand_total: initValues?.grand_total || 0,
      balance_due: initValues?.balance_due || 0,
      status: initValues?.status || 'قيد الانتظار',
      notes: initValues?.notes || '',
      details: initValues?.details || [],
    },
  });

  const details = watch('details') || [];
  const discount = watch('discount');

  // ---------- Calculations ----------
  useInvoiceCalculations(details, discount, setValue);

  // ---------- Handlers ----------
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!editingDetail) return;
    const selectedId = Number(event.target.value);
    const selected = categoriesData?.data?.find(
      (c: any) => c.id === selectedId
    );
    setEditingDetail({
      ...editingDetail,
      category_id: selectedId,
      category_name: selected?.name?.en || selected?.name?.ar || '',
    });
    setDetailErrors(null);
  };

  const handleDoctorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editingDetail) return;
    setEditingDetail({
      ...editingDetail,
      doctor_id: event.target.value,
    });
    setDetailErrors(null);
  };

  const handleAddDetail = () => {
    setEditingDetail({
      customer_name: '',
      category_id: 0,
      category_name: '',
      session_price: 0,
      session_count: 1,
      doctor_id: 0,
      national_id: '',
      tax_percentage: '15%',
    });
    setIsAddingNew(true);
    setEditingIndex(null);
    setDetailErrors(null);
  };

  const handleEditDetail = (index: number) => {
    const d = details[index];
    setEditingDetail({
      ...d,
      category_id: d.category_id ?? 0,
      category_name: d.category_name ?? '',
      tax_percentage: d.tax_percentage || '15%',
    });
    setIsAddingNew(false);
    setEditingIndex(index);
    setDetailErrors(null);
  };

  const handleSaveDetail = () => {
    if (!editingDetail) return;
    try {
      const validatedDetail = InvoiceDetailSchema.parse({
        ...editingDetail,
        session_price: editingDetail.session_price,
        session_count: editingDetail.session_count,
        doctor_id: editingDetail.doctor_id,
        category_id: editingDetail.category_id,
        category_name: editingDetail.category_name,
      });

      const newDetail: InvoiceDetail = {
        ...validatedDetail,
        id: validatedDetail.id ?? undefined,
      };

      if (isAddingNew) {
        setValue('details', [...details, newDetail]);
      } else if (editingIndex !== null) {
        const updated = details.map((d: InvoiceDetail, i: number) =>
          i === editingIndex ? newDetail : d
        );
        setValue('details', updated);
      }

      setEditingDetail(null);
      setIsAddingNew(false);
      setEditingIndex(null);
      setDetailErrors(null);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setDetailErrors(error);
      }
    }
  };

  const handleDeleteDetail = (index: number) => {
    setValue(
      'details',
      details.filter((_: InvoiceDetail, i: number) => i !== index)
    );
  };

  const handleDetailFieldChange = (field: keyof InvoiceDetail, value: any) => {
    if (!editingDetail) return;
    setEditingDetail({ ...editingDetail, [field]: value });
    setDetailErrors(null);
  };

  // ---------- Submit ----------
  const onSubmit: SubmitHandler<InvoiceFormInput> = (data) => {
    const payload = {
      invoice_number: data.invoice_number,
      invoice_date: data.invoice_date,
      discount: Number(data.discount),
      total_before_tax: Number(data.total_before_tax),
      tax_total: Number(data.tax_total),
      grand_total: Number(data.grand_total),
      balance_due: Number(data.balance_due),
      status: data.status,
      notes: data.notes,
      details: data.details.map((detail) => ({
        id: detail.id ?? undefined,
        customer_name: detail.customer_name,
        national_id: detail.national_id ?? null,
        doctor_id: Number(detail.doctor_id),
        category_id: Number(detail.category_id),
        category_name: detail.category_name,
        session_price: Number(detail.session_price),
        session_count: Number(detail.session_count),
        tax_percentage: detail.tax_percentage,
      })),
    };

    if (initValues?.id) {
      update({ ...payload, id: initValues.id });
      closeModal();
    } else {
      create(payload);
      closeModal();
    }
    console.log('Submitted Payload:', JSON.stringify(payload, null, 2));
  };

  // ---------- Sample Data ----------
  const loadSampleData = () => {
    const sampleData: Invoice = {
      invoice_number: 'INV-2025-001',
      invoice_date: '2025-07-29',
      discount: 20.0,
      total_before_tax: 780.0,
      tax_total: 39.0,
      grand_total: 819.0,
      balance_due: 819.0,
      status: 'موافق عليه',
      notes: 'Sample invoice for testing purposes',
      details: [
        {
          customer_name: 'Ahmed Mostafa',
          category_id: 1,
          category_name: 'Physiotherapy',
          session_price: 200,
          session_count: 2,
          doctor_id: 10,
          national_id: '1234567890123',
          tax_percentage: '15%',
        },
        {
          customer_name: 'Sarah Ali',
          category_id: 2,
          category_name: 'Consultation',
          session_price: 150,
          session_count: 3,
          doctor_id: 11,
          national_id: '9876543210987',
          tax_percentage: '15%',
        },
      ],
    };
    reset(sampleData as any);
  };

  // ---------- Render ----------
  const isLoadingAny = clientsLoading || doctorsLoading || categoriesLoading;
  console.log(errors);
  console.log(categoriesData);

  // Normalize `errors.details` so we never call `.map` on a non-array.
  const detailErrorsRaw = (errors as any)?.details;
  const detailErrorsArray: any[] = Array.isArray(detailErrorsRaw)
    ? detailErrorsRaw
    : detailErrorsRaw && typeof detailErrorsRaw === 'object'
    ? Object.keys(detailErrorsRaw)
        .filter((k) => !isNaN(Number(k)))
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => detailErrorsRaw[k])
    : [];

  const formatErrorItem = (item: any): string => {
    if (item == null) return '';
    if (typeof item === 'string') return item;
    if (item.message) return String((item as any).message);
    if (Array.isArray(item))
      return item.map((i) => formatErrorItem(i)).join(', ');
    if (typeof item === 'object') {
      return Object.entries(item as any)
        .map(
          ([key, val]) =>
            `${key}: ${
              (val as any)?.message ??
              (typeof val === 'string' ? val : JSON.stringify(val))
            }`
        )
        .join(', ');
    }
    return String(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {isLoadingAny ? (
          <div className="flex h-96 items-center justify-center">
            <div className="space-y-4 text-center">
              <Spinner size="xl" />
              <p className="text-muted-foreground">Loading invoice data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Header */}
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <Receipt className="h-6 w-6" />
                    {initValues ? 'Update Invoice' : 'Create New Invoice'}
                  </div>
                  {!initValues && (
                    <div className="flex gap-2">
                      <Button
                        onClick={loadSampleData}
                        color="secondary"
                        size="sm"
                        className="border-white/30 bg-white/20 hover:bg-white/30"
                        type="button"
                      >
                        Load Sample Data
                      </Button>
                      <ActionIcon
                        size="sm"
                        variant="text"
                        onClick={closeModal}
                        className="text-white hover:bg-white/20"
                      >
                        <PiXBold className="h-auto w-5" />
                      </ActionIcon>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormGroup className="hidden" title="Invoice Number">
                    <Input
                      disabled
                      placeholder="e.g. INV-2025-001"
                      {...register('invoice_number')}
                      className="bg-gray-50 font-mono"
                    />
                    {errors.invoice_number && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.invoice_number.message}
                      </p>
                    )}
                  </FormGroup>
                  <FormGroup title="Invoice Date">
                    <Input
                      type="date"
                      placeholder="Select date"
                      {...register('invoice_date')}
                    />
                    {errors.invoice_date && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.invoice_date.message}
                      </p>
                    )}
                  </FormGroup>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormGroup title="Discount (ر.س)">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 20.00"
                      {...register('discount', { valueAsNumber: true })}
                    />
                    {errors.discount && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.discount.message}
                      </p>
                    )}
                  </FormGroup>
                  <FormGroup title="Status">
                    <select
                      {...register('status')}
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.status.message}
                      </p>
                    )}
                  </FormGroup>
                </div>
              </CardContent>
            </Card>

            {/* Details Management */}
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6" />
                    Invoice Line Items ({details.length})
                  </div>
                  <Button
                    onClick={handleAddDetail}
                    size="sm"
                    className="border-white/30 bg-white/20 hover:bg-white/30"
                    type="button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Detail
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {errors.details && (
                  <p className="mb-4 text-sm text-red-500">
                    {errors.details.message}
                  </p>
                )}
                <div className="space-y-6">
                  {details.map((detail: InvoiceDetail, index: number) => (
                    <Card
                      key={String(detail.id ?? index)}
                      className="border-l-4 border-l-emerald-500 shadow-md transition-shadow hover:shadow-lg"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-emerald-600">
                                Customer
                              </p>
                              <p className="font-semibold text-gray-900">
                                {detail.customer_name}
                              </p>
                              {detail.national_id && (
                                <p className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                  ID: {detail.national_id}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-emerald-600">
                                Category
                              </p>
                              <p className="font-semibold text-gray-900">
                                {detail.category_name}
                              </p>
                              <p className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                                ID: {detail.category_id}
                              </p>
                              <p className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600">
                                Tax: {detail.tax_percentage || '15%'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-emerald-600">
                                Doctor
                              </p>
                              <p className="font-semibold text-gray-900">
                                {doctorsData?.data?.find(
                                  (d: any) => d.id === Number(detail.doctor_id)
                                )?.name?.en || `Dr. ID: ${detail.doctor_id}`}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-emerald-600">
                                Pricing
                              </p>
                              <p className="font-medium text-gray-700">
                                {Number(detail.session_price)} ر.س ×{' '}
                                {detail.session_count}
                              </p>
                              <p className="rounded bg-emerald-50 px-3 py-1 text-lg font-bold text-emerald-600">
                                {Number(detail.session_price) *
                                  Number(detail.session_count)}{' '}
                                ر.س
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <Button
                              onClick={() => handleEditDetail(index)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-blue-50"
                              type="button"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteDetail(index)}
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {details.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center text-gray-500">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-lg font-medium">
                        No invoice details added yet
                      </p>
                      <p className="text-sm">
                        Click &quot;Add Detail&quot; to get started with your
                        first line item.
                      </p>
                    </div>
                  )}
                </div>

                {/* Edit/Add Detail */}
                {editingDetail && (
                  <Card className="mt-8 border-2 border-blue-500 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardTitle className="flex items-center justify-between">
                        {isAddingNew ? 'Add New Detail' : 'Edit Detail'}
                        <Button
                          onClick={() => {
                            setEditingDetail(null);
                            setDetailErrors(null);
                          }}
                          size="sm"
                          color="secondary"
                          className="bg-white/20 hover:bg-white/30"
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 bg-blue-50/30 p-8">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormGroup title="Customer Name *">
                          <Input
                            value={editingDetail.customer_name}
                            onChange={(e) =>
                              handleDetailFieldChange(
                                'customer_name',
                                e.target.value
                              )
                            }
                            placeholder="Enter customer name"
                            className="bg-white"
                          />
                          {detailErrors?.errors.find((err) =>
                            err.path.includes('customer_name')
                          ) && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                detailErrors.errors.find((err) =>
                                  err.path.includes('customer_name')
                                )?.message
                              }
                            </p>
                          )}
                        </FormGroup>
                        <FormGroup title="National ID">
                          <Input
                            value={(editingDetail.national_id as any) ?? ''}
                            onChange={(e) =>
                              handleDetailFieldChange(
                                'national_id',
                                e.target.value
                              )
                            }
                            placeholder="Enter national ID (optional)"
                            className="bg-white"
                          />
                        </FormGroup>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormGroup title="Category *">
                          <select
                            value={String(editingDetail.category_id ?? '')}
                            onChange={handleCategoryChange}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Category</option>
                            {categoriesData?.data?.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name?.en || cat.name?.ar || cat.id}
                              </option>
                            ))}
                          </select>
                          {detailErrors?.errors.find((err) =>
                            err.path.includes('category_id')
                          ) && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                detailErrors.errors.find((err) =>
                                  err.path.includes('category_id')
                                )?.message
                              }
                            </p>
                          )}
                        </FormGroup>

                        <FormGroup title="Doctor *">
                          <select
                            value={String(editingDetail.doctor_id ?? '')}
                            onChange={handleDoctorChange}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Doctor</option>
                            {doctorsData?.data?.map((doctor: any) => (
                              <option key={doctor.id} value={doctor.id}>
                                {doctor.name?.en ||
                                  doctor.name?.ar ||
                                  doctor.id}
                              </option>
                            ))}
                          </select>
                          {detailErrors?.errors.find((err) =>
                            err.path.includes('doctor_id')
                          ) && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                detailErrors.errors.find((err) =>
                                  err.path.includes('doctor_id')
                                )?.message
                              }
                            </p>
                          )}
                        </FormGroup>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                        <FormGroup title="Session Price (ر.س)">
                          <Input
                            type="number"
                            step="0.01"
                            value={String(editingDetail.session_price)}
                            onChange={(e) =>
                              handleDetailFieldChange(
                                'session_price',
                                e.target.value
                              )
                            }
                            placeholder="Enter session price"
                            className="bg-white"
                          />
                          {detailErrors?.errors.find((err) =>
                            err.path.includes('session_price')
                          ) && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                detailErrors.errors.find((err) =>
                                  err.path.includes('session_price')
                                )?.message
                              }
                            </p>
                          )}
                        </FormGroup>

                        <FormGroup title="Session Count">
                          <Input
                            type="number"
                            value={String(editingDetail.session_count)}
                            onChange={(e) =>
                              handleDetailFieldChange(
                                'session_count',
                                e.target.value
                              )
                            }
                            placeholder="Enter session count"
                            className="bg-white"
                          />
                          {detailErrors?.errors.find((err) =>
                            err.path.includes('session_count')
                          ) && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                detailErrors.errors.find((err) =>
                                  err.path.includes('session_count')
                                )?.message
                              }
                            </p>
                          )}
                        </FormGroup>

                        <FormGroup title="Tax Percentage *">
                          <select
                            value={editingDetail.tax_percentage || '15%'}
                            onChange={(e) =>
                              handleDetailFieldChange(
                                'tax_percentage',
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          >
                            {taxPercentageOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {detailErrors?.errors.find((err) =>
                            err.path.includes('tax_percentage')
                          ) && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                detailErrors.errors.find((err) =>
                                  err.path.includes('tax_percentage')
                                )?.message
                              }
                            </p>
                          )}
                        </FormGroup>
                      </div>

                      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                        <Button
                          onClick={() => {
                            setEditingDetail(null);
                            setDetailErrors(null);
                          }}
                          variant="outline"
                          size="lg"
                          type="button"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveDetail}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700"
                          type="button"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <FileText className="h-6 w-6" />
                  Invoice Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <FormGroup title="Additional Notes (Optional)">
                  <Textarea
                    {...register('notes')}
                    placeholder="Add any additional notes, terms, or special instructions for this invoice..."
                    className="min-h-[120px] resize-none bg-white"
                  />
                </FormGroup>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-0 bg-white/90 shadow-xl backdrop-blur-sm">
              <CardHeader className="rounded-t-lg bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Calculator className="h-6 w-6" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center">
                    <p className="mb-2 text-sm font-medium text-blue-600">
                      Total Before Tax
                    </p>
                    <p className="text-2xl font-bold text-blue-800">
                      {Number(watch('total_before_tax'))} ر.س
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 text-center">
                    <p className="mb-2 text-sm font-medium text-emerald-600">
                      Tax (per-line)
                    </p>
                    <p className="text-2xl font-bold text-emerald-800">
                      {Number(watch('tax_total'))} ر.س
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-6 text-center">
                    <p className="mb-2 text-sm font-medium text-red-600">
                      Discount
                    </p>
                    <p className="text-2xl font-bold text-red-800">
                      -{Number(watch('discount'))} ر.س
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-center text-white shadow-lg">
                    <p className="mb-2 text-sm font-medium opacity-90">
                      Grand Total
                    </p>
                    <p className="text-3xl font-bold">
                      {Number(watch('grand_total'))} ر.س
                    </p>
                  </div>
                </div>
                {(detailErrorsArray?.length ?? 0) > 0 && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    <p className="mb-2 font-medium">
                      Please fix the following line-item errors:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-sm">
                      {detailErrorsArray.map((err: any, idx: number) => (
                        <li key={idx}>
                          <strong>Item {idx + 1}:</strong>{' '}
                          {formatErrorItem(err)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <Badge
                      color={
                        watch('status') === 'موافق عليه'
                          ? 'primary'
                          : 'secondary'
                      }
                      className={
                        watch('status') === 'موافق عليه'
                          ? 'border-green-200 bg-green-100 text-green-800'
                          : ''
                      }
                    >
                      {watch('status')}
                    </Badge>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 px-12 py-3 shadow-lg hover:from-blue-700 hover:to-blue-800"
                    disabled={isCreating || isUpdating}
                  >
                    {isCreating || isUpdating ? (
                      <Spinner size="sm" className="mr-2" />
                    ) : null}
                    {initValues ? 'Update Invoice' : 'Create Invoice'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
