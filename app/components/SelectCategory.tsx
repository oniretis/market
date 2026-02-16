"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { getCategoryItems } from "../actions";
import { useState, useEffect } from "react";
import {
  Home,
  Smartphone,
  Car,
  Package,
  Shirt,
  Book,
  Gamepad2,
  Music,
  Camera,
  Heart,
  Star,
  Zap,
  Coffee,
  Pizza,
  Dumbbell,
  Baby,
  Palette,
  Wrench,
  Plane,
  Gift,
  ShoppingBag
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  title: string;
  image: string;
}

function CategoryIcon({ iconName }: { iconName: string }) {
  const iconMap: { [key: string]: React.ReactNode } = {
    'home': <Home className="h-6 w-6" />,
    'smartphone': <Smartphone className="h-6 w-6" />,
    'car': <Car className="h-6 w-6" />,
    'package': <Package className="h-6 w-6" />,
    'shirt': <Shirt className="h-6 w-6" />,
    'book': <Book className="h-6 w-6" />,
    'gamepad': <Gamepad2 className="h-6 w-6" />,
    'music': <Music className="h-6 w-6" />,
    'camera': <Camera className="h-6 w-6" />,
    'heart': <Heart className="h-6 w-6" />,
    'star': <Star className="h-6 w-6" />,
    'zap': <Zap className="h-6 w-6" />,
    'coffee': <Coffee className="h-6 w-6" />,
    'pizza': <Pizza className="h-6 w-6" />,
    'dumbbell': <Dumbbell className="h-6 w-6" />,
    'baby': <Baby className="h-6 w-6" />,
    'palette': <Palette className="h-6 w-6" />,
    'wrench': <Wrench className="h-6 w-6" />,
    'plane': <Plane className="h-6 w-6" />,
    'gift': <Gift className="h-6 w-6" />,
    'shopping': <ShoppingBag className="h-6 w-6" />,
  };

  return iconMap[iconName.toLowerCase()] || <Package className="h-6 w-6" />;
}

export function SelectCategory() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    getCategoryItems().then(setCategories);
  }, []);

  return (
    <div className="grid gird-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      <input type="hidden" name="category" value={selectedCategory || ""} />
      {categories.map((item) => (
        <div key={item.id} className="cursor-pointer">
          <Card
            className={
              selectedCategory === item.name
                ? "border-primary border-2"
                : "border-2 border-primary/10"
            }
            onClick={() => setSelectedCategory(item.name)}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <CategoryIcon iconName={item.image} />
                <h3 className="font-medium">{item.title}</h3>
              </div>
            </CardHeader>
          </Card>
        </div>
      ))}
    </div>
  );
}
