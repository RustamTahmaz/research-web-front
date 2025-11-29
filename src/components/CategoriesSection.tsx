import { Apple, Carrot, Egg, Milk, Wheat, Grape, Cherry, Salad } from "lucide-react";

const categories = [
  { name: "Fruits", icon: Apple, color: "bg-red-100 text-red-600", count: 234 },
  { name: "Vegetables", icon: Carrot, color: "bg-orange-100 text-orange-600", count: 189 },
  { name: "Dairy", icon: Milk, color: "bg-blue-100 text-blue-600", count: 76 },
  { name: "Eggs", icon: Egg, color: "bg-amber-100 text-amber-600", count: 54 },
  { name: "Grains", icon: Wheat, color: "bg-yellow-100 text-yellow-700", count: 98 },
  { name: "Grapes", icon: Grape, color: "bg-purple-100 text-purple-600", count: 67 },
  { name: "Berries", icon: Cherry, color: "bg-pink-100 text-pink-600", count: 45 },
  { name: "Greens", icon: Salad, color: "bg-green-100 text-green-600", count: 112 },
];

const CategoriesSection = () => {
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
          {categories.map((category, index) => (
            <a
              key={category.name}
              href="#"
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
                {category.count} products
              </p>
              {/* Hover Arrow */}
              <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
