import { Home, Smartphone, Car, Package } from "lucide-react";
import { ReactNode } from "react";

interface iAppProps {
  name: string;
  title: string;
  image: ReactNode;
  id: number;
}

export const categoryItems: iAppProps[] = [
  {
    id: 0,
    name: "properties",
    title: "Properties",
    image: <Home />,
  },
  {
    id: 1,
    name: "gadgets",
    title: "Gadgets",
    image: <Smartphone />,
  },
  {
    id: 2,
    name: "cars",
    title: "Cars",
    image: <Car />,
  },
  {
    id: 3,
    name: "others",
    title: "Others",
    image: <Package />,
  },
];
