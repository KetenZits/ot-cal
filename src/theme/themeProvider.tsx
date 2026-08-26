"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import type { ThemeConfig } from "@/types/theme";

const CSS_VARS: Record<keyof ThemeConfig["colors"], string> = {
  background: "--background",
  surface: "--surface",
  primary: "--primary",
  accent: "--accent",
  text: "--text",
  textMuted: "--text-muted",
};

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  if (value.length !== 6) return 0;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function applyThemeToDocument(config: ThemeConfig): void {
  const root = document.documentElement;
  (Object.keys(CSS_VARS) as Array<keyof ThemeConfig["colors"]>).forEach((key) => {
    root.style.setProperty(CSS_VARS[key], config.colors[key]);
  });
  const lightHero = luminance(config.colors.background) > 0.62;
  root.style.setProperty("--on-background", lightHero ? config.colors.text : "#FFFFFF");
  root.style.setProperty("--theme-color", config.colors.background);
}

export const THEME_INIT_SCRIPT = `(function(){try{var raw=localStorage.getItem('ot-theme');var colors=null;if(raw){var parsed=JSON.parse(raw);var config=(parsed.state&&parsed.state.config)||parsed;colors=config.colors;}if(!colors){colors={background:'#5B4BFF',surface:'#FFFFFF',primary:'#1C1C28',accent:'#FF6B57',text:'#1C1C28',textMuted:'#7B8194'};}var hex=/^#[0-9A-Fa-f]{6}$/;var map={background:'--background',surface:'--surface',primary:'--primary',accent:'--accent',text:'--text',textMuted:'--text-muted'};var root=document.documentElement;Object.keys(map).forEach(function(key){var value=colors[key];if(hex.test(value))root.style.setProperty(map[key],value);});var bg=(colors.background||'#000000').replace('#','');if(bg.length===6){var r=parseInt(bg.slice(0,2),16),g=parseInt(bg.slice(2,4),16),b=parseInt(bg.slice(4,6),16);var lum=(0.299*r+0.587*g+0.114*b)/255;root.style.setProperty('--on-background',lum>0.62?(colors.text||'#1C1C28'):'#FFFFFF');}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const config = useThemeStore((state) => state.config);

  useEffect(() => {
    applyThemeToDocument(config);
  }, [config]);

  return children;
}
