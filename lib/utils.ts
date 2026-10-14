export function formatPrice(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return `Rs. ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
