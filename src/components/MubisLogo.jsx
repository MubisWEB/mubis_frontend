import React from "react";
import { Link } from "react-router-dom";

export default function MubisLogo({ size = "md", variant = "dark", linkTo = null }) {

  const sizes = {
    sm: "h-10",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  const src =
    variant === "light"
      ? "/MubisLogoWhite.png"
      : "/MubisLogo.png";
  

  const logo = (
    <img
      src={src}
      alt="Mubis"
      className={`${sizes[size]} w-auto`}
    />
  );

  if (linkTo) {
    return <Link to={linkTo}>{logo}</Link>;
  }

  return logo;
}