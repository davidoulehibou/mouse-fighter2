export function getTextColor(bgColor) {
  if (bgColor) {
    let r, g, b;

    if (bgColor.startsWith("#")) {
      const hex = bgColor.replace("#", "");
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.substr(0, 2), 16);
        g = parseInt(hex.substr(2, 2), 16);
        b = parseInt(hex.substr(4, 2), 16);
      }
    } else if (bgColor.startsWith("rgb")) {
      [r, g, b] = bgColor.match(/\d+/g).map(Number);
    } else {
      // couleur inconnue → valeur par défaut
      return "black";
    }

    // Calcul de luminance relative (selon le standard W3C)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    const toHex = (value) => Math.floor(value / 1.3).toString(16).padStart(2, "0");

    return luminance > 0.5 ? `#${toHex(r)}${toHex(g)}${toHex(b)}` : "white";
  }
}

export function getInsideColor(bgColor) {
  if (!bgColor) return "black";

  let r, g, b;

  if (bgColor.startsWith("#")) {
    const hex = bgColor.replace("#", "");
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return "black";
    }
  } else if (bgColor.startsWith("rgb")) {
    const rgb = bgColor.match(/\d+/g);
    if (!rgb || rgb.length < 3) return "black";
    [r, g, b] = rgb.map(Number);
  } else {
    return "black";
  }

  const toHex = (value) => Math.floor(value / 2).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default getTextColor;