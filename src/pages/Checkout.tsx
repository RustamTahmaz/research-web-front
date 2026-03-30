import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DELIVERY_PROVIDER_LABELS, estimateDeliveryFee } from "@/lib/delivery";
import { isTransportSchemaError, withTransportDefaults } from "@/lib/orderRequests";

type RequestStatus = "pending" | "approved" | "declined" | "confirmed" | "fulfilled" | "countered";
type DeliveryMethod = "pickup" | "third_party";
type DeliveryProviderType = "farmer" | "company" | "local_carrier";
type DeliveryScheduleType = "asap" | "scheduled";

interface RequestDetail {
  id: string;
  requested_quantity: number;
  counter_quantity: number | null;
  status: RequestStatus;
  delivery_method: DeliveryMethod | null;
  delivery_provider_type: DeliveryProviderType | null;
  delivery_address: string | null;
  delivery_distance_km: number | null;
  delivery_fee: number;
  delivery_schedule_type: DeliveryScheduleType | null;
  delivery_scheduled_for: string | null;
  delivery_notes: string | null;
  products: {
    name: string;
    unit: string;
    price: number;
    farmer_profiles: { farm_name: string } | null;
  } | null;
}

const Checkout = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isPaying, setIsPaying] = useState(false);
  const [transportAvailable, setTransportAvailable] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [deliveryProviderType, setDeliveryProviderType] = useState<DeliveryProviderType>("farmer");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState("");
  const [deliveryScheduleType, setDeliveryScheduleType] = useState<DeliveryScheduleType>("asap");
  const [deliveryScheduledFor, setDeliveryScheduledFor] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login", { replace: true });
    }
  }, [loading, user, navigate]);

  const { data: request, isLoading } = useQuery({
    queryKey: ["checkout-request", id],
    queryFn: async () => {
      if (!id) return null;
      const transportQuery = await supabase
        .from("order_requests")
        .select(
          `
          id,
          requested_quantity,
          counter_quantity,
          status,
          delivery_method,
          delivery_provider_type,
          delivery_address,
          delivery_distance_km,
          delivery_fee,
          delivery_schedule_type,
          delivery_scheduled_for,
          delivery_notes,
          products (
            name,
            unit,
            price,
            farmer_profiles (
              farm_name
            )
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (transportQuery.error && !isTransportSchemaError(transportQuery.error)) {
        throw transportQuery.error;
      }

      if (!transportQuery.error) {
        setTransportAvailable(true);
        return transportQuery.data ? (withTransportDefaults(transportQuery.data) as RequestDetail) : null;
      }

      const fallbackQuery = await supabase
        .from("order_requests")
        .select(
          `
          id,
          requested_quantity,
          counter_quantity,
          status,
          products (
            name,
            unit,
            price,
            farmer_profiles (
              farm_name
            )
          )
        `
        )
        .eq("id", id)
        .maybeSingle();

      if (fallbackQuery.error) throw fallbackQuery.error;
      setTransportAvailable(false);
      return fallbackQuery.data ? (withTransportDefaults(fallbackQuery.data) as RequestDetail) : null;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (!request) return;
    setDeliveryMethod(request.delivery_method ?? "pickup");
    setDeliveryProviderType(request.delivery_provider_type ?? "farmer");
    setDeliveryAddress(request.delivery_address ?? "");
    setDeliveryDistanceKm(
      request.delivery_distance_km !== null && request.delivery_distance_km !== undefined
        ? String(request.delivery_distance_km)
        : ""
    );
    setDeliveryScheduleType(request.delivery_schedule_type ?? "asap");
    setDeliveryScheduledFor(
      request.delivery_scheduled_for ? new Date(request.delivery_scheduled_for).toISOString().slice(0, 16) : ""
    );
    setDeliveryNotes(request.delivery_notes ?? "");
  }, [request]);

  const payableQuantity =
    request?.status === "countered" && request.counter_quantity ? request.counter_quantity : request?.requested_quantity ?? 0;
  const productTotal = payableQuantity * (request?.products?.price || 0);
  const parsedDistance = Number(deliveryDistanceKm);
  const deliveryFee = deliveryMethod === "pickup" ? 0 : estimateDeliveryFee(parsedDistance);
  const grandTotal = productTotal + deliveryFee;

  const handlePay = async () => {
    if (!id) return;
    if (transportAvailable && deliveryMethod === "third_party") {
      if (!deliveryAddress.trim()) {
        toast({
          title: "Delivery address required",
          description: "Please add a delivery address for third-party transport.",
          variant: "destructive",
        });
        return;
      }
      if (!Number.isFinite(parsedDistance) || parsedDistance <= 0) {
        toast({
          title: "Distance required",
          description: "Please enter an estimated delivery distance.",
          variant: "destructive",
        });
        return;
      }
    }
    if (transportAvailable && deliveryScheduleType === "scheduled" && !deliveryScheduledFor) {
      toast({
        title: "Schedule required",
        description: "Please choose a delivery or pickup time.",
        variant: "destructive",
      });
      return;
    }

    setIsPaying(true);
    if (transportAvailable) {
      const { error: updateError } = await supabase
        .from("order_requests")
        .update({
          delivery_method: deliveryMethod,
          delivery_provider_type: deliveryMethod === "third_party" ? deliveryProviderType : null,
          delivery_address: deliveryMethod === "third_party" ? deliveryAddress.trim() : null,
          delivery_distance_km: deliveryMethod === "third_party" ? parsedDistance : null,
          delivery_fee: deliveryMethod === "third_party" ? deliveryFee : 0,
          delivery_schedule_type: deliveryScheduleType,
          delivery_scheduled_for:
            deliveryScheduleType === "scheduled" && deliveryScheduledFor
              ? new Date(deliveryScheduledFor).toISOString()
              : null,
          delivery_notes: deliveryNotes.trim() ? deliveryNotes.trim() : null,
          delivery_status: "pending_pickup",
          refund_status: "none",
        })
        .eq("id", id);

      if (updateError) {
        setIsPaying(false);
        toast({
          title: "Transport setup failed",
          description: "Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await supabase.rpc("confirm_order", { p_request_id: id });
    setIsPaying(false);
    if (error) {
      toast({
        title: "Payment failed",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Payment successful",
      description: "Your order is confirmed.",
    });
    navigate("/requests");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground mb-6">Checkout</h1>
              <Card>
                <CardContent className="p-6 space-y-4">
                  {isLoading && <div className="text-muted-foreground">Loading...</div>}
                  {!isLoading && !request && (
                    <div className="text-muted-foreground">Request not found.</div>
                  )}
                  {!isLoading && request && (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{request.products?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.products?.farmer_profiles?.farm_name}
                          </p>
                        </div>
                        <Badge variant="secondary">{request.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Quantity:{" "}
                        {request.status === "countered" && request.counter_quantity
                          ? request.counter_quantity
                          : request.requested_quantity}{" "}
                        {request.products?.unit}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Unit price: AZN {request.products?.price}
                      </div>
                      <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
                        <div>
                          <p className="font-semibold text-foreground">Transport Plan</p>
                          <p className="text-sm text-muted-foreground">
                            {transportAvailable
                              ? "Choose how the order should move after confirmation."
                              : "Transport fields are hidden until the new delivery migration is applied in Supabase."}
                          </p>
                        </div>

                        {transportAvailable && (
                          <>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setDeliveryMethod("pickup")}
                                className={`rounded-2xl border p-4 text-left transition-colors ${
                                  deliveryMethod === "pickup"
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background"
                                }`}
                              >
                                <p className="font-medium text-foreground">Customer Pickup</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  No delivery fee. Customer checks and collects directly.
                                </p>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeliveryMethod("third_party")}
                                className={`rounded-2xl border p-4 text-left transition-colors ${
                                  deliveryMethod === "third_party"
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-background"
                                }`}
                              >
                                <p className="font-medium text-foreground">Third-Party Delivery</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Unified flow for farmer delivery, companies, or local carriers.
                                </p>
                              </button>
                            </div>

                            {deliveryMethod === "third_party" && (
                              <div className="space-y-3">
                                <div className="grid sm:grid-cols-3 gap-2">
                                  {(["farmer", "company", "local_carrier"] as DeliveryProviderType[]).map((provider) => (
                                    <button
                                      key={provider}
                                      type="button"
                                      onClick={() => setDeliveryProviderType(provider)}
                                      className={`rounded-xl border px-3 py-2 text-sm ${
                                        deliveryProviderType === provider
                                          ? "border-primary bg-primary/5 text-foreground"
                                          : "border-border text-muted-foreground"
                                      }`}
                                    >
                                      {DELIVERY_PROVIDER_LABELS[provider]}
                                    </button>
                                  ))}
                                </div>
                                <Input
                                  value={deliveryAddress}
                                  onChange={(e) => setDeliveryAddress(e.target.value)}
                                  placeholder="Delivery address"
                                />
                                <Input
                                  type="number"
                                  min="1"
                                  step="0.5"
                                  value={deliveryDistanceKm}
                                  onChange={(e) => setDeliveryDistanceKm(e.target.value)}
                                  placeholder="Estimated distance in km"
                                />
                              </div>
                            )}

                            <div className="space-y-3">
                              <div className="grid sm:grid-cols-2 gap-2">
                                {(["asap", "scheduled"] as DeliveryScheduleType[]).map((schedule) => (
                                  <button
                                    key={schedule}
                                    type="button"
                                    onClick={() => setDeliveryScheduleType(schedule)}
                                    className={`rounded-xl border px-3 py-2 text-sm ${
                                      deliveryScheduleType === schedule
                                        ? "border-primary bg-primary/5 text-foreground"
                                        : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    {schedule === "asap" ? "As Soon As Possible" : "Schedule Time"}
                                  </button>
                                ))}
                              </div>
                              {deliveryScheduleType === "scheduled" && (
                                <Input
                                  type="datetime-local"
                                  value={deliveryScheduledFor}
                                  onChange={(e) => setDeliveryScheduledFor(e.target.value)}
                                />
                              )}
                              <Textarea
                                value={deliveryNotes}
                                onChange={(e) => setDeliveryNotes(e.target.value)}
                                placeholder="Optional transport notes, pickup instruction, or contact detail"
                              />
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        Product total: AZN {productTotal.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Delivery fee: AZN {deliveryFee.toFixed(2)}
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        Grand total: AZN {grandTotal.toFixed(2)}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handlePay} disabled={isPaying || !["approved", "countered"].includes(request.status)}>
                          {isPaying ? "Processing..." : "Pay (Test)"}
                        </Button>
                        <Link to="/requests">
                          <Button variant="outline">Back</Button>
                        </Link>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
