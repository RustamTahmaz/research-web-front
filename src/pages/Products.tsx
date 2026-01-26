import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Package } from "lucide-react";

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

const Products = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4">
                All Products
              </Badge>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                All Products from Local Farmers
              </h1>
              <p className="text-muted-foreground text-lg">
                Browse every available product in the marketplace.
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
                  No products available yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Products will appear here once farmers list them.
                </p>
                <Link to="/farmers">
                  <span className="text-primary font-medium hover:underline">View Farmers {"->"}</span>
                </Link>
              </div>
            )}

            {/* Products Grid */}
            {!isLoading && products && products.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="h-36 bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center">
                      <Package className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <Badge variant="outline">{product.category}</Badge>
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
                          <p className="text-sm font-medium text-foreground">
                            {product.farmer_profiles.farm_name}
                          </p>
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
