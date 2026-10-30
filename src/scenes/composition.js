// Fractions of the viewport: position and apparent size remain consistent across
// the DOM illustration and the optional 3D body. Depth is independent of size.
const DESKTOP = [
  [.76,.82,.035,0], [.74,.72,.10,-.65], [.77,.68,.12,-.9],
  [.73,.75,.075,-.45], [.28,.58,.19,-1.3], [.76,.65,.12,-.8], [.80,.56,.13,-1.6],
];
const PORTRAIT = [
  [.73,.51,.43,-.3], [.73,.46,.46,-.7], [.75,.43,.49,-1],
  [.72,.49,.45,-.5], [.84,.37,.53,-1.4], [.75,.42,.48,-.9], [.78,.39,.49,-1.5],
];
export function composition(index, width, height) {
  const portrait = width / height < .9;
  let [x, size, bottom, z] = (portrait ? PORTRAIT : DESKTOP)[index] || DESKTOP[0];
  const background = index === 1 ? 'city' : index === 2 || index === 3 ? 'theater' : 'shrine';
  if (!portrait) {
    const imageAspect = background === 'city' ? 1672/941 : 1880/836;
    const visibleHeight = Math.min(1, width / height / imageAspect);
    bottom = Math.max(bottom, (1-visibleHeight)/2 + visibleHeight*.035);
    size = Math.min(size, visibleHeight*.94);
  }
  const center = width/height > 2.4 ? .5 + (x-.5)*.64 : x;
  const halfWidth = size * height * (2/3) / width / 2;
  return { x:Math.min(1 - halfWidth - .025, Math.max(halfWidth + .025, center)), height:size, bottom, z, portrait, background, tails:[2,3,3,4,2,4,3][index] || 2 };
}
