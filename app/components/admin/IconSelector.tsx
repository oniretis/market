"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ShoppingBag,
  Tv,
  Laptop,
  Watch,
  Headphones,
  Mic,
  Speaker,
  Monitor,
  Tablet,
  Mouse,
  Keyboard,
  Printer,
  Router,
  Battery,
  Wifi,
  Bluetooth,
  Usb,
  Cpu,
  HardDrive,
  Disc,
  Cloud,
  Server,
  Database,
  Code,
  Terminal,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Mail,
  Phone,
  MessageSquare,
  Users,
  User,
  UserPlus,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Share,
  Link,
  Unlock,
  Lock,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  MoreHorizontal,
  Menu,
  Grid,
  List,
  Layout,
  Layers,
  Archive,
  Folder,
  FolderOpen,
  File,
  FileText,
  Image,
  Video,
  Music2,
  Film,
  Sliders,
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Wallet,
  ShoppingCart,
  Receipt,
  Calculator,
  Calendar,
  Clock,
  Timer,
  Sun,
  Moon,
  CloudSun,
  CloudRain,
  Umbrella,
  Thermometer,
  Wind,
  Droplet,
  Flame,
  Snowflake,
  TreePine,
  Flower,
  Bug,
  Fish,
  Bird,
  Cat,
  Dog,
  HeartHandshake,
  Handshake,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Angry,
  ZapOff,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Key,
  KeyRound,
  LockKeyhole,
  UnlockKeyhole,
  Fingerprint,
  QrCode,
  Barcode,
  Scan,
  ScanLine,
  ScanFace,
  ScanEye,
  ScanText,
  ScanSearch,
  ScanBarcode,
  Target,
  Trophy,
  Award,
  Briefcase,
  Lightbulb,
  Hammer,
  Drill,
  Paintbrush,
  FireExtinguisher
} from "lucide-react";

const iconCategories = [
  {
    name: "Basic",
    icons: ["Package", "Home", "Car", "Shirt", "Book", "Gamepad2", "Music", "Camera", "Heart", "Star"]
  },
  {
    name: "Electronics",
    icons: ["Smartphone", "Laptop", "Monitor", "Tablet", "Headphones", "Speaker", "Keyboard", "Mouse", "Wifi", "Bluetooth"]
  },
  {
    name: "Food & Drink",
    icons: ["Coffee", "Pizza", "Glass", "Cake", "IceCream", "Apple", "Cherry"]
  },
  {
    name: "Sports & Fitness",
    icons: ["Dumbbell", "Trophy", "Target", "Bike", "Football", "Basketball", "Tennis", "Golf", "Fishing"]
  },
  {
    name: "Travel & Places",
    icons: ["Plane", "MapPin", "Navigation", "Compass", "Flag", "Hotel", "Beach", "Mountain", "City", "Globe"]
  },
  {
    name: "Business & Office",
    icons: ["Briefcase", "Calculator", "Calendar", "Clock", "FileText", "Folder", "Archive", "Printer", "Phone"]
  },
  {
    name: "Tools & Hardware",
    icons: ["Wrench", "Hammer", "Drill", "Paintbrush", "Lightbulb", "Battery", "Cpu", "HardDrive"]
  },
  {
    name: "Shopping & Money",
    icons: ["ShoppingBag", "ShoppingCart", "CreditCard", "Wallet", "DollarSign", "Receipt", "Gift", "Tag", "Barcode", "QrCode"]
  }
];

const iconMap: { [key: string]: any } = {
  // Basic
  Package, Home, Car, Shirt, Book, Gamepad2, Music, Camera, Heart, Star,
  // Electronics
  Smartphone, Laptop, Monitor, Tablet, Headphones, Speaker, Keyboard, Mouse, Wifi, Bluetooth,
  // Food & Drink
  Coffee, Pizza, Glass: Package, Cake: Package, IceCream: Package, Apple: Package, Cherry: Package,
  // Sports & Fitness
  Dumbbell, Trophy, Target, Bike: Package, Football: Package, Basketball: Package,
  Tennis: Package, Golf: Package, Fishing: Package,
  // Travel & Places
  Plane, MapPin, Navigation, Compass, Flag, Hotel: Package, Beach: Package,
  Mountain: Package, City: Package, Globe,
  // Business & Office
  Briefcase, Calculator, Calendar, Clock, FileText, Folder, Archive, Printer, Phone,
  // Tools & Hardware
  Wrench, Hammer, Drill, Paintbrush, Lightbulb, Battery, Cpu, HardDrive,
  // Shopping & Money
  ShoppingBag, ShoppingCart, CreditCard, Wallet, DollarSign, Receipt, Gift, Tag, Barcode, QrCode
};

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

export function IconSelector({ selectedIcon, onIconSelect }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Basic");

  const filteredIcons = iconCategories.find(cat => cat.name === activeCategory)?.icons || [];

  const searchFilteredIcons = Object.keys(iconMap).filter(icon =>
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Package;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Search Icons</label>
        <Input
          placeholder="Search for an icon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      {!searchTerm && (
        <div>
          <label className="text-sm font-medium">Categories</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {iconCategories.map((category) => (
              <Button
                key={category.name}
                variant={activeCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">
          {searchTerm ? "Search Results" : `${activeCategory} Icons`}
        </label>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 mt-2 max-h-64 overflow-y-auto border rounded-lg p-3">
          {(searchTerm ? searchFilteredIcons : filteredIcons).map((iconName) => (
            <button
              key={iconName}
              type="button"
              onClick={() => onIconSelect(iconName)}
              className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${selectedIcon === iconName
                ? "border-primary bg-primary/10"
                : "border-gray-200 hover:border-gray-300"
                }`}
              title={iconName}
            >
              {renderIcon(iconName)}
            </button>
          ))}
        </div>
      </div>

      {selectedIcon && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Selected:</span>
          <div className="flex items-center gap-2">
            {renderIcon(selectedIcon)}
            <span className="text-sm">{selectedIcon}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onIconSelect("")}
            className="ml-auto"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
