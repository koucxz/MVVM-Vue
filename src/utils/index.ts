function query (el: Element | string): Element | null {
  if (typeof el !== 'string') {
    return el
  }
  return document.querySelector(el)
}

function warn (str: string) {
  console.warn('[vue warn]' + str)
}

function isElementNode (node: any): boolean {
  return node.nodeType === 1
}

function isTextNode (node: any): boolean {
  return node.nodeType === 3
}

function isDirective (attr: string) {
  return attr.indexOf('v-') === 0
}

function isEventDirective (dir: string) {
  return dir.indexOf('on') === 0 || dir.indexOf('@') === '0'
}

export {
  query, warn, isElementNode, isTextNode, isDirective, isEventDirective
}
