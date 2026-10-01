import type { ReactNode } from "react";
import { LockSimple } from "@phosphor-icons/react/dist/ssr";

/** Browser window chrome around a real page or screenshot. */
export default function BrowserFrame({
  url,
  children,
  actions,
  className = "",
  viewClassName = "",
}: {
  url: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  viewClassName?: string;
}) {
  return (
    <div className={`browser ${className}`}>
      <div className="browser-bar">
        <span className="browser-lights" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <div className="browser-url">
          <LockSimple size={11} weight="bold" aria-hidden />
          <span>{url}</span>
        </div>
        <div className="flex min-w-[42px] flex-none justify-end">{actions}</div>
      </div>
      <div className={`browser-view ${viewClassName}`}>{children}</div>
    </div>
  );
}
