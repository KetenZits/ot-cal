import type { UiStyleId } from "@/types/theme";

export interface UiStylePreset {
  id: UiStyleId;
  name: string;
  hint: string;
}

export const DEFAULT_UI_STYLE_ID: UiStyleId = "modern";

export const UI_STYLES: UiStylePreset[] = [
  { id: "street", name: "Street", hint: "สติ๊กเกอร์ เอียง สเปรย์" },
  { id: "modern", name: "Modern", hint: "มน นุ่ม เงาฟุ้ง" },
  { id: "luxury", name: "Luxury", hint: "กรอบทอง ผ้าไหม" },
  { id: "glass", name: "Glassmorphic", hint: "กระจกฝ้า แสงวิ่ง" },
  { id: "neubrutalism", name: "Neubrutalism", hint: "เหลี่ยม เงาทึบ ตาราง" },
  { id: "immersive", name: "3D & Immersive", hint: "เอียงลึก แสงนูน" },
  { id: "minimal", name: "Minimal", hint: "โล่ง โปร่ง ไม่มีกรอบ" },
  { id: "flat", name: "Flat Design", hint: "ทึบ สี่เหลี่ยม สีตัน" },
];

const UI_STYLE_IDS = new Set<string>(UI_STYLES.map((style) => style.id));

export function isUiStyleId(value: unknown): value is UiStyleId {
  return typeof value === "string" && UI_STYLE_IDS.has(value);
}

export function getUiStyleById(id: string): UiStylePreset | undefined {
  return UI_STYLES.find((style) => style.id === id);
}

export type { UiStyleId };
