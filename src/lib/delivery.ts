import type { Tables } from "@/integrations/supabase/types";
import type { Language } from "@/i18n/LanguageProvider";

type OrderRequest = Tables<"order_requests">;

export const DELIVERY_METHOD_LABELS: Record<NonNullable<OrderRequest["delivery_method"]>, string> = {
  pickup: "Customer Pickup",
  third_party: "Third-Party Delivery",
};

export const DELIVERY_PROVIDER_LABELS: Record<NonNullable<OrderRequest["delivery_provider_type"]>, string> = {
  farmer: "Farmer Delivery",
  company: "Delivery Company",
  local_carrier: "Local Carrier",
};

export const DELIVERY_STATUS_LABELS: Record<NonNullable<OrderRequest["delivery_status"]>, string> = {
  pending_pickup: "Pending Pickup",
  in_transit: "In Transit",
  delivered: "Delivered",
};

export const DELIVERY_SCHEDULE_LABELS: Record<NonNullable<OrderRequest["delivery_schedule_type"]>, string> = {
  asap: "As Soon As Possible",
  scheduled: "Scheduled Time",
};

export const REFUND_STATUS_LABELS: Record<OrderRequest["refund_status"], string> = {
  none: "No Refund",
  requested: "Refund Requested",
  refunded: "Refunded",
};

const DELIVERY_METHOD_LABELS_AZ: Record<NonNullable<OrderRequest["delivery_method"]>, string> = {
  pickup: "Müştəri götürməsi",
  third_party: "Üçüncü tərəf çatdırılması",
};

const DELIVERY_PROVIDER_LABELS_AZ: Record<NonNullable<OrderRequest["delivery_provider_type"]>, string> = {
  farmer: "Fermer çatdırılması",
  company: "Çatdırılma şirkəti",
  local_carrier: "Yerli daşıyıcı",
};

const DELIVERY_STATUS_LABELS_AZ: Record<NonNullable<OrderRequest["delivery_status"]>, string> = {
  pending_pickup: "Götürülmə gözlənilir",
  in_transit: "Yoldadır",
  delivered: "Çatdırılıb",
};

const DELIVERY_SCHEDULE_LABELS_AZ: Record<NonNullable<OrderRequest["delivery_schedule_type"]>, string> = {
  asap: "Mümkün qədər tez",
  scheduled: "Planlaşdırılmış vaxt",
};

const REFUND_STATUS_LABELS_AZ: Record<OrderRequest["refund_status"], string> = {
  none: "Geri ödəniş yoxdur",
  requested: "Geri ödəniş istənilib",
  refunded: "Geri ödənilib",
};

export const estimateDeliveryFee = (distanceKm: number) => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Number((2 + distanceKm * 0.6).toFixed(2));
};

export const getDeliveryMethodLabel = (
  value: NonNullable<OrderRequest["delivery_method"]>,
  language: Language
) => (language === "az" ? DELIVERY_METHOD_LABELS_AZ[value] : DELIVERY_METHOD_LABELS[value]);

export const getDeliveryProviderLabel = (
  value: NonNullable<OrderRequest["delivery_provider_type"]>,
  language: Language
) => (language === "az" ? DELIVERY_PROVIDER_LABELS_AZ[value] : DELIVERY_PROVIDER_LABELS[value]);

export const getDeliveryStatusLabel = (
  value: NonNullable<OrderRequest["delivery_status"]>,
  language: Language
) => (language === "az" ? DELIVERY_STATUS_LABELS_AZ[value] : DELIVERY_STATUS_LABELS[value]);

export const getDeliveryScheduleLabel = (
  value: NonNullable<OrderRequest["delivery_schedule_type"]>,
  language: Language
) => (language === "az" ? DELIVERY_SCHEDULE_LABELS_AZ[value] : DELIVERY_SCHEDULE_LABELS[value]);

export const getRefundStatusLabel = (value: OrderRequest["refund_status"], language: Language) =>
  language === "az" ? REFUND_STATUS_LABELS_AZ[value] : REFUND_STATUS_LABELS[value];

export const formatDeliverySummary = (request: Pick<
  OrderRequest,
  | "delivery_method"
  | "delivery_provider_type"
  | "delivery_schedule_type"
  | "delivery_scheduled_for"
  | "delivery_fee"
>,
language: Language = "en"
) => {
  if (!request.delivery_method) {
    return language === "az" ? "Çatdırılma seçilməyib" : "Transport not selected yet";
  }

  if (request.delivery_method === "pickup") {
    return request.delivery_schedule_type === "scheduled" && request.delivery_scheduled_for
      ? language === "az"
        ? `Götürülmə vaxtı: ${new Date(request.delivery_scheduled_for).toLocaleString()}`
        : `Pickup scheduled for ${new Date(request.delivery_scheduled_for).toLocaleString()}`
      : language === "az"
        ? "Müştəri götürməsi"
        : "Customer pickup";
  }

  const provider = request.delivery_provider_type
    ? getDeliveryProviderLabel(request.delivery_provider_type, language)
    : language === "az"
      ? "Üçüncü tərəf çatdırılması"
      : "Third-party delivery";

  const timing =
    request.delivery_schedule_type === "scheduled" && request.delivery_scheduled_for
      ? language === "az"
        ? `${new Date(request.delivery_scheduled_for).toLocaleString()} üçün planlaşdırılıb`
        : `scheduled for ${new Date(request.delivery_scheduled_for).toLocaleString()}`
      : language === "az"
        ? "mümkün qədər tez"
        : "as soon as possible";

  return `${provider}, ${timing}, AZN ${request.delivery_fee.toFixed(2)}`;
};
