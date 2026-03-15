/**
 * 将列索引转换为 Excel 风格的字母标签 (A, B, C, ..., Z, AA, AB, ...)
 * @param index 0-based index
 */
export const getColumnLabel = (index: number): string => {
  let label = ''
  let n = index
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label
    n = Math.floor(n / 26) - 1
  }
  return label
}
