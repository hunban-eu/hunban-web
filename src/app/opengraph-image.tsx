import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

// The preview image shown when hunban.eu is shared on LinkedIn, WhatsApp,
// Slack and the like. Generated at build time in the HunBAN brand colours.

export const alt = "HunBAN, the home of angel investing in Hungary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (file: string) =>
  fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/poppins/files", file));

export default function OpengraphImage() {
  const logo = fs.readFileSync(path.join(process.cwd(), "public/hunban-logo-white.svg")).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#2f414f",
          padding: "72px 80px",
          fontFamily: "Poppins",
          color: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;base64,${logo}`} width={272} height={80} alt="" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 64, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1 }}>
            <span>The home of angel investing in&nbsp;</span>
            <span style={{ color: "#fbcf00" }}>Hungary</span>
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: "#9eb8c8", lineHeight: 1.4 }}>
            Angel investors, founders and the people who help them succeed.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 28, fontWeight: 500 }}>
          <div style={{ width: 48, height: 6, background: "#fbcf00", marginRight: 20 }} />
          hunban.eu
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Poppins", data: font("poppins-latin-400-normal.woff"), weight: 400 },
        { name: "Poppins", data: font("poppins-latin-500-normal.woff"), weight: 500 },
        { name: "Poppins", data: font("poppins-latin-700-normal.woff"), weight: 700 },
      ],
    },
  );
}
