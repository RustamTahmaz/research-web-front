import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_OPTIONS, getCategoryLabel } from "@/lib/categories";
import { MapPin, Package, PlusCircle, Store, Trash2, Pencil } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface FarmerProfile {
  id: string;
  farm_name: string;
  farm_location: string;
  farm_size: string | null;
  years_of_experience: number | null;
  description: string | null;
}

interface FarmerProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  quantity_available: number;
  is_available: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAz = language === "az";

  const [isCreating, setIsCreating] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    unit: "kg",
    quantity: "1",
    description: "",
  });
  const [newProductImage, setNewProductImage] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState({
    name: "",
    category: "",
    price: "",
    unit: "",
    quantity: "",
    description: "",
  });
  const [editProductImage, setEditProductImage] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=login");
    }
  }, [loading, user, navigate]);

  const { data: farmer, isLoading: farmerLoading } = useQuery({
    queryKey: ["farmer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("farmer_profiles")
        .select("id, farm_name, farm_location, farm_size, years_of_experience, description")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as FarmerProfile | null;
    },
    enabled: !!user,
  });

  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ["farmer-products", farmer?.id],
    queryFn: async () => {
      if (!farmer) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, category, price, unit, quantity_available, is_available")
        .eq("farmer_id", farmer.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FarmerProduct[];
    },
    enabled: !!farmer?.id,
  });

  const isBusy = farmerLoading || productsLoading;

  useQuery({
    queryKey: ["farmer-request-counts", farmer?.id],
    queryFn: async () => {
      if (!farmer) return { active: 0, history: 0 };
      const { data, error } = await supabase
        .from("order_requests")
        .select("id, status, farmer_hidden")
        .eq("farmer_id", farmer.id);
      if (error || !data) return { active: 0, history: 0 };
      const active = data.filter(
        (r) =>
          !r.farmer_hidden &&
          ["pending", "approved", "countered", "confirmed"].includes(r.status)
      ).length;
      const history = data.filter(
        (r) => r.farmer_hidden || ["declined", "fulfilled"].includes(r.status)
      ).length;
      return { active, history };
    },
    enabled: !!farmer?.id,
  });

  const categoryOptions = useMemo(() => CATEGORY_OPTIONS, []);

  const uploadProductImage = async (file: File, farmerId: string) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `products/${farmerId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmer) return;

    if (!newProduct.name.trim() || !newProduct.category || !newProduct.price.trim()) {
      toast({
        title: isAz ? "Məlumat çatışmır" : "Missing fields",
        description: isAz ? "Ad, kateqoriya və qiymət tələb olunur." : "Name, category, and price are required.",
        variant: "destructive",
      });
      return;
    }

    const quantityValue = Number(newProduct.quantity);
    if (!Number.isFinite(quantityValue) || quantityValue <= 0) {
      toast({
        title: isAz ? "Yanlış miqdar" : "Invalid quantity",
        description: isAz ? "Miqdar ən azı 1 olmalıdır." : "Quantity must be at least 1.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let imageUrl: string | null = null;
      if (newProductImage) {
        imageUrl = await uploadProductImage(newProductImage, farmer.id);
      }
      const { error } = await supabase.from("products").insert({
        farmer_id: farmer.id,
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: Number(newProduct.price),
        unit: newProduct.unit.trim() || "kg",
        quantity_available: quantityValue,
        description: newProduct.description.trim() || null,
        image_url: imageUrl,
        is_available: true,
      });
      if (error) throw error;
      toast({
        title: isAz ? "Məhsul yaradıldı" : "Product created",
        description: isAz ? "Məhsulunuz artıq bazarda görünür." : "Your product is now visible on the marketplace.",
      });
      setNewProduct({
        name: "",
        category: "",
        price: "",
        unit: "kg",
        quantity: "1",
        description: "",
      });
      setNewProductImage(null);
      await refetchProducts();
    } catch {
      toast({
        title: isAz ? "Yaratmaq alınmadı" : "Create failed",
        description: isAz ? "Yenidən cəhd edin və ya icazələri yoxlayın." : "Please try again or check your permissions.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (product: FarmerProduct) => {
    setEditingId(product.id);
    setEditProduct({
      name: product.name,
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      quantity: String(product.quantity_available),
      description: product.description || "",
    });
    setEditProductImage(null);
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      toast({
        title: isAz ? "Məhsul silindi" : "Product removed",
        description: isAz ? "Elanınız silindi." : "Your listing has been deleted.",
      });
      await refetchProducts();
    } catch {
      toast({
        title: isAz ? "Silmək alınmadı" : "Delete failed",
        description: isAz ? "Yenidən cəhd edin." : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (productId: string) => {
    const quantityValue = Number(editProduct.quantity);
    if (!Number.isFinite(quantityValue)) {
      toast({
        title: isAz ? "Yanlış miqdar" : "Invalid quantity",
        description: isAz ? "Miqdar rəqəm olmalıdır." : "Quantity must be a number.",
        variant: "destructive",
      });
      return;
    }

    if (quantityValue <= 0) {
      await handleDelete(productId);
      setEditingId(null);
      toast({
        title: isAz ? "Stok bitib" : "Out of stock",
        description: isAz ? "Miqdar 0 olduğu üçün elan silindi." : "Product quantity is 0, listing removed.",
      });
      return;
    }

    try {
      let imageUrl: string | null | undefined;
      if (editProductImage && farmer) {
        imageUrl = await uploadProductImage(editProductImage, farmer.id);
      }
      const { error } = await supabase
        .from("products")
        .update({
          category: editProduct.category,
          price: Number(editProduct.price),
          unit: editProduct.unit.trim() || "kg",
          quantity_available: quantityValue,
          description: editProduct.description.trim() || null,
          ...(imageUrl ? { image_url: imageUrl } : {}),
        })
        .eq("id", productId);
      if (error) throw error;
      toast({
        title: isAz ? "Məhsul yeniləndi" : "Product updated",
        description: isAz ? "Dəyişikliklər yadda saxlanıldı." : "Changes saved successfully.",
      });
      setEditingId(null);
      setEditProductImage(null);
      await refetchProducts();
    } catch {
      toast({
        title: isAz ? "Yeniləmə alınmadı" : "Update failed",
        description: isAz ? "Yenidən cəhd edin." : "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || isBusy) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse text-muted-foreground">{isAz ? "Panel yüklənir..." : "Loading dashboard..."}</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user && !farmer) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-3">{isAz ? "Fermer profili tapılmadı" : "Farmer profile not found"}</h1>
            <p className="text-muted-foreground mb-6">
              {isAz ? "Bu hesab müştəri kimi qeydiyyatdan keçib. Yenə də bazara baxa bilərsiniz." : "This account is registered as a customer. You can still browse the marketplace."}
            </p>
            <Link to="/products">
              <Button>{isAz ? "Bazara bax" : "View Marketplace"}</Button>
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
        <section className="py-10">
          <div className="container mx-auto px-4 space-y-10">
            {farmer && (
              <>
                <Card>
                  <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                        <Store className="w-5 h-5 text-primary" />
                        {farmer.farm_name}
                      </h1>
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>{farmer.farm_location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {farmer.farm_size && <Badge variant="secondary">{farmer.farm_size}</Badge>}
                        {farmer.years_of_experience && (
                          <Badge variant="outline">{isAz ? `${farmer.years_of_experience}+ il` : `${farmer.years_of_experience}+ years`}</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <PlusCircle className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold text-foreground">{isAz ? "Məhsul əlavə et" : "Add Product"}</h2>
                    </div>
                    <form onSubmit={handleCreateProduct} className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newName">{isAz ? "Məhsul adı *" : "Product name *"}</Label>
                        <Input
                          id="newName"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder={isAz ? "məs., Təzə pomidor" : "e.g., Fresh Tomatoes"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newCategory">{isAz ? "Kateqoriya *" : "Category *"}</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct((prev) => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger id="newCategory">
                            <SelectValue placeholder={isAz ? "Kateqoriya seçin" : "Select category"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {getCategoryLabel(cat, language)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPrice">{isAz ? "Qiymət (AZN) *" : "Price (AZN) *"}</Label>
                        <Input
                          id="newPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                          placeholder="2.50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newUnit">{isAz ? "Vahid" : "Unit"}</Label>
                        <Input
                          id="newUnit"
                          value={newProduct.unit}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, unit: e.target.value }))}
                          placeholder={isAz ? "məs., kq" : "e.g., kg"}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newQty">{isAz ? "Mövcud miqdar *" : "Quantity available *"}</Label>
                        <Input
                          id="newQty"
                          type="number"
                          min="1"
                          step="1"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="newDesc">{isAz ? "Təsvir" : "Description"}</Label>
                        <Textarea
                          id="newDesc"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder={isAz ? "Qısa təsvir (istəyə bağlı)" : "Short description (optional)"}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="newImage">{isAz ? "Məhsul şəkli" : "Product image"}</Label>
                        <Input
                          id="newImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewProductImage(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <Button type="submit" disabled={isCreating}>
                          {isCreating ? (isAz ? "Yaradılır..." : "Creating...") : (isAz ? "Məhsulu yarat" : "Create Product")}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Package className="w-5 h-5 text-primary" />
                      <h2 className="text-xl font-semibold text-foreground">{isAz ? "Məhsullarınız" : "Your Products"}</h2>
                      <Badge variant="outline">{products?.length || 0}</Badge>
                    </div>
                    {products && products.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {products.map((product) => (
                          <Card key={product.id} className="border border-border/60">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                                  <p className="text-sm text-muted-foreground">{getCategoryLabel(product.category, language)}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => startEdit(product)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    onClick={() => handleDelete(product.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {product.description && (
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                              )}
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>AZN {product.price}/{product.unit}</span>
                                <span>{product.quantity_available} {product.unit} {isAz ? "mövcuddur" : "available"}</span>
                              </div>

                              {editingId === product.id && (
                                <div className="border-t border-border pt-4 space-y-3">
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="space-y-2">
                                      <Label>{isAz ? "Kateqoriya" : "Category"}</Label>
                                      <Select
                                        value={editProduct.category}
                                        onValueChange={(value) =>
                                          setEditProduct((prev) => ({ ...prev, category: value }))
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder={isAz ? "Kateqoriya seçin" : "Select category"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {categoryOptions.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                              {getCategoryLabel(cat, language)}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>{isAz ? "Qiymət (AZN)" : "Price (AZN)"}</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editProduct.price}
                                        onChange={(e) =>
                                          setEditProduct((prev) => ({ ...prev, price: e.target.value }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>{isAz ? "Vahid" : "Unit"}</Label>
                                      <Input
                                        value={editProduct.unit}
                                        onChange={(e) =>
                                          setEditProduct((prev) => ({ ...prev, unit: e.target.value }))
                                        }
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label>{isAz ? "Miqdar" : "Quantity"}</Label>
                                      <Input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editProduct.quantity}
                                        onChange={(e) =>
                                          setEditProduct((prev) => ({ ...prev, quantity: e.target.value }))
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{isAz ? "Təsvir" : "Description"}</Label>
                                    <Textarea
                                      value={editProduct.description}
                                      onChange={(e) =>
                                        setEditProduct((prev) => ({ ...prev, description: e.target.value }))
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>{isAz ? "Şəkli dəyiş" : "Replace image"}</Label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => setEditProductImage(e.target.files?.[0] || null)}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingId(null)}
                                    >
                                      {isAz ? "Ləğv et" : "Cancel"}
                                    </Button>
                                    <Button onClick={() => handleSave(product.id)}>{isAz ? "Yadda saxla" : "Save"}</Button>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {isAz ? "Stokda olmayan məhsulu silmək üçün miqdarı 0 edin." : "Set quantity to 0 to remove out-of-stock items."}
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        {isAz ? "Hələ məhsulunuz yoxdur. İlk elanınızı yuxarıda əlavə edin." : "You do not have any products yet. Add your first listing above."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
