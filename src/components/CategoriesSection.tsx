import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES } from "@/lib/categories";

const CategoriesSection = () => {
  const { user } = useAuth();
  const role = user?.user_metadata?.role;
  const productsHref = !user ? "/auth?mode=login" : role === "customer" ? "/products" : "/dashboard";
  const categoryHref = (name: string) =>
    !user
      ? "/auth?mode=login"
      : role === "customer"
      ? `/farmers?category=${encodeURIComponent(name)}`
      : "/dashboard";

  return (
    <section id="products" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Fresh Categories
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            Explore Our <span className="text-primary">Product Range</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From fresh fruits to organic dairy, discover quality products directly from local farmers
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category.name}
              to={categoryHref(category.name)}
              className="group relative bg-card rounded-2xl p-6 lg:p-8 border border-border hover:border-primary/30 shadow-soft hover:shadow-medium transition-all duration-300 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-xl ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <category.icon className="w-7 h-7 lg:w-8 lg:h-8" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Browse products
              </p>
              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to={productsHref}>
            <Button variant="outline" size="lg">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
