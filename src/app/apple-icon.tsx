import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FF7EA8",
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 本の形 */}
        <div
          style={{
            width: "90px",
            height: "110px",
            background: "white",
            borderRadius: "4px 12px 12px 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* 背表紙 */}
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "12px",
              height: "110px",
              background: "#FFB3CB",
              borderRadius: "4px 0 0 4px",
            }}
          />
          {/* 線 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginLeft: "10px",
            }}
          >
            <div style={{ width: "50px", height: "6px", background: "#FF7EA8", borderRadius: "3px" }} />
            <div style={{ width: "40px", height: "6px", background: "#FFB3CB", borderRadius: "3px" }} />
            <div style={{ width: "45px", height: "6px", background: "#FFB3CB", borderRadius: "3px" }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
