import { ImageResponse } from "next/og";

export const alt = "Stander Trader - Electronics & Gadgets";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)",
          fontFamily: "sans-serif",
          padding: "48px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "96px",
            height: "96px",
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.2)",
            border: "2px solid rgba(255, 255, 255, 0.4)",
            color: "#ffffff",
            fontSize: "44px",
            fontWeight: 800,
            marginBottom: "28px",
          }}
        >
          ST
        </div>
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            marginBottom: "16px",
          }}
        >
          Stander Trader
        </div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: 500,
            color: "#dbeafe",
            letterSpacing: "0.01em",
          }}
        >
          Electronics &amp; Gadgets
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
