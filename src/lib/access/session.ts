const COOKIE_NAME = "ot_access";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getAccessCode(): string | undefined {
  const code = process.env.APP_ACCESS_CODE?.trim();
  return code ? code : undefined;
}

export function isAccessGateEnabled(): boolean {
  return Boolean(getAccessCode());
}

export function getAccessCookieName(): string {
  return COOKIE_NAME;
}

export function getAccessMaxAge(): number {
  return MAX_AGE_SECONDS;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return toBase64Url(signature);
}

function timingSafeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a[i] ^ b[i];
  }
  return mismatch === 0;
}

export async function createAccessToken(): Promise<string | null> {
  const secret = getAccessCode();
  if (!secret) {
    return null;
  }
  const expiresAt = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = String(expiresAt);
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

export async function isValidAccessToken(token: string | undefined): Promise<boolean> {
  const secret = getAccessCode();
  if (!secret || !token) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await hmacSign(payload, secret);
  return timingSafeEqual(signature, expected);
}

export function verifyAccessCode(code: string): boolean {
  const expected = getAccessCode();
  if (!expected) {
    return true;
  }
  return timingSafeEqual(code.trim(), expected);
}

export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return "/";
  }
  return path;
}
