export default {
  text (node: Node, value: string = ''): void {
    node.textContent = value
  },

  html (node: Node, value: string = '') {
    node.innerHTML = value
  },

  class (node: Node, value: string = '', oldValue: string) {
    let className = node.className
    className = className.replace(oldValue, '').replace(/\s$/, '')

    let space = className && value ? ' ' : ''

    node.className = className + space + value
  },

  model (node: Node, value: string = ''): void {
    node.value = value
  }
}
