import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "192px",
          height: "192px",
          background: "#FF7EA8",
          borderRadius: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "96px",
            height: "116px",
            background: "white",
            borderRadius: "4px 14px 14px 4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "0",
              width: "14px",
              height: "116px",
              background: "#FFB3CB",
              borderRadius: "4px 0 0 4px",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginLeft: "12px",
            }}
          >
            <div style={{ width: "52px", height: "7px", background: "#FF7EA8", borderRadius: "4px" }} />
            <div style={{ width: "42px", height: "7px", background: "#FFB3CB", borderRadius: "4px" }} />
            <div style={{ width: "48px", height: "7px", background: "#FFB3CB", borderRadius: "4px" }} />
          </div>
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
