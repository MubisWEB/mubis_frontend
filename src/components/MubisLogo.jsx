import { Link } from "react-router-dom";

// Heights match the original CSS classes: sm=h-10, md=h-12, lg=h-16, xl=h-24
const HEIGHTS = { sm: 40, md: 48, lg: 64, xl: 96 };

// viewBox is fixed at 215×58. Width is calculated to maintain aspect ratio.
const VB_W = 215;
const VB_H = 58;

export default function MubisLogo({ size = "md", variant = "dark", linkTo = null }) {
  const h = HEIGHTS[size] ?? 48;
  const w = Math.round(h * (VB_W / VB_H));

  const textFill = variant === "light" ? "#ffffff" : "hsl(220,20%,10%)";

  const logo = (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mubis"
    >
      {/* "mubıs" — ı (U+0131) is the Latin dotless i, present in Inter */}
      <text
        x="0"
        y="51"
        fontFamily="'Inter', sans-serif"
        fontWeight="800"
        fontSize="52"
        fill={textFill}
        letterSpacing="-1"
      >
        mub{'\u0131'}s
      </text>

      {/* Green dot — same primary color as the design system */}
      <circle cx="118.5" cy="15" r="5.3" fill="hsl(142,71%,45%)" />
    </svg>
  );

  if (linkTo) return <Link to={linkTo}>{logo}</Link>;
  return logo;
}
