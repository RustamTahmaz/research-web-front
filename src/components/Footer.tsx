import { Leaf, Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    marketplace: [
      { name: "Browse Products", href: "#" },
      { name: "Categories", href: "#" },
      { name: "Featured Farmers", href: "#" },
      { name: "Special Offers", href: "#" },
    ],
    farmers: [
      { name: "Start Selling", href: "#" },
      { name: "Seller Dashboard", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Success Stories", href: "#" },
    ],
    support: [
      { name: "Help Center", href: "#" },
      { name: "Contact Us", href: "#" },
      { name: "FAQs", href: "#" },
      { name: "Delivery Info", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
    ],
  };

  return (
    <footer id="about" className="bg-foreground text-primary-foreground pt-16 lg:pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg">FarmMarket</span>
                <span className="text-xs block text-primary-foreground/60">Azerbaijan</span>
              </div>
            </a>
            <p className="text-primary-foreground/70 text-sm mb-6 max-w-xs">
              Connecting Azerbaijan's smallholder farmers directly with buyers. 
              Fresh produce, fair prices, sustainable agriculture.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary flex items-center justify-center transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Farmers</h4>
            <ul className="space-y-2">
              {footerLinks.farmers.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap justify-center gap-6 lg:gap-10 py-8 border-t border-primary-foreground/10 mb-8">
          <a href="mailto:info@farmmarket.az" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <Mail className="w-4 h-4" />
            info@farmmarket.az
          </a>
          <a href="tel:+994123456789" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
            <Phone className="w-4 h-4" />
            +994 12 345 67 89
          </a>
          <span className="flex items-center gap-2 text-sm text-primary-foreground/70">
            <MapPin className="w-4 h-4" />
            Baku, Azerbaijan
          </span>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-primary-foreground/10 text-sm text-primary-foreground/60">
          <p>&copy; {currentYear} FarmMarket Azerbaijan. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
