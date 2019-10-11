interface ComponentData {
  [propName: string]: any
}

declare interface ComponentDataFn {
  (): ComponentData
}

declare interface VueInterface {
  el: string,
  data: ComponentData | ComponentDataFn,
  watch?: {
    [propName: string]: Function
  }
  methods?: {
    [propName: string]: Function
  }
}

declare interface Watcher {
  vm: Vue,
  update: Function
  addDep: Function
}