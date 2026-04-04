import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "512px",
          height: "512px",
          background: "#FF7EA8",
          borderRadius: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "256px",
            height: "310px",
            background: "white",
            borderRadius: "8px 36px 36px 8px",
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
              width: "36px",
              height: "310px",
              background: "#FFB3CB",
              borderRadius: "8px 0 0 8px",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              marginLeft: "30px",
            }}
          >
            <div style={{ width: "140px", height: "18px", background: "#FF7EA8", borderRadius: "9px" }} />
            <div style={{ width: "110px", height: "18px", background: "#FFB3CB", borderRadius: "9px" }} />
            <div style={{ width: "128px", height: "18px", background: "#FFB3CB", borderRadius: "9px" }} />
            <div style={{ width: "100px", height: "18px", background: "#FFB3CB", borderRadius: "9px" }} />
          </div>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
