import Watcher from '../Watcher'
import updater from './updater'

export default {
  text: function (node: Node, vm: Component, exp: string) {
    this.bind(node, vm, exp, 'text')
  },

  html: function (node: Node, vm: Component, exp: string) {
    this.bind(node, vm, exp, 'html')
  },

  model: function (node: Node, vm: Component, exp: string) {
    this.bind(node, vm, exp, 'model')

    let val = this._getVMVal(vm, exp)
    node.addEventListener('input', (e: Event) => {
      const newValue = e.target.value
      if (val === newValue) {
        return
      }

      this._setVMVal(vm, exp, newValue)
      val = newValue
    })
  },

  class: function (node: Node, vm: Component, exp: string) {
    this.bind(node, vm, exp, 'class')
  },

  bind: function (node: Node, vm: Component, exp: string, dir: string) {
    const fn = updater[dir]

    fn && fn(node, this._getVMVal(vm, exp))

    new Watcher(vm, exp, function (value: any, oldValue: any) {
      fn && fn(node, value, oldValue)
    })
  },

  // 事件处理
  eventHandler: function (node: Node, vm: Component, exp: string, dir: string) {
    const eventType = dir.split(':')[1]
    const fn = vm.$options.methods && vm.$options.methods[exp]

    if (eventType && fn) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  },

  _getVMVal: function (vm: Component, exp: string) {
    let val: any = vm
    const expArr = exp.split('.')
    expArr.forEach(function (k) {
      val = val[k]
    })
    return val
  },

  _setVMVal: function (vm: Component, exp: string, value: any) {
    let val: any = vm
    const expArr = exp.split('.')
    expArr.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k]
      } else {
        val[k] = value
      }
    })
  }
}
