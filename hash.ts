export const sha256Hex = async (text: string): Promise<string> => {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const fingerprint = async (handle: string, seed: string): Promise<string> => {
  const hex = await sha256Hex(`decomm-ident\n${handle}\n${seed}`);
  return `${hex.slice(0, 8)}-${hex.slice(8, 16)}`;
};
