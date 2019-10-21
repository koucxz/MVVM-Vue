import { Dep } from './Observer'

class Watcher {
  vm: Component
  expOrFn: string | Function
  cb: Function
  public deps: Map<number, Dep>
  getter: Function
  value: any
  constructor (vm: Component, expOrFn: string | Function, cb: Function) {
    this.vm = vm
    this.expOrFn = expOrFn
    this.cb = cb
    this.deps = new Map()

    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = this.parsePath(expOrFn.trim())
    }

    this.value = this.get()
  }
  update (this: Watcher) {
    this.run()
  }
  run (this: Watcher) {
    const value = this.get()
    const oldVal = this.value
    if (value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value, oldVal)
    }
  }
  addDep (this: Watcher, dep: Dep) {
    if (!this.deps.has(dep.id)) {
      this.deps.set(dep.id, dep)
      dep.addSub(this)
    }
  }
  get (this: Watcher) {
    const vm = this.vm
    Dep.target = this // 将当前订阅者指向自己
    const value = this.getter.call(vm, vm)
    Dep.target = null
    return value
  }

  parsePath (exp: string): Function | never {
    if (/[^\w.$]/.test(exp)) throw new Error('exp can\'t end by dot')

    const exps = exp.split('.')

    return function (obj: any): Object | void {
      for (let [i, len] = [0, exps.length]; i < len;i++) {
        if (!obj) return
        obj = obj[exps[i]]
      }
      return obj
    }
  }
}

export default Watcher
