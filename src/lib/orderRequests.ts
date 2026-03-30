type QueryError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
} | null;

const TRANSPORT_SCHEMA_TOKENS = [
  "delivery_method",
  "delivery_provider_type",
  "delivery_schedule_type",
  "delivery_scheduled_for",
  "delivery_distance_km",
  "delivery_fee",
  "delivery_status",
  "delivery_notes",
  "refund_status",
];

export const isTransportSchemaError = (error: QueryError) => {
  if (!error) return false;

  const text = [error.message, error.details, error.hint, error.code].filter(Boolean).join(" ").toLowerCase();
  return TRANSPORT_SCHEMA_TOKENS.some((token) => text.includes(token));
};

export const withTransportDefaults = <T extends object>(row: T) => {
  return {
    delivery_method: null,
    delivery_provider_type: null,
    delivery_address: null,
    delivery_distance_km: null,
    delivery_fee: 0,
    delivery_schedule_type: null,
    delivery_scheduled_for: null,
    delivery_status: null,
    delivery_notes: null,
    refund_status: "none" as const,
    ...row,
  };
};
