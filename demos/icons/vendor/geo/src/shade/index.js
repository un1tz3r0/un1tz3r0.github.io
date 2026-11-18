// `src/shade/` — F16 vector emboss and specular shading.
//
// Imports `core/` only, like `raster/` and `spiro/`: this layer is portable and belongs in
// the DSL translation along with the kernel.

export {
  lightVector,
  halfVector,
  dotAt,
  diffuseAt,
  specularAt,
  isoNormalAngles,
  dotRange,
  shadingModel,
} from './lighting.js';
export {
  bevelBand,
  bevelBandsBySubpath,
  embossPath,
  outwardNormalSign,
  awayFromFillSign,
  bandLevels,
  terminatorAngles,
} from './emboss.js';
