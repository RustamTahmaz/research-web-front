import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Package, ArrowLeft, Leaf, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCategoryLabel } from "@/lib/categories";
import { useLanguage } from "@/i18n/LanguageProvider";

const FarmerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const role = user?.user_metadata?.role;
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAz = language === "az";
  const shouldPromptReview = searchParams.get("review") === "1";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login", { replace: true });
    }
  }, [loading, user, navigate]);

  const { data: farmer, isLoading: farmerLoading } = useQuery({
    queryKey: ["farmer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farmer_profiles")
        .select(`
          id,
          farm_name,
          farm_location,
          farm_size,
          description,
          years_of_experience,
          product_types,
          created_at,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["farmer-products", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("farmer_id", id)
        .eq("is_available", true);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: reviewRows, refetch: refetchFarmerRating } = useQuery({
    queryKey: ["farmer-review-summary", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_reviews")
        .select("farmer_id, farmer_rating")
        .eq("farmer_id", id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const farmerRating = useMemo(() => {
    if (!reviewRows || reviewRows.length === 0) return null;
    const ratings = reviewRows
      .map((row) => row.farmer_rating)
      .filter((rating): rating is number => rating !== null);
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return {
      avg: sum / ratings.length,
      count: ratings.length,
    };
  }, [reviewRows]);

  const { data: fulfilledOrders } = useQuery({
    queryKey: ["customer-fulfilled-orders", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return [];
      const { data, error } = await supabase
        .from("order_requests")
        .select("id, product_id, created_at")
        .eq("customer_id", user.id)
        .eq("farmer_id", id)
        .eq("status", "fulfilled")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: role === "customer" && !!user && !!id,
  });

  const { data: existingFarmerReview, refetch: refetchFarmerReview } = useQuery({
    queryKey: ["existing-farmer-review", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data, error } = await supabase
        .from("order_reviews")
        .select("id, farmer_rating, farmer_review_text, order_request_id")
        .eq("customer_id", user.id)
        .eq("farmer_id", id)
        .not("farmer_rating", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
    enabled: role === "customer" && !!user && !!id,
  });

  const eligibleOrder = useMemo(() => fulfilledOrders?.[0] ?? null, [fulfilledOrders]);

  const { data: existingOrderReview } = useQuery({
    queryKey: ["order-review-for-eligible-order", eligibleOrder?.id],
    queryFn: async () => {
      if (!eligibleOrder?.id) return null;
      const { data, error } = await supabase
        .from("order_reviews")
        .select("id, order_request_id")
        .eq("order_request_id", eligibleOrder.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!eligibleOrder?.id,
  });

  const { data: latestReviews, refetch: refetchLatestReviews } = useQuery({
    queryKey: ["farmer-latest-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_reviews")
        .select(
          `
          id,
          created_at,
          product_rating,
          product_review_text,
          farmer_rating,
          farmer_review_text,
          products (
            name
          ),
          profiles:customer_id (
            full_name
          )
        `
        )
        .eq("farmer_id", id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!id,
  });

  const isLoading = farmerLoading || productsLoading;
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestedQty, setRequestedQty] = useState<Record<string, string>>({});
  const [requestedMessage, setRequestedMessage] = useState<Record<string, string>>({});
  const [farmerReviewOpen, setFarmerReviewOpen] = useState(false);
  const [farmerReviewRating, setFarmerReviewRating] = useState<number | null>(null);
  const [farmerReviewText, setFarmerReviewText] = useState("");
  const [isSavingFarmerReview, setIsSavingFarmerReview] = useState(false);

  useEffect(() => {
    if (shouldPromptReview && role === "customer" && eligibleOrder) {
      setFarmerReviewOpen(true);
    }
  }, [shouldPromptReview, role, eligibleOrder]);

  const openFarmerReviewDialog = () => {
    setFarmerReviewRating(existingFarmerReview?.farmer_rating ?? null);
    setFarmerReviewText(existingFarmerReview?.farmer_review_text ?? "");
    setFarmerReviewOpen(true);
  };

  const handleSaveFarmerReview = async () => {
    if (!user || !id || !eligibleOrder) return;
    if (!farmerReviewRating) {
      toast({
        title: isAz ? "Fermer reytinqi tələb olunur" : "Farmer rating required",
        description: isAz ? "Zəhmət olmasa fermer üçün reytinq verin." : "Please leave a farmer rating.",
        variant: "destructive",
      });
      return;
    }
    setIsSavingFarmerReview(true);

    let error: Error | null = null;
    if (existingFarmerReview) {
      const { error: updateError } = await supabase
        .from("order_reviews")
        .update({
          farmer_rating: farmerReviewRating,
          farmer_review_text: farmerReviewText ? farmerReviewText : null,
        })
        .eq("id", existingFarmerReview.id);
      error = updateError as Error | null;
    } else if (existingOrderReview) {
      const { error: updateError } = await supabase
        .from("order_reviews")
        .update({
          farmer_rating: farmerReviewRating,
          farmer_review_text: farmerReviewText ? farmerReviewText : null,
        })
        .eq("id", existingOrderReview.id);
      error = updateError as Error | null;
    } else {
      const { error: insertError } = await supabase.from("order_reviews").insert({
        order_request_id: eligibleOrder.id,
        customer_id: user.id,
        farmer_id: id,
        product_id: eligibleOrder.product_id,
        farmer_rating: farmerReviewRating,
        farmer_review_text: farmerReviewText ? farmerReviewText : null,
      });
      error = insertError as Error | null;
    }

    setIsSavingFarmerReview(false);
    if (error) {
      toast({
        title: isAz ? "Rəy göndərilmədi" : "Review failed",
        description: isAz ? "Yenidən cəhd edin." : "Please try again.",
        variant: "destructive",
      });
      return;
    }
    await refetchFarmerReview();
    await refetchFarmerRating();
    await refetchLatestReviews();
    toast({
      title: existingFarmerReview
        ? isAz ? "Rəy yeniləndi" : "Review updated"
        : isAz ? "Rəy göndərildi" : "Review submitted",
      description: isAz ? "Rəyiniz üçün təşəkkür edirik." : "Thanks for sharing your feedback.",
    });
    setFarmerReviewOpen(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <Skeleton className="h-64 lg:col-span-1" />
              <div className="lg:col-span-2">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-8" />
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-20 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{isAz ? "Fermer tapılmadı" : "Farmer Not Found"}</h1>
            <p className="text-muted-foreground mb-6">
              {isAz ? "Bu fermer profili mövcud deyil və ya silinib." : "This farmer profile doesn't exist or has been removed."}
            </p>
            <Link to="/farmers">
              <Button>{isAz ? "Bütün fermerlərə bax" : "Browse All Farmers"}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            <Link
              to="/farmers"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {isAz ? "Fermerlərə qayıt" : "Back to Farmers"}
            </Link>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <Card className="lg:col-span-1 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <Leaf className="w-20 h-20 text-primary/60" />
                </div>
                <CardContent className="p-6">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {farmer.farm_name}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{farmer.farm_location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    {farmerRating ? (
                      <>
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-foreground">
                          {farmerRating.avg.toFixed(1)}
                        </span>
                        <span>({farmerRating.count})</span>
                      </>
                    ) : (
                      <span>{isAz ? "Hələ reytinq yoxdur" : "No ratings yet"}</span>
                    )}
                  </div>
                  {role === "customer" && (
                    <div className="mb-4">
                      {eligibleOrder ? (
                        <Button size="sm" variant="outline" onClick={openFarmerReviewDialog}>
                          {existingFarmerReview
                            ? isAz ? "Fermer rəylərini redaktə et" : "Edit Farmer Review"
                            : isAz ? "Fermerə rəy yaz" : "Leave Farmer Review"}
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {isAz ? "Rəy yazmaq üçün bu fermerdən alış edin." : "Purchase from this farmer to leave a review."}
                        </p>
                      )}
                    </div>
                  )}
                  {farmer.years_of_experience && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{isAz ? `${farmer.years_of_experience} il təcrübə` : `${farmer.years_of_experience} years of experience`}</span>
                    </div>
                  )}
                  {farmer.farm_size && (
                    <Badge variant="secondary" className="mb-4">
                      {farmer.farm_size}
                    </Badge>
                  )}
                  {farmer.description && (
                    <p className="text-muted-foreground text-sm mt-4">
                      {farmer.description}
                    </p>
                  )}
                  {farmer.product_types && farmer.product_types.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {farmer.product_types.map((type: string) => (
                        <Badge key={type} variant="outline" className="bg-primary/5">
                          {getCategoryLabel(type, language)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {isAz ? "Mövcud məhsullar" : "Available Products"}
                  </h2>
                  <Badge variant="secondary">
                    {products?.length || 0} {isAz ? "məhsul" : "products"}
                  </Badge>
                </div>

                {products && products.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Package className="w-10 h-10 text-muted-foreground" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                            <Badge variant="outline">{getCategoryLabel(product.category, language)}</Badge>
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              AZN {product.price}/{product.unit}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {product.quantity_available} {product.unit} {isAz ? "mövcuddur" : "available"}
                            </span>
                          </div>
                          {role === "customer" && (
                            <div className="mt-4 border-t border-border pt-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  max={product.quantity_available}
                                  value={requestedQty[product.id] || ""}
                                  onChange={(e) =>
                                    setRequestedQty((prev) => ({ ...prev, [product.id]: e.target.value }))
                                  }
                                  placeholder={isAz ? `Miqdar (maks. ${product.quantity_available})` : `Qty (max ${product.quantity_available})`}
                                />
                                <Button
                                  onClick={async () => {
                                    const qty = Number(requestedQty[product.id]);
                                    if (!user || !id) return;
                                    if (!Number.isFinite(qty) || qty <= 0) {
                                      toast({
                                        title: isAz ? "Yanlış miqdar" : "Invalid quantity",
                                        description: isAz ? "Düzgün miqdar daxil edin." : "Please enter a valid quantity.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    if (qty > product.quantity_available) {
                                      toast({
                                        title: isAz ? "Miqdar çoxdur" : "Too many",
                                        description: isAz ? "İstənilən miqdar mövcud saydan çoxdur." : "Requested quantity exceeds availability.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    setRequestingId(product.id);
                                    const { error } = await supabase
                                      .from("order_requests")
                                      .insert({
                                        product_id: product.id,
                                        farmer_id: id,
                                        customer_id: user.id,
                                        requested_quantity: qty,
                                        customer_message: requestedMessage[product.id] || null,
                                        status: "pending",
                                      });
                                    setRequestingId(null);
                                    if (error) {
                                      toast({
                                        title: isAz ? "Sorğu alınmadı" : "Request failed",
                                        description: isAz ? "Yenidən cəhd edin." : "Please try again.",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    toast({
                                      title: isAz ? "Sorğu göndərildi" : "Request sent",
                                      description: isAz ? "Fermer sorğunu nəzərdən keçirəcək." : "The farmer will review your request.",
                                    });
                                    setRequestedQty((prev) => ({ ...prev, [product.id]: "" }));
                                    setRequestedMessage((prev) => ({ ...prev, [product.id]: "" }));
                                  }}
                                  disabled={requestingId === product.id}
                                >
                                  {requestingId === product.id ? (isAz ? "Göndərilir..." : "Sending...") : (isAz ? "Sorğu göndər" : "Request")}
                                </Button>
                              </div>
                              <Textarea
                                value={requestedMessage[product.id] || ""}
                                onChange={(e) =>
                                  setRequestedMessage((prev) => ({ ...prev, [product.id]: e.target.value }))
                                }
                                placeholder={isAz ? "Fermer üçün əlavə qeyd (istəyə bağlı)" : "Optional message to farmer"}
                              />
                              <p className="text-xs text-muted-foreground">
                                {isAz ? "Fermer təsdiqlədikdən sonra sifarişi təsdiq edə biləcəksiniz." : "You will be able to confirm after the farmer approves."}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {isAz ? "Bu fermer hələ məhsul yerləşdirməyib." : "This farmer hasn't listed any products yet."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">{isAz ? "Son rəylər" : "Latest Reviews"}</h2>
                <Badge variant="secondary">{latestReviews?.length ?? 0} {isAz ? "rəy" : "reviews"}</Badge>
              </div>
              {latestReviews && latestReviews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {latestReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">
                            {review.profiles?.full_name ?? (isAz ? "Müştəri" : "Customer")}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString(language === "az" ? "az-AZ" : "en-US")}
                          </span>
                        </div>
                        {review.products?.name && (
                          <p className="text-xs text-muted-foreground">{isAz ? "Məhsul" : "Product"}: {review.products.name}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {review.farmer_rating ? (
                            <>
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium text-foreground">{review.farmer_rating.toFixed(1)}</span>
                              <span>{isAz ? "fermer" : "farmer"}</span>
                            </>
                          ) : (
                            <span>{isAz ? "Fermer reytinqi yoxdur" : "No farmer rating"}</span>
                          )}
                        </div>
                        {review.farmer_review_text && (
                          <p className="text-sm text-muted-foreground">{review.farmer_review_text}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {review.product_rating ? (
                            <>
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="font-medium text-foreground">{review.product_rating.toFixed(1)}</span>
                              <span>{isAz ? "məhsul" : "product"}</span>
                            </>
                          ) : (
                            <span>{isAz ? "Məhsul reytinqi yoxdur" : "No product rating"}</span>
                          )}
                        </div>
                        {review.product_review_text && (
                          <p className="text-sm text-muted-foreground">{review.product_review_text}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/30 rounded-xl text-muted-foreground">
                  {isAz ? "Hələ rəy yoxdur." : "No reviews yet."}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Dialog open={farmerReviewOpen} onOpenChange={setFarmerReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{existingFarmerReview ? (isAz ? "Fermer rəyini redaktə et" : "Edit Farmer Review") : (isAz ? "Fermerə rəy yaz" : "Leave Farmer Review")}</DialogTitle>
            <DialogDescription>
              {isAz ? `${farmer?.farm_name ?? "bu fermer"} haqqında rəyinizi paylaşın.` : `Share your feedback about ${farmer?.farm_name ?? "this farmer"}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{isAz ? "Fermer reytinqi" : "Farmer rating"}</p>
            {renderStars(farmerReviewRating, setFarmerReviewRating)}
            <Textarea
              value={farmerReviewText}
              onChange={(e) => setFarmerReviewText(e.target.value)}
              placeholder={isAz ? "Fermer haqqında rəy (istəyə bağlı)" : "Farmer feedback (optional)"}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFarmerReviewOpen(false)} disabled={isSavingFarmerReview}>
              {isAz ? "Ləğv et" : "Cancel"}
            </Button>
            <Button onClick={handleSaveFarmerReview} disabled={isSavingFarmerReview || !eligibleOrder}>
              {isSavingFarmerReview ? (isAz ? "Yadda saxlanılır..." : "Saving...") : (isAz ? "Rəyi göndər" : "Submit Review")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDetail;
