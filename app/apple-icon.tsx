import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 84,
          background: "linear-gradient(135deg, #18181B 0%, #27272A 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FAFAFA",
          borderRadius: "36px",
          fontWeight: 900,
          letterSpacing: "-0.05em",
        }}
      >
        RF
      </div>
    ),
    {
      ...size,
    }
  );
}
