interface ComponentData {
  [propName: string]: any
}

declare interface ComponentDataFn {
  (): ComponentData
}

declare interface Component {
  $options: Object,
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