import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { formatWhatsAppNumber } from "@/lib/whatsapp";
import { PrintButton } from "@/components/admin/PrintButton";
import { AutoPrint } from "@/components/admin/AutoPrint";

interface OrderItem {
  id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await connection();
  const { id } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number")
      .eq("id", id)
      .single();
    const displayId = data?.order_number || id.split("-")[0].toUpperCase();
    return {
      title: `Slip #${displayId}`,
    };
  } catch {
    const shortId = id.split("-")[0].toUpperCase();
    return {
      title: `Slip #${shortId}`,
    };
  }
}

function OrderSlipSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[148mm] bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse space-y-4 my-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-gray-200 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-6 w-28 bg-gray-200 rounded ml-auto" />
          <div className="h-4 w-20 bg-gray-100 rounded ml-auto" />
        </div>
      </div>
      <div className="h-28 bg-gray-100 rounded-xl mt-4" />
      <div className="h-40 bg-gray-100 rounded-xl mt-4" />
      <div className="h-24 bg-gray-200 rounded-xl mt-4" />
    </div>
  );
}

async function OrderSlipContent({
  paramsPromise,
  searchParamsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
  searchParamsPromise: Promise<{ print?: string }>;
}) {
  await connection();
  const [{ id }, searchParams] = await Promise.all([
    paramsPromise,
    searchParamsPromise,
  ]);
  const supabase = await createClient();

  // 1. Verify admin permissions
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  // 2. Fetch order with order_items
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) {
    notFound();
  }

  const shortId = order.id.split("-")[0].toUpperCase();
  const displayId = order.order_number || shortId;

  const orderDate = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  });

  const whatsappFormatted = formatWhatsAppNumber(WHATSAPP_NUMBER);

  const itemsSubtotal =
    order.order_items?.reduce(
      (sum: number, item: OrderItem) =>
        sum + (Number(item.price) || 0) * (item.quantity || 1),
      0
    ) ?? 0;

  const deliveryFee = Number(order.shipping_fee ?? 0);
  const isCancelled = order.status === "cancelled";
  const isCod =
    (order.payment_method || "").trim().toLowerCase() === "cod" ||
    order.payment_method === null;
  const autoPrint = searchParams.print === "1";

  return (
    <div className="my-4 md:my-8 px-2 sm:px-4">
      {/* Print media setup */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A5 portrait;
              margin: 8mm;
            }
            @media print {
              body {
                background: white !important;
              }
            }
          `,
        }}
      />

      {/* Auto-print trigger if print=1 */}
      <AutoPrint autoPrint={autoPrint} />

      {/* Screen Toolbar */}
      <div className="print:hidden mb-6 flex items-center justify-between gap-4 max-w-[148mm] mx-auto">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to order</span>
        </Link>
        <PrintButton />
      </div>

      {/* Printable Slip Card (A5 Width: 148mm) */}
      <div className="mx-auto w-full max-w-[148mm] bg-white border border-black p-5 sm:p-6 text-black print:border-none print:p-0 print:m-0 print:max-w-none break-inside-avoid shadow-sm print:shadow-none font-sans text-xs sm:text-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-black">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-black">
              Stander Trader
            </h1>
            <p className="text-xs text-black font-semibold mt-1">
              Electronics & Gadgets
            </p>
            <p className="text-xs font-mono tabular-nums text-black mt-0.5">
              WhatsApp: {whatsappFormatted}
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="text-base sm:text-lg font-black font-mono tracking-tight text-black leading-none">
              ORDER #{displayId}
            </p>
            <p className="text-xs font-mono text-black mt-1 font-semibold">
              Date: {orderDate}
            </p>
          </div>
        </div>

        {/* DELIVER TO Box with Thick Border */}
        <div className="border-2 border-black p-3.5 my-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-black mb-1">
            DELIVER TO
          </p>
          <p className="text-base sm:text-lg font-black leading-tight text-black">
            {order.shipping_name || "-"}
          </p>
          <p className="text-sm sm:text-base font-black font-mono tabular-nums text-black mt-1">
            {order.shipping_phone || "-"}
          </p>
          <p className="mt-1.5 text-xs sm:text-sm leading-snug break-words text-black">
            {order.shipping_address || "-"}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-black uppercase tracking-wide text-black">
            {order.shipping_city || "-"}
          </p>
        </div>

        {/* Ordered Items Table */}
        <div className="my-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black text-black">
                <th className="py-1.5 pr-2 font-black text-center w-8">#</th>
                <th className="py-1.5 px-2 font-black">Product</th>
                <th className="py-1.5 px-2 font-black text-center w-12">Qty</th>
                <th className="py-1.5 px-2 font-black text-right w-20 text-[11px]">
                  Price
                </th>
                <th className="py-1.5 pl-2 font-black text-right w-24 text-[11px]">
                  Line Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {order.order_items?.map((item: OrderItem, idx: number) => {
                const lineTotal = (item.price || 0) * (item.quantity || 1);
                return (
                  <tr key={item.id} className="border-b border-black">
                    <td className="py-2 pr-2 text-center font-mono font-bold align-top">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2 font-semibold text-black break-words align-top">
                      {item.product_name}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-black text-sm align-top">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-[11px] align-top text-black">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-2 pl-2 text-right font-mono font-bold text-[11px] align-top text-black">
                      {formatPrice(lineTotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Collect Box (Grouped together to prevent page breaks between them) */}
        <div className="break-inside-avoid">
          {/* Totals Block Aligned Right */}
          <div className="flex justify-end my-3">
            <div className="w-56 space-y-1 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="font-semibold text-black">Subtotal:</span>
                <span className="font-mono tabular-nums font-semibold text-black">
                  {formatPrice(itemsSubtotal)}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="font-semibold text-black">Delivery:</span>
                <span className="font-mono tabular-nums font-semibold text-black">
                  {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="border-t-2 border-black pt-1 flex justify-between font-black text-sm">
                <span>Total:</span>
                <span className="font-mono tabular-nums">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Cash Collection Banner */}
          {isCancelled ? (
            <div className="border-2 border-black p-3 my-3 text-center bg-white">
              <p className="text-base sm:text-lg font-black tracking-wider uppercase text-black">
                *** CANCELLED — DO NOT SHIP ***
              </p>
              <p className="text-xs font-semibold mt-1 text-black">
                This order was cancelled in the system. Do not dispatch this package.
              </p>
            </div>
          ) : isCod ? (
            <div className="border-2 border-black p-3.5 my-3 text-center bg-white">
              <p className="text-xs uppercase font-black tracking-wider text-black">
                COLLECT CASH ON DELIVERY
              </p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-black mt-1 font-mono tabular-nums">
                {formatPrice(order.total)}
              </p>
              <p className="text-[11px] mt-1 font-semibold text-black">
                Please collect the exact cash amount from customer before handing over the parcel.
              </p>
            </div>
          ) : (
            <div className="border-2 border-black p-3.5 my-3 text-center bg-white">
              <p className="text-xs uppercase font-black tracking-wider text-black">
                PAYMENT STATUS
              </p>
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-black mt-1 font-mono">
                PAID
              </p>
              <p className="text-xs mt-1 font-semibold text-black">
                No cash collection required upon delivery.
              </p>
            </div>
          )}
        </div>

        {/* Footer Line */}
        <p className="text-center text-xs text-black font-semibold mt-6 pt-3 border-t border-black">
          Thank you for shopping with Stander Trader!
        </p>
      </div>
    </div>
  );
}

export default function OrderSlipPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  return (
    <Suspense fallback={<OrderSlipSkeleton />}>
      <OrderSlipContent
        paramsPromise={params}
        searchParamsPromise={searchParams}
      />
    </Suspense>
  );
}
