function getSiteUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (publicUrl && publicUrl.trim()) {
    return publicUrl.trim().replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelUrl && vercelUrl.trim()) {
    const formatted = vercelUrl.trim().replace(/\/+$/, "");
    return formatted.startsWith("http://") || formatted.startsWith("https://")
      ? formatted
      : `https://${formatted}`;
  }

  return "https://stander-orpin.vercel.app";
}

export const SITE_URL = getSiteUrl();
