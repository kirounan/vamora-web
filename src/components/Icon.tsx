import type { CSSProperties } from "react";
type Name =
  | "arrow"
  | "download"
  | "menu"
  | "close"
  | "check"
  | "ball"
  | "trophy"
  | "people"
  | "plus"
  | "apple"
  | "play";
const paths: Record<Exclude<Name, "apple" | "play">, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  download: "M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  ball: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-4 4 3-1.5 4h-5L8 11l4-3Zm0-5v5m9 4-5-1m1 9-2.5-5M7 20l2.5-5M3 12l5-1",
  trophy:
    "M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4Zm0 1H3v2a4 4 0 0 0 4 4m10-6h4v2a4 4 0 0 1-4 4",
  people:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M13 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  plus: "M12 5v14M5 12h14",
};
export default function Icon({
  name,
  size = 24,
  style,
}: {
  name: Name;
  size?: number;
  style?: CSSProperties;
}) {
  if (name === "play")
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        style={style}
      >
        <path d="m4 3 13 9L4 21V3Z" />
        <path d="m17 12 3-2c1 .5 1 3 0 4l-3-2Z" />
      </svg>
    );
  if (name === "apple")
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        style={style}
      >
        <path d="M16.6 1.4c.2 1.4-.4 2.8-1.2 3.7-.9.9-2.2 1.6-3.6 1.5-.2-1.3.4-2.7 1.2-3.5.9-1 2.4-1.7 3.6-1.7ZM20.6 17.3c-.5 1.2-.8 1.7-1.5 2.8-1 1.5-2.4 3.3-4.1 3.3-1.5 0-1.9-1-4-1s-2.5 1-4 1c-1.8 0-3.1-1.7-4.1-3.2C.1 16 .3 9.5 4.8 7.1c1.6-.8 3.7-.9 5.2-.3 1 .4 1.7.5 2.2.5.6 0 1.5-.2 2.6-.6 1.4-.5 3.4-.4 4.9.5.9.5 1.5 1.1 2 1.8-1.7 1-2.9 2.7-2.7 5 .1 1.7 1.1 2.8 1.6 3.3Z" />
      </svg>
    );
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d={paths[name]} />
    </svg>
  );
}
