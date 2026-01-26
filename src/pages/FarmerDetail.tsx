import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Calendar, Package, ArrowLeft, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const FarmerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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

  const isLoading = farmerLoading || productsLoading;

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
            <h1 className="text-2xl font-bold text-foreground mb-2">Farmer Not Found</h1>
            <p className="text-muted-foreground mb-6">This farmer profile doesn't exist or has been removed.</p>
            <Link to="/farmers">
              <Button>Browse All Farmers</Button>
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
            {/* Back Button */}
            <Link
              to="/farmers"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Farmers
            </Link>

            {/* Farmer Header */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Farmer Card */}
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
                  {farmer.years_of_experience && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{farmer.years_of_experience} years of experience</span>
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
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Products Grid */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Available Products
                  </h2>
                  <Badge variant="secondary">
                    {products?.length || 0} products
                  </Badge>
                </div>

                {products && products.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-32 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{product.name}</h3>
                            <Badge variant="outline">{product.category}</Badge>
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
                              {product.quantity_available} {product.unit} available
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/30 rounded-xl">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      This farmer hasn't listed any products yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerDetail;
