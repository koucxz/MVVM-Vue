import { query, isElementNode, isTextNode, isDirective, isEventDirective } from '../utils'
import utils from './utils'

class Compile {
  $el: Element
  $vm: Component
  $fragment: DocumentFragment
  constructor (el: Node | string, vm: Component) {
    this.$vm = vm
    this.$el = isElementNode(el) ? el : query(el)
    if (!this.$el) {
      throw new Error('el is not found')
    }
    this.$fragment = this.node2Fragment()
    this.init()
    this.$el.appendChild(this.$fragment)
  }
  node2Fragment (): DocumentFragment {
    const fragment: DocumentFragment = document.createDocumentFragment()
    const el = this.$el
    let child = el.firstChild
    while (child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  }
  init () {
    this.compileElement(this.$fragment)
  }
  compileElement (el: Element | ChildNode | DocumentFragment) {
    el.childNodes.forEach(node => {
      const text = node.textContent
      const reg = /\{\{(.*)\}\}/
      if (isElementNode(node)) {
        this.compile(node)
      } else if (isTextNode(node) && reg.test(text || '')) {
        this.compileText(node, RegExp.$1.trim())
      }
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  compile (node: Element): void {
    Array.from(node.attributes).forEach(attr => {
      const attrName = attr.name
      if (!isDirective(attrName)) {
        return
      }
      const exp = attr.value
      const dir = attrName.substring(2)
      if (isEventDirective(dir)) {
        utils.eventHandler(node, this.$vm, exp, dir)
      } else {
        utils[dir] && utils[dir](node, this.$vm, exp)
      }
      node.removeAttribute(attrName)
    })
  }

  compileText (node: Node, exp: string) {
    utils.text(node, this.$vm, exp)
  }
}

export default Compile
