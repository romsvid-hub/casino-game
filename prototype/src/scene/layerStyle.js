// Inline style of one Figma layer (scene/env.json, ui/lobby/intro.json): box,
// blend, opacity, blur, rotation, parallax shift and a soft left edge.
export function layerStyle(layer) {
  const style = { left: layer.x, top: layer.y, width: layer.w, height: layer.h }
  if (layer.blend) style.mixBlendMode = layer.blend
  if (layer.opacity != null) style.opacity = layer.opacity
  if (layer.bg) style.background = layer.bg
  if (layer.blur) style.filter = `blur(${layer.blur}px)`
  if (layer.rotate) style.transform = `rotate(${layer.rotate}deg)`
  if (layer.plx) style.transform = `translateX(var(--plx-${layer.plx}))`
  if (layer.fadeLeft) {
    style.maskImage = `linear-gradient(to right, transparent, black ${layer.fadeLeft}px)`
    style.WebkitMaskImage = style.maskImage
  }
  return style
}
