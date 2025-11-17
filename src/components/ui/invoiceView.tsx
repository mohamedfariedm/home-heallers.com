"use client";
import React, { useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QRCode from "react-qr-code";

type ApiDetail = {
  id: number;
  invoice_id: number;
  client_id: number | null;
  category?: { id: number; name: { en: string; ar: string } };
  customer_name: string;
  national_id: string | null;
  service_name: string;
  service_code: string;
  service_id?: number;
  doctor_id: number;
  session_price: string | number;
  session_count: string | number;
  tax_percentage?: string;
};

type ApiInvoice = {
  id: number;
  invoice_number: string;
  invoice_date: string;
  category?: { id: number; name: { en: string; ar: string } };
  discount: string;
  total_before_tax: string;
  tax_total: string;
  tax_percentage: string;
  national_id?: string | null;
  grand_total: string;
  balance_due: string;
  status: string;
  notes?: string | null;
  creator?: { id: number; name: { en: string; ar: string }; email: string };
  details: ApiDetail[];
};

interface InvoiceViewProps {
  invoiceData: ApiInvoice;
}

const parseNum = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (v: unknown) => parseNum(v).toFixed(2);

const normalizeTaxLabel = (tp?: string) => {
  if (!tp) return "0%";
  if (tp === "معافاه") return "0%";
  if (tp.endsWith("%")) return tp;
  const n = Number(tp);
  return Number.isFinite(n) ? `${n}%` : tp;
};

const taxRateFrom = (tp?: string) => {
  if (!tp || tp === "معافاه") return 0;
  if (tp.endsWith("%")) return parseNum(tp) / 100;
  const n = Number(tp);
  return Number.isFinite(n) ? n / 100 : 0;
};

export default function InvoiceView({ invoiceData }: InvoiceViewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const qrValue = `https://home-healers-web.vercel.app/invoice/${invoiceData.id}`;

  // Calculate items
  const {
    rows,
    subtotal,
    taxTotal,
    discountTotal,
    grandTotal,
    balanceDue,
    headerTaxLabelToShow,
  } = useMemo(() => {
    const details = invoiceData.details || [];

    const baseRows = details.map((d, idx) => {
      const price = parseNum(d.session_price);
      const qty = parseNum(d.session_count);
      const lineBeforeTax = price * qty;

      const rate = taxRateFrom(d.tax_percentage);
      const rateLabel = normalizeTaxLabel(d.tax_percentage);
      const lineTax = lineBeforeTax * rate;

      return {
        i: idx + 1,
        serviceLabel: d.category?.name?.ar || d.category?.name?.en || "",
        customerName: d.customer_name,
        qty,
        price,
        lineBeforeTax,
        lineTax,
        taxLabel: rateLabel,
      };
    });

    const subtotal = baseRows.reduce((s, r) => s + r.lineBeforeTax, 0);
    const discountTotal = parseNum(invoiceData.discount);

    const rowsWithDiscount = baseRows.map((r) => {
      const lineDiscount =
        subtotal > 0 && discountTotal > 0
          ? (r.lineBeforeTax / subtotal) * discountTotal
          : 0;
      const lineTotal = r.lineBeforeTax - lineDiscount + r.lineTax;
      return { ...r, lineDiscount, lineTotal };
    });

    const taxTotal = rowsWithDiscount.reduce((s, r) => s + r.lineTax, 0);

    const grandTotal = subtotal - discountTotal + taxTotal;
    const balanceDue = grandTotal;

    const taxedLabels = new Set(
      rowsWithDiscount
        .filter((r) => r.lineTax > 0)
        .map((r) => r.taxLabel)
        .filter((lbl) => lbl !== "0%" && lbl !== "معافاه")
    );

    const headerTaxLabelToShow =
      taxedLabels.size === 1 ? Array.from(taxedLabels)[0] : "";

    return {
      rows: rowsWithDiscount,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal,
      balanceDue,
      headerTaxLabelToShow,
    };
  }, [invoiceData.details, invoiceData.discount]);

  // ------------------------------------------------------
  // ✅ UPDATED DOWNLOAD FUNCTION — SEND FULL HTML + CSS
  // ------------------------------------------------------
const downloadPdf = async () => {
  const invoiceElement = document.getElementById("invoice");
  if (!invoiceElement) return;

  const html = invoiceElement.innerHTML;

  const res = await fetch("/api/generate-invoice", {
    method: "POST",
    body: JSON.stringify({ html }),
    headers: { "Content-Type": "application/json" },
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "invoice.pdf";
  a.click();
};


  // Your embedded logo for the QR center
  const logoBase64 =
    "data:image/png;base64,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";

  return (
    <div className=" w-[850px] mx-auto p-6 bg-white" dir="rtl">
      <div className="flex justify-center items-center mb-4">
        <Button
          onClick={downloadPdf}
          className="mb-4 bg-blue-600 text-white hover:bg-blue-700"
        >
          تحميل الفاتورة كـ PDF
        </Button>
      </div>

      {/* A4 container */}
      <div
        id="invoice"
        style={{
          width: "794px",
          margin: "0 auto",
          background: "white",
          padding: "20px",
        }}
      >
        <Card ref={invoiceRef} className="p-8 shadow-lg">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-right">
              <h1 className="text-2xl font-bold mb-2">فاتورة ضريبية مبسطة</h1>
              <p className="text-sm text-muted-foreground">
                مؤسسة ابتكارات الرعاية الطبية
              </p>
            </div>

            <img src={logoBase64} className="w-24 h-auto ml-4" alt="Logo" />
          </div>

          {/* META */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="text-right">
              <h3 className="font-bold mb-4">المبيعات</h3>

              {invoiceData.notes && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-1">الملاحظات</h4>
                  <p className="text-sm whitespace-normal w-[300px]">
                    {invoiceData.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">الحالة:</span>
                <span>{invoiceData.status}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">رقم الفاتورة:</span>
                <span>{invoiceData.invoice_number}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">تاريخ:</span>
                <span>{invoiceData.invoice_date}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">الفئة:</span>
                <span>
                  {invoiceData.category?.name?.ar ||
                    invoiceData.category?.name?.en}
                </span>
              </div>

              <div className="flex justify-between bg-gray-100 px-3 py-2 rounded">
                <span className="font-medium">الرصيد:</span>
                <span className="font-bold">{fmt(balanceDue)} ر.س</span>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3">#</th>
                  <th className="border p-3">اسم الفئة</th>
                  <th className="border p-3">اسم العميل</th>
                  <th className="border p-3">الكمية</th>
                  <th className="border p-3">سعر الوحدة</th>
                  <th className="border p-3">الخصم</th>
                  <th className="border p-3">قبل الضريبة</th>
                  <th className="border p-3">الضريبة</th>
                  <th className="border p-3">الإجمالي</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="border p-3 text-center" colSpan={9}>
                      لا توجد عناصر
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.i}>
                      <td className="border p-3 text-center">{r.i}</td>
                      <td className="border p-3 text-right">
                        {r.serviceLabel}
                      </td>
                      <td className="border p-3 text-right">
                        {r.customerName}
                      </td>
                      <td className="border p-3 text-center">{r.qty}</td>
                      <td className="border p-3 text-center">
                        {fmt(r.price)} ر.س
                      </td>

                      <td className="border p-3 text-center">
                        {r.lineDiscount > 0
                          ? `${fmt(r.lineDiscount)} ر.س`
                          : "0 ر.س"}
                      </td>

                      <td className="border p-3 text-center">
                        {fmt(r.lineBeforeTax)} ر.س
                      </td>

                      <td className="border p-3 text-center">
                        {r.lineTax > 0
                          ? `${fmt(r.lineTax)} ر.س (${r.taxLabel})`
                          : r.taxLabel === "معافاه"
                          ? "معافاه"
                          : "0 ر.س"}
                      </td>

                      <td className="border p-3 text-center">
                        {fmt(r.lineTotal)} ر.س
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* SUMMARY + QR */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="flex justify-center items-center">
              <QRCode value={qrValue} size={128} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>الإجمالي قبل الضريبة:</span>
                <span className="font-bold">{fmt(subtotal)} ر.س</span>
              </div>

              <div className="flex justify-between">
                <span>
                  إجمالي الضريبة
                  {headerTaxLabelToShow ? ` (${headerTaxLabelToShow})` : ""}
                </span>
                <span className="font-bold">{fmt(taxTotal)} ر.س</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between">
                  <span>الخصم:</span>
                  <span className="font-bold">-{fmt(discountTotal)} ر.س</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>المجموع:</span>
                <span className="font-bold">{fmt(grandTotal)} ر.س</span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">المبلغ المستحق:</span>
                <span className="font-bold text-lg">
                  {fmt(balanceDue)} ر.س
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t pt-6 text-center">
            <h4 className="font-bold mb-2">التوقيع</h4>
            <div className="mb-4">الإلكترونية سجدة</div>

            <p className="text-sm text-muted-foreground">
              مدة صلاحية الجلسات 6 أشهر من تاريخ الشراء - لا يحق للمراجع
              استرداد المبلغ بعد البدء بالجلسات
            </p>
          </div>

          {/* PAGE NUMBER */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Page 1 of 1 — Invoice #{invoiceData.invoice_number}
          </div>
        </Card>
      </div>
    </div>
  );
}
