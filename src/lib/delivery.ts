import type { Tables } from "@/integrations/supabase/types";

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

export const estimateDeliveryFee = (distanceKm: number) => {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  return Number((2 + distanceKm * 0.6).toFixed(2));
};

export const formatDeliverySummary = (request: Pick<
  OrderRequest,
  | "delivery_method"
  | "delivery_provider_type"
  | "delivery_schedule_type"
  | "delivery_scheduled_for"
  | "delivery_fee"
>) => {
  if (!request.delivery_method) return "Transport not selected yet";

  if (request.delivery_method === "pickup") {
    return request.delivery_schedule_type === "scheduled" && request.delivery_scheduled_for
      ? `Pickup scheduled for ${new Date(request.delivery_scheduled_for).toLocaleString()}`
      : "Customer pickup";
  }

  const provider = request.delivery_provider_type
    ? DELIVERY_PROVIDER_LABELS[request.delivery_provider_type]
    : "Third-party delivery";

  const timing =
    request.delivery_schedule_type === "scheduled" && request.delivery_scheduled_for
      ? `scheduled for ${new Date(request.delivery_scheduled_for).toLocaleString()}`
      : "as soon as possible";

  return `${provider}, ${timing}, AZN ${request.delivery_fee.toFixed(2)}`;
};
