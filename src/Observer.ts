class Observer {
  data: ComponentData
  constructor (data: ComponentData) {
    this.data = data
    this.walk()
  }

  walk (this: Observer) {
    Object.keys(this.data).forEach((key: string) => {
      const value: any = this.data[key]
      this.defineReactive(key, value)
    })
  }
  defineReactive (key: string, val: any) {
    const dep = new Dep()
    observe(val) // 监听子属性
    Object.defineProperty(this.data, key, {
      enumerable: true,
      configurable: false,
      get (): any {
        dep.depend()
        return val
      },
      set (newVal: any): void {
        if (newVal === val) {
          return
        }
        val = newVal
        observe(newVal)
        dep.notify() // 通知所有订阅者
      }
    })
  }
}

function observe (value: any): Observer | void {
  if (!value || typeof value !== 'object') {
    return
  }
  return new Observer(value)
}

let uid = 0

class Dep {
  static target: Watcher | null
  id: number
  subs: Watcher[]
  constructor () {
    this.id = uid++
    this.subs = []
  }
  addSub (sub: Watcher) {
    this.subs.push(sub)
  }
  depend (this: Dep) {
    Dep.target && Dep.target.addDep(this)
  }
  removeSub (sub: Watcher) {
    const index: number = this.subs.indexOf(sub)
    if (index !== -1) {
      this.subs.splice(index, 1)
    }
  }
  notify () {
    this.subs.forEach((sub: Watcher) => {
      sub.update()
    })
  }
}

export { Observer, Dep }
