"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import type { ThemeConfig } from "@/types/theme";
import { DEFAULT_UI_STYLE_ID, isUiStyleId } from "@/theme/uiStyles";

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

function contrastInk(hex: string): string {
  return luminance(hex) > 0.55 ? "#16161F" : "#FFFFFF";
}

export function applyThemeToDocument(config: ThemeConfig): void {
  const root = document.documentElement;
  (Object.keys(CSS_VARS) as Array<keyof ThemeConfig["colors"]>).forEach((key) => {
    root.style.setProperty(CSS_VARS[key], config.colors[key]);
  });
  const lightHero = luminance(config.colors.background) > 0.62;
  root.style.setProperty("--on-background", lightHero ? config.colors.text : "#FFFFFF");
  root.style.setProperty("--on-accent", contrastInk(config.colors.accent));
  root.style.setProperty("--theme-color", config.colors.background);
  root.setAttribute(
    "data-ui",
    isUiStyleId(config.uiStyleId) ? config.uiStyleId : DEFAULT_UI_STYLE_ID,
  );
}

export const THEME_INIT_SCRIPT = `(function(){try{var raw=localStorage.getItem('ot-theme');var colors=null;var ui='modern';if(raw){var parsed=JSON.parse(raw);var config=(parsed.state&&parsed.state.config)||parsed;colors=config.colors;if(config.uiStyleId)ui=config.uiStyleId;}if(!colors){colors={background:'#4F3DFF',surface:'#F5F3FF',primary:'#16161F',accent:'#FF5A45',text:'#16161F',textMuted:'#5C6378'};}var allowed={street:1,modern:1,luxury:1,glass:1,neubrutalism:1,immersive:1,minimal:1,flat:1};if(!allowed[ui])ui='modern';var hex=/^#[0-9A-Fa-f]{6}$/;var map={background:'--background',surface:'--surface',primary:'--primary',accent:'--accent',text:'--text',textMuted:'--text-muted'};var root=document.documentElement;root.setAttribute('data-ui',ui);Object.keys(map).forEach(function(key){var value=colors[key];if(hex.test(value))root.style.setProperty(map[key],value);});function lum(c){var h=(c||'#000000').replace('#','');if(h.length!==6)return 0;var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return(0.299*r+0.587*g+0.114*b)/255;}root.style.setProperty('--on-background',lum(colors.background)>0.62?(colors.text||'#16161F'):'#FFFFFF');root.style.setProperty('--on-accent',lum(colors.accent)>0.55?'#16161F':'#FFFFFF');}catch(e){}})();`;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const config = useThemeStore((state) => state.config);

  useEffect(() => {
    applyThemeToDocument(config);
  }, [config]);

  return children;
}
