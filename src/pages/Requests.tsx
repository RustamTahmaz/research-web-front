import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  DELIVERY_PROVIDER_LABELS,
  DELIVERY_SCHEDULE_LABELS,
  DELIVERY_STATUS_LABELS,
  formatDeliverySummary,
} from "@/lib/delivery";
import { isTransportSchemaError, withTransportDefaults } from "@/lib/orderRequests";

type RequestStatus = "pending" | "approved" | "declined" | "confirmed" | "fulfilled" | "countered";
type DeliveryStatus = "pending_pickup" | "in_transit" | "delivered";

interface CustomerRequest {
  id: string;
  requested_quantity: number;
  counter_quantity: number | null;
  farmer_message: string | null;
  customer_hidden: boolean;
  status: RequestStatus;
  delivery_method: "pickup" | "third_party" | null;
  delivery_provider_type: "farmer" | "company" | "local_carrier" | null;
  delivery_schedule_type: "asap" | "scheduled" | null;
  delivery_scheduled_for: string | null;
  delivery_fee: number;
  delivery_status: DeliveryStatus | null;
  products: {
    id: string;
    name: string;
    unit: string;
    price: number;
    farmer_profiles: { farm_name: string } | null;
  } | null;
}

interface FarmerRequest {
  id: string;
  requested_quantity: number;
  counter_quantity: number | null;
  customer_message: string | null;
  farmer_message: string | null;
  farmer_hidden: boolean;
  status: RequestStatus;
  delivery_method: "pickup" | "third_party" | null;
  delivery_provider_type: "farmer" | "company" | "local_carrier" | null;
  delivery_schedule_type: "asap" | "scheduled" | null;
  delivery_scheduled_for: string | null;
  delivery_fee: number;
  delivery_status: DeliveryStatus | null;
  delivery_notes: string | null;
  products: { id: string; name: string; unit: string; price: number } | null;
  profiles: { full_name: string; email: string } | null;
}

const Requests = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const role = user?.user_metadata?.role;

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login", { replace: true });
    }
  }, [loading, user, navigate]);

  const { data: customerRequests, isLoading: customerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ["customer-active-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const transportQuery = await supabase
        .from("order_requests")
        .select(
          `
          id,
          requested_quantity,
          counter_quantity,
          farmer_message,
          customer_hidden,
          status,
          delivery_method,
          delivery_provider_type,
          delivery_schedule_type,
          delivery_scheduled_for,
          delivery_fee,
          delivery_status,
          products (
            id,
            name,
            unit,
            price,
            farmer_profiles (
              farm_name
            )
          )
        `
        )
        .eq("customer_id", user.id)
        .eq("customer_hidden", false)
        .in("status", ["pending", "approved", "countered"])
        .order("created_at", { ascending: false });

      if (transportQuery.error && !isTransportSchemaError(transportQuery.error)) {
        throw transportQuery.error;
      }

      if (!transportQuery.error) {
        return (transportQuery.data ?? []).map((row) => withTransportDefaults(row)) as CustomerRequest[];
      }

      const fallbackQuery = await supabase
        .from("order_requests")
        .select(
          `
          id,
          requested_quantity,
          counter_quantity,
          farmer_message,
          customer_hidden,
          status,
          products (
            id,
            name,
            unit,
            price,
            farmer_profiles (
              farm_name
            )
          )
        `
        )
        .eq("customer_id", user.id)
        .eq("customer_hidden", false)
        .in("status", ["pending", "approved", "countered"])
        .order("created_at", { ascending: false });

      if (fallbackQuery.error) throw fallbackQuery.error;
      return (fallbackQuery.data ?? []).map((row) => withTransportDefaults(row)) as CustomerRequest[];
    },
    enabled: !!user && role === "customer",
  });

  const { data: farmerRequests, isLoading: farmerLoading, refetch: refetchFarmer } = useQuery({
    queryKey: ["farmer-active-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: farmerData } = await supabase
        .from("farmer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!farmerData) return [];
      const transportQuery = await supabase
        .from("order_requests")
        .select(
          `
          id,
          requested_quantity,
          counter_quantity,
          customer_message,
          farmer_message,
          farmer_hidden,
          status,
          delivery_method,
          delivery_provider_type,
          delivery_schedule_type,
          delivery_scheduled_for,
          delivery_fee,
          delivery_status,
          delivery_notes,
          products (
            id,
            name,
            unit,
            price
          ),
          profiles:customer_id (
            full_name,
            email
          )
        `
        )
        .eq("farmer_id", farmerData.id)
        .eq("farmer_hidden", false)
        .in("status", ["pending", "approved", "countered", "confirmed"])
        .order("created_at", { ascending: false });

      if (transportQuery.error && !isTransportSchemaError(transportQuery.error)) {
        throw transportQuery.error;
      }

      if (!transportQuery.error) {
        return (transportQuery.data ?? []).map((row) => withTransportDefaults(row)) as FarmerRequest[];
      }

      const fallbackQuery = await supabase
        .from("order_requests")
        .select(
          `
          id,
          requested_quantity,
          counter_quantity,
          customer_message,
          farmer_message,
          farmer_hidden,
          status,
          products (
            id,
            name,
            unit,
            price
          ),
          profiles:customer_id (
            full_name,
            email
          )
        `
        )
        .eq("farmer_id", farmerData.id)
        .eq("farmer_hidden", false)
        .in("status", ["pending", "approved", "countered", "confirmed"])
        .order("created_at", { ascending: false });

      if (fallbackQuery.error) throw fallbackQuery.error;
      return (fallbackQuery.data ?? []).map((row) => withTransportDefaults(row)) as FarmerRequest[];
    },
    enabled: !!user && role === "farmer",
  });

  const [counterValues, setCounterValues] = useState<Record<string, string>>({});
  const [counterMessages, setCounterMessages] = useState<Record<string, string>>({});

  const handleCustomerDecline = async (requestId: string) => {
    const { error } = await supabase
      .from("order_requests")
      .update({ status: "declined" })
      .eq("id", requestId);
    if (!error) {
      await refetchCustomer();
    }
  };

  const handleFarmerUpdate = async (requestId: string, status: RequestStatus) => {
    const { error } = await supabase
      .from("order_requests")
      .update({ status })
      .eq("id", requestId);
    if (!error) {
      await refetchFarmer();
    }
  };

  const handleFarmerCounter = async (requestId: string, qty: number, note: string | null) => {
    const { error } = await supabase
      .from("order_requests")
      .update({
        status: "countered",
        counter_quantity: qty,
        farmer_message: note,
      })
      .eq("id", requestId);
    if (!error) {
      await refetchFarmer();
    }
  };

  const handleDeliveryStatusUpdate = async (requestId: string, deliveryStatus: DeliveryStatus) => {
    const update: {
      delivery_status: DeliveryStatus;
      status?: RequestStatus;
    } = { delivery_status: deliveryStatus };

    if (deliveryStatus === "delivered") {
      update.status = "fulfilled";
    }

    const { error } = await supabase.from("order_requests").update(update).eq("id", requestId);
    if (!error) {
      await refetchFarmer();
    }
  };

  const transportConfigured =
    customerRequests?.some((request) => request.delivery_method !== null) ||
    farmerRequests?.some((request) => request.delivery_method !== null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-foreground">Active Requests</h1>
              <Link to="/history">
                <Button variant="outline">View History</Button>
              </Link>
            </div>

            {role === "customer" && (
              <>
                {customerLoading && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {!customerLoading && (!customerRequests || customerRequests.length === 0) && (
                  <div className="text-muted-foreground">No active requests.</div>
                )}
                {!customerLoading && customerRequests && customerRequests.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {customerRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{request.products?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {request.products?.farmer_profiles?.farm_name}
                              </p>
                            </div>
                            <Badge variant="secondary">{request.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.requested_quantity} {request.products?.unit}
                          </div>
                          {request.status === "countered" && request.counter_quantity && (
                            <div className="text-sm text-muted-foreground">
                              Countered to {request.counter_quantity} {request.products?.unit}
                            </div>
                          )}
                          {request.farmer_message && (
                            <div className="text-xs text-muted-foreground">
                              Note: {request.farmer_message}
                            </div>
                          )}
                          {request.delivery_method && (
                            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                              <p className="font-medium text-foreground">Transport</p>
                              <p>{formatDeliverySummary(request)}</p>
                              {request.delivery_status && (
                                <p>Status: {DELIVERY_STATUS_LABELS[request.delivery_status]}</p>
                              )}
                            </div>
                          )}
                          {request.status === "approved" && (
                            <Link to={`/checkout/${request.id}`}>
                              <Button size="sm">Confirm Order</Button>
                            </Link>
                          )}
                          {request.status === "countered" && (
                            <div className="flex gap-2">
                              <Link to={`/checkout/${request.id}`}>
                                <Button size="sm">Accept Counter</Button>
                              </Link>
                              <Button size="sm" variant="outline" onClick={() => handleCustomerDecline(request.id)}>
                                Decline
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {role === "farmer" && (
              <>
                {farmerLoading && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {!farmerLoading && (!farmerRequests || farmerRequests.length === 0) && (
                  <div className="text-muted-foreground">No active requests.</div>
                )}
                {!farmerLoading && farmerRequests && farmerRequests.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {farmerRequests.map((request) => (
                      <Card key={request.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-foreground">{request.products?.name}</p>
                              <p className="text-xs text-muted-foreground">{request.profiles?.full_name}</p>
                            </div>
                            <Badge variant="secondary">{request.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {request.requested_quantity} {request.products?.unit}
                          </div>
                          {request.customer_message && (
                            <div className="text-xs text-muted-foreground">
                              Customer: {request.customer_message}
                            </div>
                          )}
                          {request.delivery_method && (
                            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                              <p className="font-medium text-foreground">Transport plan</p>
                              <p>{formatDeliverySummary(request)}</p>
                              {request.delivery_provider_type && (
                                <p>Provider: {DELIVERY_PROVIDER_LABELS[request.delivery_provider_type]}</p>
                              )}
                              {request.delivery_schedule_type && (
                                <p>Timing: {DELIVERY_SCHEDULE_LABELS[request.delivery_schedule_type]}</p>
                              )}
                              {request.delivery_status && (
                                <p>Status: {DELIVERY_STATUS_LABELS[request.delivery_status]}</p>
                              )}
                              {request.delivery_notes && <p>Notes: {request.delivery_notes}</p>}
                            </div>
                          )}
                          {request.status === "pending" && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleFarmerUpdate(request.id, "approved")}>
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleFarmerUpdate(request.id, "declined")}>
                                  Decline
                                </Button>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const qty = Number(counterValues[request.id]);
                                    if (!Number.isFinite(qty) || qty <= 0) return;
                                    handleFarmerCounter(request.id, qty, counterMessages[request.id] || null);
                                  }}
                                >
                                  Counter
                                </Button>
                                <input
                                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                  type="number"
                                  min="1"
                                  placeholder="Counter qty"
                                  value={counterValues[request.id] || ""}
                                  onChange={(e) =>
                                    setCounterValues((prev) => ({ ...prev, [request.id]: e.target.value }))
                                  }
                                />
                              </div>
                              <textarea
                                className="min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                placeholder="Optional note to customer"
                                value={counterMessages[request.id] || ""}
                                onChange={(e) =>
                                  setCounterMessages((prev) => ({ ...prev, [request.id]: e.target.value }))
                                }
                              />
                            </div>
                          )}
                          {request.status === "confirmed" && transportConfigured && (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant={request.delivery_status === "pending_pickup" ? "default" : "outline"}
                                  onClick={() => handleDeliveryStatusUpdate(request.id, "pending_pickup")}
                                >
                                  Pending Pickup
                                </Button>
                                {request.delivery_method === "third_party" && (
                                  <Button
                                    size="sm"
                                    variant={request.delivery_status === "in_transit" ? "default" : "outline"}
                                    onClick={() => handleDeliveryStatusUpdate(request.id, "in_transit")}
                                  >
                                    In Transit
                                  </Button>
                                )}
                                <Button size="sm" onClick={() => handleDeliveryStatusUpdate(request.id, "delivered")}>
                                  Mark Delivered
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Requests;
