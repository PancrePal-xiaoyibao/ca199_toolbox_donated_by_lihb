import '@testing-library/jest-dom/vitest'

if (typeof File !== 'undefined' && typeof File.prototype.text !== 'function') {
  File.prototype.text = function text() {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(reader.error)
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.readAsText(this)
    })
  }
}
