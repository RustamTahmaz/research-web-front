import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, User } from "lucide-react";

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
    user_id: string;
  } | null;
}

interface FarmerProductCount {
  farmerId: string;
  farmName: string;
  farmLocation: string;
  productCount: number;
  products: ProductWithFarmer[];
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "All";

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", category],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
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
            farm_location,
            user_id
          )
        `)
        .eq("is_available", true);

      if (category && category !== "All") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ProductWithFarmer[];
    },
  });

  // Group products by farmer
  const farmerProductCounts: FarmerProductCount[] = products
    ? Object.values(
        products.reduce((acc, product) => {
          if (!product.farmer_profiles) return acc;
          const farmerId = product.farmer_profiles.id;
          if (!acc[farmerId]) {
            acc[farmerId] = {
              farmerId,
              farmName: product.farmer_profiles.farm_name,
              farmLocation: product.farmer_profiles.farm_location,
              productCount: 0,
              products: [],
            };
          }
          acc[farmerId].productCount++;
          acc[farmerId].products.push(product);
          return acc;
        }, {} as Record<string, FarmerProductCount>)
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="secondary" className="mb-4">
                {category === "All" ? "All Products" : category}
              </Badge>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
                {category === "All" ? "All Products" : category} from Local Farmers
              </h1>
              <p className="text-muted-foreground text-lg">
                Browse fresh {category.toLowerCase()} directly from verified producers in Azerbaijan
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Products */}
            {!isLoading && farmerProductCounts.length === 0 && (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  No products available yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Be the first farmer to list {category.toLowerCase()} products!
                </p>
                <Link
                  to="/auth?mode=register&role=farmer"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Register as Farmer
                </Link>
              </div>
            )}

            {/* Farmers Grid */}
            {!isLoading && farmerProductCounts.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farmerProductCounts.map((farmer) => (
                  <Link
                    key={farmer.farmerId}
                    to={`/farmer/${farmer.farmerId}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30 h-full">
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <User className="w-16 h-16 text-primary/50" />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {farmer.farmName}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{farmer.farmLocation}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="bg-primary/5">
                            <Package className="w-3 h-3 mr-1" />
                            {farmer.productCount} {farmer.productCount === 1 ? "product" : "products"}
                          </Badge>
                          <span className="text-sm text-primary font-medium group-hover:underline">
                            View Products →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
