(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, function () { 'use strict';

  var Observer = /** @class */ (function () {
      function Observer(data) {
          this.data = data;
          this.walk();
      }
      Observer.prototype.walk = function () {
          var _this = this;
          Object.keys(this.data).forEach(function (key) {
              var value = _this.data[key];
              _this.defineReactive(key, value);
          });
      };
      Observer.prototype.defineReactive = function (key, val) {
          var dep = new Dep();
          observe(val); // 监听子属性
          Object.defineProperty(this.data, key, {
              enumerable: true,
              configurable: false,
              get: function () {
                  dep.depend();
                  return val;
              },
              set: function (newVal) {
                  if (newVal === val) {
                      return;
                  }
                  val = newVal;
                  observe(newVal);
                  dep.notify(); // 通知所有订阅者
              }
          });
      };
      return Observer;
  }());
  function observe(value, vm) {
      if (!value || typeof value !== 'object') {
          return;
      }
      return new Observer(value);
  }
  var uid = 0;
  var Dep = /** @class */ (function () {
      function Dep() {
          this.id = uid++;
          this.subs = [];
      }
      Dep.prototype.addSub = function (sub) {
          this.subs.push(sub);
      };
      Dep.prototype.depend = function () {
          Dep.target && Dep.target.addDep(this);
      };
      Dep.prototype.removeSub = function (sub) {
          var index = this.subs.indexOf(sub);
          if (index !== -1) {
              this.subs.splice(index, 1);
          }
      };
      Dep.prototype.notify = function () {
          this.subs.forEach(function (sub) {
              sub.update();
          });
      };
      return Dep;
  }());

  var Watcher = /** @class */ (function () {
      function Watcher(vm, expOrFn, cb) {
          this.vm = vm;
          this.expOrFn = expOrFn;
          this.cb = cb;
          this.deps = new Map();
          if (typeof expOrFn === 'function') {
              this.getter = expOrFn;
          }
          else {
              this.getter = this.parsePath(expOrFn.trim());
          }
          this.value = this.get();
      }
      Watcher.prototype.update = function () {
          this.run();
      };
      Watcher.prototype.run = function () {
          var value = this.get();
          var oldVal = this.value;
          if (value !== oldVal) {
              this.value = value;
              this.cb.call(this.vm, value, oldVal);
          }
      };
      Watcher.prototype.addDep = function (dep) {
          if (!this.deps.has(dep.id)) {
              this.deps.set(dep.id, dep);
              dep.addSub(this);
          }
      };
      Watcher.prototype.get = function () {
          var vm = this.vm;
          Dep.target = this; // 将当前订阅者指向自己
          var value = this.getter.call(vm, vm);
          Dep.target = null;
          return value;
      };
      Watcher.prototype.parsePath = function (exp) {
          if (/[^\w.$]/.test(exp))
              throw new Error('exp can\'t end by dot');
          var exps = exp.split('.');
          return function (obj) {
              for (var _a = [0, exps.length], i = _a[0], len = _a[1]; i < len; i++) {
                  if (!obj)
                      return;
                  obj = obj[exps[i]];
              }
              return obj;
          };
      };
      return Watcher;
  }());

  function query(el) {
      if (typeof el !== 'string') {
          return el;
      }
      return document.querySelector(el);
  }
  function isElementNode(node) {
      return node.nodeType === 1;
  }
  function isTextNode(node) {
      return node.nodeType === 3;
  }
  function isDirective(attr) {
      return attr.indexOf('v-') === 0;
  }
  function isEventDirective(dir) {
      return dir.indexOf('on') === 0 || dir.indexOf('@') === '0';
  }

  var updater = {
      text: function (node, value) {
          if (value === void 0) { value = ''; }
          node.textContent = value;
      },
      html: function (node, value) {
          if (value === void 0) { value = ''; }
          node.innerHTML = value;
      },
      class: function (node, value, oldValue) {
          if (value === void 0) { value = ''; }
          var className = node.className;
          className = className.replace(oldValue, '').replace(/\s$/, '');
          var space = className && value ? ' ' : '';
          node.className = className + space + value;
      },
      model: function (node, value) {
          if (value === void 0) { value = ''; }
          node.value = value;
      }
  };

  var utils = {
      text: function (node, vm, exp) {
          this.bind(node, vm, exp, 'text');
      },
      html: function (node, vm, exp) {
          this.bind(node, vm, exp, 'html');
      },
      model: function (node, vm, exp) {
          var _this = this;
          this.bind(node, vm, exp, 'model');
          var val = this._getVMVal(vm, exp);
          node.addEventListener('input', function (e) {
              var newValue = e.target.value;
              if (val === newValue) {
                  return;
              }
              _this._setVMVal(vm, exp, newValue);
              val = newValue;
          });
      },
      class: function (node, vm, exp) {
          this.bind(node, vm, exp, 'class');
      },
      bind: function (node, vm, exp, dir) {
          var fn = updater[dir];
          fn && fn(node, this._getVMVal(vm, exp));
          new Watcher(vm, exp, function (value, oldValue) {
              fn && fn(node, value, oldValue);
          });
      },
      // 事件处理
      eventHandler: function (node, vm, exp, dir) {
          var eventType = dir.split(':')[1];
          var fn = vm.$options.methods && vm.$options.methods[exp];
          if (eventType && fn) {
              node.addEventListener(eventType, fn.bind(vm), false);
          }
      },
      _getVMVal: function (vm, exp) {
          var val = vm;
          var expArr = exp.split('.');
          expArr.forEach(function (k) {
              val = val[k];
          });
          return val;
      },
      _setVMVal: function (vm, exp, value) {
          var val = vm;
          var expArr = exp.split('.');
          expArr.forEach(function (k, i) {
              // 非最后一个key，更新val的值
              if (i < exp.length - 1) {
                  val = val[k];
              }
              else {
                  val[k] = value;
              }
          });
      }
  };

  var Compile = /** @class */ (function () {
      function Compile(el, vm) {
          this.$vm = vm;
          this.$el = isElementNode(el) ? el : query(el);
          if (!this.$el) {
              throw new Error('el is not found');
          }
          this.$fragment = this.node2Fragment();
          this.init();
          this.$el.appendChild(this.$fragment);
      }
      Compile.prototype.node2Fragment = function () {
          var fragment = document.createDocumentFragment();
          var el = this.$el;
          var child = el.firstChild;
          while (child) {
              fragment.appendChild(child);
              child = el.firstChild;
          }
          return fragment;
      };
      Compile.prototype.init = function () {
          this.compileElement(this.$fragment);
      };
      Compile.prototype.compileElement = function (el) {
          var _this = this;
          el.childNodes.forEach(function (node) {
              var text = node.textContent;
              var reg = /\{\{(.*)\}\}/;
              if (isElementNode(node)) {
                  _this.compile(node);
              }
              else if (isTextNode(node) && reg.test(text || '')) {
                  _this.compileText(node, RegExp.$1.trim());
              }
              if (node.childNodes && node.childNodes.length) {
                  _this.compileElement(node);
              }
          });
      };
      Compile.prototype.compile = function (node) {
          var _this = this;
          Array.from(node.attributes).forEach(function (attr) {
              var attrName = attr.name;
              if (!isDirective(attrName)) {
                  return;
              }
              var exp = attr.value;
              var dir = attrName.substring(2);
              if (isEventDirective(dir)) {
                  utils.eventHandler(node, _this.$vm, exp, dir);
              }
              else {
                  utils[dir] && utils[dir](node, _this.$vm, exp);
              }
              node.removeAttribute(attrName);
          });
      };
      Compile.prototype.compileText = function (node, exp) {
          utils.text(node, this.$vm, exp);
      };
      return Compile;
  }());

  var Vue = /** @class */ (function () {
      function Vue(options) {
          var _this = this;
          this.$options = options;
          var data = this._data = this.$options.data;
          Object.keys(data).forEach(function (key) {
              _this._proxyData(key);
          });
          this._initComputed();
          observe(data);
          this.$compile = new Compile(options.el, this);
      }
      Vue.prototype.$watch = function (key, cb, options) {
          new Watcher(this, key, cb);
      };
      Vue.prototype._proxyData = function (key, setter, getter) {
          var _this = this;
          setter = setter ||
              Object.defineProperty(this, key, {
                  configurable: false,
                  enumerable: true,
                  get: function () {
                      return _this._data[key];
                  },
                  set: function (newVal) {
                      _this._data[key] = newVal;
                  }
              });
      };
      Vue.prototype._initComputed = function () {
          var _this = this;
          var computed = this.$options.computed;
          if (typeof computed === 'object') {
              Object.keys(computed).forEach(function (key) {
                  Object.defineProperty(_this, key, {
                      get: typeof computed[key] === 'function'
                          ? computed[key]
                          : computed[key].get
                  });
              });
          }
      };
      return Vue;
  }());

  return Vue;

}));
