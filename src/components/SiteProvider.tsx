"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { Slot } from "@/lib/schedule";
import { SCHEDULE } from "@/lib/schedule";
import { SITE } from "@/lib/site";

export interface ClientSite {
  phone: string;
  phoneHref: string;
  schedule: Slot[];
  announcement?: { enabled: boolean; text: string; href: string };
}

const Ctx = createContext<ClientSite>({ phone: SITE.phone, phoneHref: SITE.phoneHref, schedule: SCHEDULE });

/** Admin-edited settings and darshan timings, for client components. */
export function SiteProvider({ value, children }: { value: ClientSite; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
