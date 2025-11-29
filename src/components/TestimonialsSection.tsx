import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ilham Aliyev",
    role: "Farmer, Ganja Region",
    content: "Before FarmMarket, I sold my tomatoes to middlemen for almost nothing. Now I connect directly with restaurants in Baku and earn 40% more. This platform changed my life.",
    rating: 5,
    avatar: "I",
  },
  {
    name: "Aysel Mammadova",
    role: "Restaurant Owner, Baku",
    content: "The quality of produce is incredible. I can trace exactly which farm my vegetables come from. My customers love knowing their food is truly fresh and local.",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Rashid Hasanov",
    role: "Farmer, Lankaran",
    content: "The platform is so easy to use, even for someone like me who's not tech-savvy. I list my citrus fruits and receive orders within hours. The delivery tracking is excellent.",
    rating: 5,
    avatar: "R",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4">
            What Our <span className="text-primary">Community</span> Says
          </h2>
          <p className="text-muted-foreground text-lg">
            Real stories from farmers and buyers who have transformed their businesses
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="bg-card rounded-2xl p-6 lg:p-8 border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Quote className="w-5 h-5 text-primary" />
              </div>

              {/* Content */}
              <p className="text-foreground/80 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
