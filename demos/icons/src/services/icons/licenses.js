// License policy for icon sets. DESIGN.md §8.2.
//
// Sets are offered only when their license lets the icons be used in the user's own work
// without imposing terms on that work. Anything unknown is treated as not allowed.

/** @typedef {'permissive' | 'attribution' | 'excluded'} LicenseClass */

const PERMISSIVE = new Set([
  'MIT', 'MIT-0', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD',
  'OFL-1.1', 'CC0-1.0', 'Unlicense', 'WTFPL', 'Zlib',
]);

const ATTRIBUTION = new Set(['CC-BY-4.0', 'CC-BY-3.0', 'CC-BY-2.5', 'CC-BY-2.0']);

/**
 * @param {string | undefined | null} spdx  SPDX identifier
 * @returns {LicenseClass}
 */
export function classifyLicense(spdx) {
  if (!spdx) return 'excluded';
  const id = String(spdx).trim();
  if (PERMISSIVE.has(id)) return 'permissive';
  if (ATTRIBUTION.has(id)) return 'attribution';
  // Share-alike, non-commercial, no-derivatives, GPL family, MPL and everything unknown.
  return 'excluded';
}

export const isAllowed = (spdx) => classifyLicense(spdx) !== 'excluded';
