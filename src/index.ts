import { observe } from "./Observer"
import Watcher from './Watcher'
import Compiler from "./Compiler"

export default class Vue {
  $options: Component
  _data: Object
  constructor (this: Vue, options: Component) {
    this.$options = options
    const data = this._data = this.$options.data

    Object.keys(data).forEach((key) => {
      this._proxyData(key)
    })

    this._initComputed()

    observe(data, this)

    this.$compile = new Compiler(options.el, this)
  }

  $watch (this: Vue, key: string, cb: Function, options?: Object) {
    new Watcher(this, key, cb)
  }

  _proxyData (this: Vue, key: string, setter?: Function, getter?: Function) {
    setter = setter || 
      Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get: () => {
          return this._data[key];
        },
        set: (newVal) => {
          this._data[key] = newVal;
        }
      })
  }

  _initComputed (this: Vue) {
    const computed = this.$options.computed
    if (typeof computed === 'object') {
      Object.keys(computed).forEach((key) => {
        Object.defineProperty(this, key, {
          get: typeof computed[key] === 'function'
                  ? computed[key]
                  : computed[key].get
        })
      })
    }
  }
}
