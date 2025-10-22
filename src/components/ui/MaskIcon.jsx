"use client";

import { memo } from "react";

function MaskIcon({ name, size = 24, color = "#D1D5DB", className }) {
  const style = {
    width: size,
    height: size,
    backgroundColor: color,
    WebkitMaskImage: `url(/icons/${name}.svg)`,
    maskImage: `url(/icons/${name}.svg)`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    display: "inline-block",
  };

  return <span aria-hidden="true" style={style} className={className} />;
}

export default memo(MaskIcon);
