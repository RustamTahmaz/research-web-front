import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeaturedFarmersSection = () => {
  const { data: farmers, isLoading } = useQuery({
    queryKey: ["featured-farmers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("farmer_profiles")
        .select(`
          id,
          farm_name,
          farm_location,
          description,
          product_types,
          years_of_experience,
          profiles:user_id (
            full_name
          )
        `)
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Our Farmers
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Meet Our <span className="text-primary">Featured Producers</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover verified farmers bringing fresh, quality produce from across Azerbaijan
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Farmers Yet */}
        {!isLoading && (!farmers || farmers.length === 0) && (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <Leaf className="w-16 h-16 text-primary/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Be the First Farmer!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Join FarmMarket and become a featured producer. Reach thousands of customers directly.
            </p>
            <Link to="/auth?mode=register&role=farmer">
              <Button size="lg">
                <Leaf className="w-4 h-4 mr-2" />
                Register as Farmer
              </Button>
            </Link>
          </div>
        )}

        {/* Farmers Grid */}
        {!isLoading && farmers && farmers.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.map((farmer, index) => (
                <Link
                  key={farmer.id}
                  to={`/farmer/${farmer.id}`}
                  className="group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30 h-full">
                    <div className="h-40 bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                      <Leaf className="w-16 h-16 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {farmer.farm_name}
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="text-sm truncate">{farmer.farm_location}</span>
                      </div>
                      {farmer.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {farmer.description}
                        </p>
                      )}
                      {farmer.product_types && farmer.product_types.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {farmer.product_types.slice(0, 3).map((type: string) => (
                            <Badge key={type} variant="secondary" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {farmer.product_types.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{farmer.product_types.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        {farmer.years_of_experience ? (
                          <span className="text-sm text-muted-foreground">
                            {farmer.years_of_experience}+ years experience
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">New farmer</span>
                        )}
                        <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          View <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/products">
                <Button variant="outline" size="lg">
                  View All Farmers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedFarmersSection;
