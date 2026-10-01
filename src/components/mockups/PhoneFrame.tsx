import type { CSSProperties, ReactNode } from "react";
import { BatteryFull, CellSignalFull, WifiHigh } from "@phosphor-icons/react/dist/ssr";

/**
 * iPhone-proportioned frame. The status bar is drawn here, so screenshots
 * placed inside are cropped below their own status bar.
 */
export default function PhoneFrame({
  children,
  tone = "dark",
  screen,
  className = "",
  style,
}: {
  children: ReactNode;
  /** Colour of the status bar text and home indicator. */
  tone?: "dark" | "light";
  /** Screen background behind the status bar. */
  screen?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ink = tone === "dark" ? "#fff" : "#111";
  return (
    <div className={`phone ${className}`} style={style}>
      <div
        className="phone-screen"
        style={{ ["--screen" as string]: screen ?? (tone === "dark" ? "#000" : "#fafafa"), ["--screen-ink" as string]: ink }}
      >
        <div className="phone-status" aria-hidden>
          <span>9:41</span>
          <span className="phone-status-icons">
            <CellSignalFull weight="fill" style={{ width: "4.6cqw", height: "4.6cqw" }} />
            <WifiHigh weight="bold" style={{ width: "4.6cqw", height: "4.6cqw" }} />
            <BatteryFull weight="fill" style={{ width: "6.4cqw", height: "6.4cqw" }} />
          </span>
        </div>
        <span className="phone-island" aria-hidden />
        <div className="phone-view">{children}</div>
        <span className="phone-home" aria-hidden />
      </div>
    </div>
  );
}
