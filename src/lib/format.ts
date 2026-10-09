export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const daysLeft = (end: string) =>
  Math.max(0, Math.ceil((Date.parse(`${end}T23:59:59+05:30`) - Date.now()) / 86_400_000));
export const longDate = (key: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(`${key}T12:00:00Z`).toLocaleDateString("en-IN", { ...opts, timeZone: "UTC" });
