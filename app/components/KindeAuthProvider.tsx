"use client";

import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import { ReactNode } from "react";

interface KindeAuthProviderProps {
  children: ReactNode;
}

export function KindeAuthProvider({ children }: KindeAuthProviderProps) {
  return <KindeProvider>{children}</KindeProvider>;
}
