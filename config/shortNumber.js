/**
 *
 * @param {number} number
 */
export function shortNumber (number) {
  return new Intl.NumberFormat('ja-JP', {
    notation: 'compact'
    // compactDisplay: 'long'
  }).format(number)
}
