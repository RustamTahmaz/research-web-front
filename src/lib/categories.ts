import { Apple, Carrot, Egg, Milk, Wheat, Grape, Cherry, Salad } from "lucide-react";

export const CATEGORIES = [
  { name: "Fruits", icon: Apple, color: "bg-red-100 text-red-600" },
  { name: "Vegetables", icon: Carrot, color: "bg-orange-100 text-orange-600" },
  { name: "Dairy", icon: Milk, color: "bg-blue-100 text-blue-600" },
  { name: "Eggs", icon: Egg, color: "bg-amber-100 text-amber-600" },
  { name: "Grains", icon: Wheat, color: "bg-yellow-100 text-yellow-700" },
  { name: "Grapes", icon: Grape, color: "bg-purple-100 text-purple-600" },
  { name: "Berries", icon: Cherry, color: "bg-pink-100 text-pink-600" },
  { name: "Greens", icon: Salad, color: "bg-green-100 text-green-600" },
];

export const CATEGORY_OPTIONS = CATEGORIES.map((category) => category.name);
