import { useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { MapPin, Package, Star } from "lucide-react";
import { getCategoryLabel } from "@/lib/categories";
import { useLanguage } from "@/i18n/LanguageProvider";

interface ProductWithFarmer {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  quantity_available: number;
  image_url: string | null;
  farmer_profiles: {
    id: string;
    farm_name: string;
    farm_location: string;
  } | null;
}

type RatingSummary = {
  avg: number;
  count: number;
};

type ReviewRow = {
  product_id: string | null;
  farmer_id: string;
  product_rating: number | null;
  farmer_rating: number | null;
};

const buildRatingMap = (
  reviews: ReviewRow[],
  key: "product_id" | "farmer_id",
  ratingField: "product_rating" | "farmer_rating"
) => {
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const review of reviews) {
    const id = review[key];
    const rating = review[ratingField];
    if (!id || rating === null) continue;
    if (!totals[id]) totals[id] = { sum: 0, count: 0 };
    totals[id].sum += rating;
    totals[id].count += 1;
  }
  const summaries: Record<string, RatingSummary> = {};
  for (const [id, value] of Object.entries(totals)) {
    summaries[id] = {
      avg: value.sum / value.count,
      count: value.count,
    };
  }
  return summaries;
};

const Products = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const isAz = language === "az";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login", { replace: true });
    }
  }, [loading, user, navigate]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["all-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          description,
          category,
          price,
          unit,
          quantity_available,
          image_url,
          farmer_profiles (
            id,
            farm_name,
            farm_location
          )
        `
        )
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProductWithFarmer[];
    },
  });

  const productIds = useMemo(() => products?.map((product) => product.id) ?? [], [products]);
  const farmerIds = useMemo(
    () =>
      products
        ?.map((product) => product.farmer_profiles?.id)
        .filter((id): id is string => Boolean(id)) ?? [],
    [products]
  );

  const { data: reviewRows } = useQuery({
    queryKey: ["order-reviews-summary", productIds, farmerIds],
    queryFn: async () => {
      const filters: string[] = [];
      if (productIds.length > 0) {
        filters.push(`product_id.in.(${productIds.map((id) => `"${id}"`).join(",")})`);
      }
      if (farmerIds.length > 0) {
        filters.push(`farmer_id.in.(${farmerIds.map((id) => `"${id}"`).join(",")})`);
      }

      if (filters.length === 0) return [] as ReviewRow[];

      const { data, error } = await supabase
        .from("order_reviews")
        .select("product_id, farmer_id, product_rating, farmer_rating")
        .or(filters.join(","));

      if (error) throw error;
      return (data ?? []) as ReviewRow[];
    },
    enabled: productIds.length > 0 || farmerIds.length > 0,
  });

  const productRatings = useMemo(
    () => buildRatingMap(reviewRows ?? [], "product_id", "product_rating"),
    [reviewRows]
  );
  const farmerRatings = useMemo(
    () => buildRatingMap(reviewRows ?? [], "farmer_id", "farmer_rating"),
    [reviewRows]
  );

  const { data: requestCounts } = useQuery({
    queryKey: ["my-requests-counts", user?.id],
    queryFn: async () => {
      if (!user) return { active: 0, history: 0 };
      const { data, error } = await supabase
        .from("order_requests")
        .select("id, status, customer_hidden")
        .eq("customer_id", user.id);
      if (error || !data) return { active: 0, history: 0 };
      const active = data.filter(
        (r) =>
          !r.customer_hidden &&
          ["pending", "approved", "countered", "confirmed"].includes(r.status)
      ).length;
      const history = data.filter(
        (r) => r.customer_hidden || ["declined", "fulfilled"].includes(r.status)
      ).length;
      return { active, history };
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4">
                {isAz ? "Bütün məhsullar" : "All Products"}
              </Badge>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {isAz ? "Yerli fermerlərdən bütün məhsullar" : "All Products from Local Farmers"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {isAz ? "Marketplace-də olan bütün mövcud məhsullara baxın." : "Browse every available product in the marketplace."}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Products */}
            {!isLoading && (!products || products.length === 0) && (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {isAz ? "Hələlik məhsul yoxdur" : "No products available yet"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {isAz ? "Fermerlər məhsul əlavə etdikdən sonra burada görünəcək." : "Products will appear here once farmers list them."}
                </p>
                <Link to="/farmers">
                  <span className="text-primary font-medium hover:underline">{isAz ? "Fermerlərə bax" : "View Farmers"} {"->"}</span>
                </Link>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && products && products.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="h-36 bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">
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
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <Badge variant="outline">{getCategoryLabel(product.category, language)}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        {productRatings[product.id] ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium text-foreground">
                              {productRatings[product.id].avg.toFixed(1)}
                            </span>
                            <span>({productRatings[product.id].count})</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{isAz ? "Hələ məhsul reytinqi yoxdur" : "No product ratings yet"}</span>
                        )}
                        {product.farmer_profiles && farmerRatings[product.farmer_profiles.id] ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-medium text-foreground">
                              {farmerRatings[product.farmer_profiles.id].avg.toFixed(1)}
                            </span>
                            <span>{isAz ? "fermer" : "farmer"}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">{isAz ? "Hələ fermer reytinqi yoxdur" : "No farmer ratings yet"}</span>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>AZN {product.price}/{product.unit}</span>
                        <span>{product.quantity_available} {product.unit}</span>
                      </div>
                      {product.farmer_profiles && (
                        <div className="pt-3 border-t border-border">
                          <Link
                            to={`/farmer/${product.farmer_profiles.id}`}
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {product.farmer_profiles.farm_name}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{product.farmer_profiles.farm_location}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
