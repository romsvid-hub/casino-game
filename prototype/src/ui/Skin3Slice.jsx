// Generic 3-slice skin: fixed left / stretchable or tiled center / fixed right.
// left and right are elements (an <img>, <SkinSide>, ...); center is an image.
// Children are laid over the whole skin.
//   center.mode 'stretch': the image fills the center (HUD/Balance 302:3760)
//   center.mode 'tile':    the image is scaled to the skin height and repeats horizontally
//                          from the left (Counter/Win 349:4258, Dock 336:3939)
export default function Skin3Slice({ left, center, right, height, width, className = '', children }) {
  const tiled = center.mode === 'tile'
  const centerStyle = {
    backgroundImage: `url(${center.src})`,
    backgroundRepeat: tiled ? 'repeat-x' : 'no-repeat',
    backgroundSize: tiled ? 'auto 100%' : '100% 100%',
    backgroundPosition: 'left top',
  }

  return (
    <div className={`relative flex items-start ${className}`} style={{ height, width }}>
      <div className="relative z-[3] shrink-0">{left}</div>
      <div className="relative z-[2] h-full min-w-0 flex-1" style={centerStyle} />
      <div className="relative z-[1] shrink-0">{right}</div>
      {children && <div className="absolute inset-0 z-[4]">{children}</div>}
    </div>
  )
}
