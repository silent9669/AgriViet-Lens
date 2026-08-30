/**
 * AgriViet Lens geometric line icon system.
 *
 * Each entry is the SVG child markup for a 24 x 24 viewBox. Keeping the
 * geometry separate from the wrapper lets callers choose their own sizing,
 * color, and stroke weight without shipping a third-party icon font.
 */

export const ICONS = Object.freeze({
  leaf: '<path d="M20.7 3.3C12.4 3.2 6.1 5.7 4 10.3c-1.6 3.4-.1 6.8 3.1 7.8 3.3 1 6.4-.9 8.2-3.8 1.4-2.4 2.5-5.9 5.4-11Z"/><path d="M3.5 20.5c3.2-4.6 7-7.8 11.4-10.1"/>',
  lens: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.3 15.3 5.2 5.2"/><path d="M10.5 7.5v6M7.5 10.5h6"/>',
  camera: '<path d="M4 7.5h3l1.4-2h7.2l1.4 2h3A1.5 1.5 0 0 1 21.5 9v9A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5Z"/><circle cx="12" cy="13.5" r="3.25"/><path d="M17.5 10h.01"/>',
  upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3"/>',
  beaker: '<path d="M9 3h6"/><path d="M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3"/><path d="M7.1 15h9.8"/>',
  mic: '<rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11v1a7 7 0 0 0 14 0v-1"/><path d="M12 19v3M8 22h8"/>',
  volume: '<path d="M4 10v4h3l5 4V6l-5 4H4Z"/><path d="M16 9a4.2 4.2 0 0 1 0 6"/><path d="M18.8 6.5a8 8 0 0 1 0 11"/>',
  cloudRain: '<path d="M7.2 17.5h10.3a4 4 0 0 0 .6-7.95A6.2 6.2 0 0 0 6.25 8.2 4.65 4.65 0 0 0 7.2 17.5Z"/><path d="m8 20-1 2M12 20l-1 2M16 20l-1 2"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 5.5v16M20 3H8a4 4 0 0 0-4 4"/><path d="M9 7h7M9 11h7"/>',
  download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
  key: '<circle cx="8.5" cy="15.5" r="3.5"/><path d="m11.2 12.8 8.3-8.3M16 7l2 2M14 9l2 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
  moon: '<path d="M20.5 14.7A8.5 8.5 0 0 1 9.3 3.5 8.5 8.5 0 1 0 20.5 14.7Z"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  alert: '<path d="m12 3 9 17H3L12 3Z"/><path d="M12 9v4M12 16.5v.01"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.9L3 10"/><path d="M3 5v5h5"/><path d="M4 13a8 8 0 0 0 14.9 3.9L21 14"/><path d="M21 19v-5h-5"/>',
  shield: '<path d="M12 21s8-3.8 8-10V5l-8-3-8 3v6c0 6.2 8 10 8 10Z"/><path d="m8.5 12 2.3 2.3 4.7-5"/>'
});

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render a named icon as standalone SVG markup.
 *
 * @param {string} name - Key from ICONS.
 * @param {object} [options] - Wrapper options.
 * @param {string} [options.className] - CSS classes for the SVG element.
 * @param {string} [options.class] - Alias for className.
 * @param {number} [options.strokeWidth=2] - SVG stroke width.
 * @param {number|string} [options.size=24] - Width and height in CSS pixels.
 * @returns {string} Full SVG markup, or an empty string for an unknown name.
 */
export function renderIcon(name, options = {}) {
  const iconMarkup = ICONS[name];
  if (!iconMarkup) return '';

  const className = options.className ?? options.class ?? '';
  const parsedStrokeWidth = Number(options.strokeWidth ?? 2);
  const strokeWidth = Number.isFinite(parsedStrokeWidth) && parsedStrokeWidth > 0
    ? parsedStrokeWidth
    : 2;
  const size = options.size ?? 24;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${escapeAttribute(size)}" height="${escapeAttribute(size)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" class="${escapeAttribute(className)}" aria-hidden="true" focusable="false">${iconMarkup}</svg>`;
}
