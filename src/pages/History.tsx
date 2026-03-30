import { useEffect, useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { DELIVERY_STATUS_LABELS, REFUND_STATUS_LABELS, formatDeliverySummary } from "@/lib/delivery";
import { isTransportSchemaError, withTransportDefaults } from "@/lib/orderRequests";

type RequestStatus = "pending" | "approved" | "declined" | "confirmed" | "fulfilled" | "countered";

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
  delivery_status: "pending_pickup" | "in_transit" | "delivered" | null;
  refund_status: "none" | "requested" | "refunded";
  product_id: string;
  farmer_id: string;
  products: {
    name: string;
    unit: string;
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
  delivery_status: "pending_pickup" | "in_transit" | "delivered" | null;
  refund_status: "none" | "requested" | "refunded";
  products: { name: string; unit: string } | null;
  profiles: { full_name: string; email: string } | null;
}

type ReviewRow = {
  id: string;
  order_request_id: string;
  product_rating: number | null;
  product_review_text: string | null;
};

type DeleteTarget =
  | { id: string; role: "customer"; label: string }
  | { id: string; role: "farmer"; label: string }
  | null;

const getPromptedRequestIds = (userId: string) => {
  const storageKey = `farmer_review_prompted_${userId}`;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
};

const setPromptedRequestId = (userId: string, requestId: string) => {
  const storageKey = `farmer_review_prompted_${userId}`;
  const promptedIds = getPromptedRequestIds(userId);
  if (!promptedIds.includes(requestId)) {
    localStorage.setItem(storageKey, JSON.stringify([...promptedIds, requestId]));
  }
};

const History = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const role = user?.user_metadata?.role;
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login", { replace: true });
    }
  }, [loading, user, navigate]);

  const { data: customerRequests, isLoading: customerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ["customer-history-requests", user?.id],
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
          refund_status,
          product_id,
          farmer_id,
          products (
            name,
            unit,
            farmer_profiles (
              farm_name
            )
          )
        `
        )
        .eq("customer_id", user.id)
        .or("status.in.(declined,fulfilled,confirmed),customer_hidden.eq.true")
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
          product_id,
          farmer_id,
          products (
            name,
            unit,
            farmer_profiles (
              farm_name
            )
          )
        `
        )
        .eq("customer_id", user.id)
        .or("status.in.(declined,fulfilled,confirmed),customer_hidden.eq.true")
        .order("created_at", { ascending: false });

      if (fallbackQuery.error) throw fallbackQuery.error;
      return (fallbackQuery.data ?? []).map((row) => withTransportDefaults(row)) as CustomerRequest[];
    },
    enabled: !!user && role === "customer",
  });

  const { data: farmerRequests, isLoading: farmerLoading, refetch: refetchFarmer } = useQuery({
    queryKey: ["farmer-history-requests", user?.id],
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
          refund_status,
          products (
            name,
            unit
          ),
          profiles:customer_id (
            full_name,
            email
          )
        `
        )
        .eq("farmer_id", farmerData.id)
        .or("status.in.(declined,fulfilled),farmer_hidden.eq.true")
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
            name,
            unit
          ),
          profiles:customer_id (
            full_name,
            email
          )
        `
        )
        .eq("farmer_id", farmerData.id)
        .or("status.in.(declined,fulfilled),farmer_hidden.eq.true")
        .order("created_at", { ascending: false });

      if (fallbackQuery.error) throw fallbackQuery.error;
      return (fallbackQuery.data ?? []).map((row) => withTransportDefaults(row)) as FarmerRequest[];
    },
    enabled: !!user && role === "farmer",
  });

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const completedCustomerRequests = useMemo(
    () => customerRequests?.filter((request) => ["fulfilled", "confirmed"].includes(request.status)) ?? [],
    [customerRequests]
  );

  const fulfilledCustomerRequests = useMemo(
    () => customerRequests?.filter((request) => request.status === "fulfilled") ?? [],
    [customerRequests]
  );

  const fulfilledFarmerIds = useMemo(() => {
    const ids = new Set<string>();
    fulfilledCustomerRequests.forEach((request) => ids.add(request.farmer_id));
    return Array.from(ids);
  }, [fulfilledCustomerRequests]);

  const { data: reviewedFarmers, isLoading: reviewedFarmersLoading } = useQuery({
    queryKey: ["customer-reviewed-farmers", user?.id, fulfilledFarmerIds],
    queryFn: async () => {
      if (!user || fulfilledFarmerIds.length === 0) return [];
      const { data, error } = await supabase
        .from("order_reviews")
        .select("farmer_id")
        .eq("customer_id", user.id)
        .not("farmer_rating", "is", null)
        .in("farmer_id", fulfilledFarmerIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: role === "customer" && fulfilledFarmerIds.length > 0,
  });

  const reviewedFarmerSet = useMemo(
    () => new Set((reviewedFarmers ?? []).map((row) => row.farmer_id)),
    [reviewedFarmers]
  );

  const promptTargetRequest = useMemo(() => {
    return fulfilledCustomerRequests.find((request) => !reviewedFarmerSet.has(request.farmer_id)) ?? null;
  }, [fulfilledCustomerRequests, reviewedFarmerSet]);

  const [farmerPromptOpen, setFarmerPromptOpen] = useState(false);

  useEffect(() => {
    if (!user || customerLoading || reviewedFarmersLoading || !promptTargetRequest) {
      setFarmerPromptOpen(false);
      return;
    }
    const promptedIds = getPromptedRequestIds(user.id);
    if (!promptedIds.includes(promptTargetRequest.id)) {
      setFarmerPromptOpen(true);
    } else {
      setFarmerPromptOpen(false);
    }
  }, [customerLoading, promptTargetRequest, reviewedFarmersLoading, user]);

  const reviewRequestIds = useMemo(
    () => completedCustomerRequests.map((request) => request.id),
    [completedCustomerRequests]
  );

  const { data: reviewRows, refetch: refetchReviews } = useQuery({
    queryKey: ["order-reviews-by-request", reviewRequestIds],
    queryFn: async () => {
      if (reviewRequestIds.length === 0) return [];
      const { data, error } = await supabase
        .from("order_reviews")
        .select(
          "id, order_request_id, product_rating, product_review_text"
        )
        .in("order_request_id", reviewRequestIds);
      if (error) throw error;
      return (data ?? []) as ReviewRow[];
    },
    enabled: role === "customer" && reviewRequestIds.length > 0,
  });

  const reviewsByRequest = useMemo(() => {
    const map: Record<string, ReviewRow> = {};
    (reviewRows ?? []).forEach((row) => {
      map[row.order_request_id] = row;
    });
    return map;
  }, [reviewRows]);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<CustomerRequest | null>(null);
  const [productRating, setProductRating] = useState<number | null>(null);
  const [productReviewText, setProductReviewText] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  const openReviewDialog = (request: CustomerRequest) => {
    const existing = reviewsByRequest[request.id];
    setActiveRequest(request);
    setProductRating(existing?.product_rating ?? null);
    setProductReviewText(existing?.product_review_text ?? "");
    setReviewOpen(true);
  };

  const handleSaveReview = async () => {
    if (!user || !activeRequest) return;
    if (!productRating) {
      toast({
        title: "Product rating required",
        description: "Please leave a product rating.",
        variant: "destructive",
      });
      return;
    }
    if (productReviewText && !productRating) {
      toast({
        title: "Missing product rating",
        description: "Product text requires a product rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingReview(true);
    const existing = reviewsByRequest[activeRequest.id];
    const { error } = existing
      ? await supabase
          .from("order_reviews")
          .update({
            product_rating: productRating,
            product_review_text: productReviewText ? productReviewText : null,
          })
          .eq("id", existing.id)
      : await supabase.from("order_reviews").insert({
          order_request_id: activeRequest.id,
          customer_id: user.id,
          farmer_id: activeRequest.farmer_id,
          product_id: activeRequest.product_id,
          product_rating: productRating,
          product_review_text: productReviewText ? productReviewText : null,
        });

    setIsSavingReview(false);
    if (error) {
      toast({
        title: "Review failed",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }
    await refetchReviews();
    toast({
      title: existing ? "Review updated" : "Review submitted",
      description: "Thanks for sharing your feedback.",
    });
    setReviewOpen(false);
  };

  const handleDeleteHistoryItem = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const { error } = await supabase.from("order_requests").delete().eq("id", deleteTarget.id);

    setIsDeleting(false);
    if (error) {
      toast({
        title: "Delete failed",
        description: "This history item could not be removed.",
        variant: "destructive",
      });
      return;
    }

    if (deleteTarget.role === "customer") {
      await refetchCustomer();
      await refetchReviews();
    } else {
      await refetchFarmer();
    }

    toast({
      title: "History deleted",
      description: "The purchase record has been removed from history.",
    });
    setDeleteTarget(null);
  };

  const handleRequestRefund = async (requestId: string) => {
    const { error } = await supabase
      .from("order_requests")
      .update({ refund_status: "requested" })
      .eq("id", requestId);

    if (error) {
      if (isTransportSchemaError(error)) {
        toast({
          title: "Transport migration not applied",
          description: "Apply the new delivery SQL first to use refund status.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Refund request failed",
        description: "Please try again.",
        variant: "destructive",
      });
      return;
    }

    await refetchCustomer();
    toast({
      title: "Refund requested",
      description: "The request is marked for refund review.",
    });
  };

  const renderStars = (value: number | null, onChange: (next: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Star
            className={`h-5 w-5 ${
              (value ?? 0) >= star ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-foreground">Request History</h1>
              <Link to="/requests">
                <Button variant="outline">Back to Active</Button>
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
                  <div className="text-muted-foreground">No history yet.</div>
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
                          {request.delivery_method && (
                            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                              <p className="font-medium text-foreground">Transport</p>
                              <p>{formatDeliverySummary(request)}</p>
                              {request.delivery_status && (
                                <p>Status: {DELIVERY_STATUS_LABELS[request.delivery_status]}</p>
                              )}
                              <p>Refund: {REFUND_STATUS_LABELS[request.refund_status]}</p>
                            </div>
                          )}
                          {request.status === "fulfilled" && (
                            <div className="pt-2">
                              <Button size="sm" variant="outline" onClick={() => openReviewDialog(request)}>
                                {reviewsByRequest[request.id] ? "Edit Product Review" : "Leave Product Review"}
                              </Button>
                            </div>
                          )}
                          {request.status === "confirmed" &&
                            request.delivery_status !== "delivered" &&
                            request.refund_status === "none" && (
                              <Button size="sm" variant="outline" onClick={() => handleRequestRefund(request.id)}>
                                Request Refund
                              </Button>
                            )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setDeleteTarget({
                                id: request.id,
                                role: "customer",
                                label: request.products?.name ?? "this purchase",
                              })
                            }
                          >
                            Delete
                          </Button>
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
                  <div className="text-muted-foreground">No history yet.</div>
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
                          {request.delivery_method && (
                            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                              <p className="font-medium text-foreground">Transport</p>
                              <p>{formatDeliverySummary(request)}</p>
                              {request.delivery_status && (
                                <p>Status: {DELIVERY_STATUS_LABELS[request.delivery_status]}</p>
                              )}
                              <p>Refund: {REFUND_STATUS_LABELS[request.refund_status]}</p>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              setDeleteTarget({
                                id: request.id,
                                role: "farmer",
                                label: request.products?.name ?? "this request",
                              })
                            }
                          >
                            Delete
                          </Button>
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
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewsByRequest[activeRequest?.id ?? ""] ? "Edit Review" : "Leave Review"}</DialogTitle>
            <DialogDescription>
              Share your feedback for {activeRequest?.products?.name ?? "this order"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Product rating</p>
              {renderStars(productRating, setProductRating)}
              <Textarea
                value={productReviewText}
                onChange={(e) => setProductReviewText(e.target.value)}
                placeholder="Product feedback (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={isSavingReview}>
              Cancel
            </Button>
            <Button onClick={handleSaveReview} disabled={isSavingReview}>
              {isSavingReview ? "Saving..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={farmerPromptOpen}
        onOpenChange={(open) => {
          setFarmerPromptOpen(open);
          if (!open && user && promptTargetRequest) {
            setPromptedRequestId(user.id, promptTargetRequest.id);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a farmer review?</DialogTitle>
            <DialogDescription>
              {promptTargetRequest?.products?.farmer_profiles?.farm_name
                ? `Would you like to review ${promptTargetRequest.products.farmer_profiles.farm_name}?`
                : "Would you like to leave a review for the farmer you purchased from?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFarmerPromptOpen(false);
              }}
            >
              Not now
            </Button>
            {promptTargetRequest && (
              <Button
                onClick={() => {
                  setFarmerPromptOpen(false);
                  navigate(`/farmer/${promptTargetRequest.farmer_id}?review=1`);
                }}
              >
                Go to Farmer Page
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this history item?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This will permanently remove ${deleteTarget.label} from your history. Reviews linked to this purchase will also be removed.`
                : "This will permanently remove this history item."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteHistoryItem} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
