/**
* @name olum
* @version 0.9.5
* @copyright 2026 
* @author Eissa Saber
* @license MIT
*/
import vdom from "./vdom.js";

let __olumRT;

export default (function () {
  var olum = {
    version: "0.9.5",
    framework: "OlumJS",
    app: {},

    flushUpdates() {},
    $emit(event, data) {
      this.dispatchEvent(event, data);
    },
    dispatchEvent(event, data) {
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    mkHash(str) {
      var hash = 0;
      var i;
      var char;
      if (str.length === 0) return hash;
      for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return hash;
    },
    mkElm(type, compName, compId) {
      const el = document.createElement(type);
      if (compName && compId)
        el.setAttribute("data-olum", JSON.stringify({ compName, compId }));
      return el;
    },
    injectStyle(compName, cssContent) {
      if (!cssContent || !cssContent.trim()) return;
      const id = "olum-style-" + compName;
      if (document.getElementById(id)) return;
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = cssContent;
      document.head.appendChild(tag);
    },

    proxyHandler(obj, watcher, el) {
      const mkHash = olum.mkHash;
      const proxies = new WeakMap();
      const raws = new WeakMap();

      function emit(key) {
        const dataObj = {
          compName: obj.__olum__.compName,
          compId: obj.__olum__.compId,
        };
        dataObj.hash = mkHash(dataObj.compName + dataObj.compId);
        if (typeof key === "string") dataObj.key = key;
        olum.$emit("updateOlumComp", dataObj);
      }

      function mkNestedHandler(rootKey) {
        return {
          get: function (t, key) {
            return wrap(t[key], rootKey);
          },
          set: function (t, key, val) {
            val = raws.get(val) || val;
            if (t[key] === val) return true;
            t[key] = val;
            emit(rootKey);
            return true;
          },
          deleteProperty: function (t, key) {
            if (!(key in t)) return true;
            delete t[key];
            emit(rootKey);
            return true;
          },
        };
      }

      const collectionMutators = ["set", "add", "delete", "clear"];

      function mkCollectionHandler(rootKey) {
        return {
          get: function (coll, key) {
            const val = coll[key];
            if (typeof val !== "function") return val;
            return function (...args) {
              const result = val.apply(
                coll,
                args.map((a) => raws.get(a) || a),
              );
              if (collectionMutators.includes(key)) emit(rootKey);
              return key === "get" ? wrap(result, rootKey) : result;
            };
          },
        };
      }

      function wrap(val, rootKey) {
        if (val === null || typeof val !== "object") return val;
        const isCollection = val instanceof Map || val instanceof Set;
        if (!isCollection && !Array.isArray(val)) {
          const proto = Object.getPrototypeOf(val);
          if (proto !== Object.prototype && proto !== null) return val;
        }
        let p = proxies.get(val);
        if (!p) {
          p = new Proxy(
            val,
            isCollection
              ? mkCollectionHandler(rootKey)
              : mkNestedHandler(rootKey),
          );
          proxies.set(val, p);
          raws.set(p, val);
        }
        return p;
      }

      var handler = {
        get: function (obj, key) {
          return key === "__olum__"
            ? obj[key]
            : wrap(obj[key], typeof key === "string" ? key : undefined);
        },
        set: function (obj, key, newVal) {
          if (key === "__olum__") return false;
          newVal = raws.get(newVal) || newVal;
          const oldVal = obj[key];
          if (oldVal === newVal) return true;
          obj[key] = newVal;
          if (watcher && watcher[key] && typeof watcher[key] === "function")
            watcher[key](oldVal, newVal);

          emit(typeof key === "string" ? key : undefined);
          return true;
        },
        deleteProperty: function (obj, key) {
          if (key === "__olum__") return false;
          delete obj[key];

          emit(typeof key === "string" ? key : undefined);
          return true;
        },
      };
      return new Proxy(obj, handler);
    },

    proxyHandlerForScope(obj, originalProxy) {
      const handler = {
        get: function (obj, key) {
          return originalProxy[key];
        },
        set: function (obj, key, val) {
          obj[key] = val;
          originalProxy[key] = val;
          return true;
        },
        deleteProperty: function (obj, key) {
          delete obj[key];
          delete originalProxy[key];
          return true;
        },
      };
      return new Proxy(obj, handler);
    },
    clean(fragment) {
      const str = String(fragment).trim();
      if (str === "null") return null;
      return str;
    },

    esc(value) {
      if (value === null || value === undefined) return "";
      if (value && value.__olumHtml === true) return value.html;
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },

    html(value) {
      return { __olumHtml: true, html: value == null ? "" : String(value) };
    },

    parseEventArgs(payload) {
      if (!payload) return [];
      try {
        return JSON.parse(decodeURIComponent(payload));
      } catch (err) {
        try {
          return JSON.parse(payload);
        } catch (err2) {
          console.warn("olum: couldn't read event args — " + payload);
          return [];
        }
      }
    },
    eventsHandler(el, nodes, compName, methodsRefObj) {
      function event(item, str, modifiers) {
        const sig =
          str +
          "\u0001" +
          (modifiers && modifiers.length ? modifiers.join(".") : "");

        const bar = str.indexOf("|");
        const eventName = bar === -1 ? str : str.slice(0, bar);
        const chain = bar === -1 ? "" : str.slice(bar + 1);

        const data = (chain ? chain.split("&") : []).map((chunk) => {
          const eq = chunk.indexOf("=");
          return {
            args: olum.parseEventArgs(eq === -1 ? "" : chunk.slice(eq + 1)),
            methodName: eq === -1 ? chunk : chunk.slice(0, eq),
          };
        });

        const opts = {
          once: false,
          passive: false,
          capture: false,
        };

        if (modifiers && modifiers.length) {
          if (modifiers.includes("once")) opts.once = true;
          if (modifiers.includes("passive")) opts.passive = true;
          if (modifiers.includes("capture")) opts.capture = true;
        }

        const handler = (e) => {
          if (opts.once && Array.isArray(e.currentTarget.__olumEvt)) {
            const rest = e.currentTarget.__olumEvt.filter(
              (x) => x.handler !== handler,
            );
            e.currentTarget.__olumEvt = rest.length ? rest : null;
          }
          if (modifiers && modifiers.length) {
            if (modifiers.includes("prevent")) e.preventDefault();
            if (modifiers.includes("stop")) e.stopPropagation();
          }

          function init() {
            data.forEach((obj) => {
              if (methodsRefObj[obj.methodName]) {
                if (obj.args.length) {
                  const args = obj.args.map((a) => (a === "$event" ? e : a));
                  methodsRefObj[obj.methodName](...args);
                } else {
                  methodsRefObj[obj.methodName](e);
                }
              } else {
                console.warn("olum: can't access the method");
              }
            });
          }

          if (modifiers && modifiers.length && modifiers.includes("self")) {
            if (e.target === e.currentTarget) init();
            return;
          }
          init();
        };
        item.addEventListener(eventName.slice(2), handler, opts);

        (item.__olumEvt || (item.__olumEvt = [])).push({
          sig: sig,
          name: eventName.slice(2),
          handler: handler,
          opts: opts,
        });

        item.removeAttribute("data-o-event");
        item.removeAttribute("data-o-event-mode");
      }

      nodes.forEach((node) => {
        const hasEvent = olum.clean(node.getAttribute("data-o-event"));
        const hasMode = olum.clean(node.getAttribute("data-o-event-mode"));
        const mode = hasMode && hasMode.trim() !== "" ? hasMode.split(".") : [];

        if (hasEvent)
          hasEvent
            .split("OLUM_EVT_SEP")
            .forEach((seg) => event(node, seg, mode));
      });
    },
    stylesHandler(el, nodes, compName) {
      function setStyles(item, obj, keys) {
        let str = "";
        keys.forEach((key) => {
          const val = obj[key];
          if (val) {
            str += key + ": " + val + "; ";
          }
        });
        str = str.trim();

        if (str !== "") item.setAttribute("style", str);
        item.removeAttribute("data-o-style");
      }

      function style(item, str) {
        const obj = JSON.parse(str);
        const keys = Object.keys(obj);
        if (keys.length) {
          setStyles(item, obj, keys);
        }
      }

      nodes.forEach((node) => {
        const hasStyle = olum.clean(node.getAttribute("data-o-style"));
        if (hasStyle) style(node, hasStyle);
      });
    },
    handleMarkup(compName, id, el, methods) {
      el.setAttribute("data-child-of", compName);
      el.setAttribute("data-o-" + id, "");
      var nodes = el.querySelectorAll("*");
      nodes.forEach((node) => {
        node.setAttribute("data-child-of", compName);
        node.setAttribute("data-o-" + id, "");
      });
      this.eventsHandler(el, nodes, compName, methods);
      this.stylesHandler(el, nodes, compName);
      this.transitionHandler(nodes, methods);
      return el;
    },

    transitionHandler(nodes, methodsRefObj) {
      const parseDefs = (str) =>
        str.split("&").reduce((acc, chunk) => {
          const eq = chunk.indexOf("=");
          const head = chunk.slice(0, eq);
          const rhs = chunk.slice(eq + 1);

          if (head.charAt(0) === "@") {
            const cb = methodsRefObj && methodsRefObj[rhs];
            if (cb) (acc.events || (acc.events = {}))[head.slice(1)] = cb;
            return acc;
          }

          if (head === "flip") {
            let fp;
            try {
              fp = JSON.parse(rhs)[0];
            } catch (e) {
              fp = undefined;
            }
            acc.flip = fp || {};
            return acc;
          }
          const colon = head.indexOf(":");
          const dir = head.slice(0, colon);
          const name = head.slice(colon + 1);
          const fn =
            (methodsRefObj && methodsRefObj[name]) ||
            (olum.transitions && olum.transitions[name]);
          if (!fn) {
            console.warn("olum: unknown transition '" + name + "'");
            return acc;
          }
          let params;
          try {
            params = JSON.parse(rhs)[0];
          } catch (e) {
            params = undefined;
          }
          acc[dir] = { fn, params };
          return acc;
        }, {});

      nodes.forEach((node) => {
        const raw = olum.clean(node.getAttribute("data-o-trans"));
        if (!raw) return;
        node.removeAttribute("data-o-trans");

        if (!olum.transition) {
          if (!olum._transWarned) {
            olum._transWarned = true;
            console.warn(
              "olum: <transition> used but the transition module (./transition.js / olum-transition package) is not installed — animations are disabled. npm i olum-transition",
            );
          }
          return;
        }
        node.__olumTrans = parseDefs(raw);

        if (node.__olumTrans.flip !== undefined) {
          node.__olumFlip = node.__olumTrans.flip;
          node.setAttribute("data-o-flip", "");
        }
        if (node.__olumBaseStyle == null)
          node.__olumBaseStyle = node.style.cssText;

        if (node.__olumTrans.in) node.setAttribute("data-o-intro", "");

        const raf =
          typeof requestAnimationFrame === "function"
            ? requestAnimationFrame
            : (cb) => setTimeout(cb, 16);
        raf(() => olum.transition.playIntro(node));
      });
    },
    isObj(obj) {
      return obj !== null && typeof obj === "object";
    },
    isFullArr(arr) {
      return !!(this.isObj(arr) && Array.isArray(arr) && arr.length);
    },
    isFullObj(obj) {
      return !!(
        this.isObj(obj) &&
        Array.isArray(Object.keys(obj)) &&
        Object.keys(obj).length
      );
    },

    props(storeKey) {
      return new Proxy(
        {},
        {
          get(_, key) {
            const entry = olum.app.store[storeKey];
            if (!entry) return undefined;

            if (key === "children") return entry.children || "";
            return entry.incomingProps ? entry.incomingProps[key] : undefined;
          },
          set(_, key) {
            console.warn(
              'olum: props are read-only — "' +
                String(key) +
                '" was not written. Pass a callback prop to update the parent, or share the value via the global store.',
            );
            return true;
          },
        },
      );
    },

    vdom: vdom,

    transitions: {},
    easings: {},
    transition: null,
    useTransition(t) {
      this.transition = t;
      this.vdom.transition = t;
      Object.assign(this.transitions, t.transitions);
      Object.assign(this.easings, t.easings);
    },

    crossfade(opts) {
      if (!this.transition)
        throw new Error(
          "olum: crossfade is unavailable — the transition module (./transition.js / olum-transition package) is not installed",
        );
      return this.transition.crossfade(opts);
    },

    directOlums(container) {
      return Array.prototype.slice
        .call(container.querySelectorAll("olum"))
        .filter((p) => {
          const anc =
            p.parentElement &&
            p.parentElement.closest &&
            p.parentElement.closest("olum");
          return !anc || !container.contains(anc);
        });
    },
    buildTree(comp, store, compKey) {
      this.__renderingKey = compKey;
      const rootElm = comp.__OLUM__.getElm;
      this.__renderingKey = null;
      if (!rootElm) return null;

      rootElm.__olumKey = compKey;
      const self = this;

      const registry = olum.app.registry || (olum.app.registry = {});

      function renderChildren(containerComp, containerKey, containerElm) {
        if (containerComp.__OLUM__.components)
          Object.assign(registry, containerComp.__OLUM__.components);
        const placeholders = self.directOlums(containerElm);
        const occ = {};
        placeholders.forEach((placeholder) => {
          const name = placeholder.getAttribute("name");
          const factory =
            registry[name] ||
            (containerComp.__OLUM__.components &&
              containerComp.__OLUM__.components[name]);
          if (!factory) {
            console.warn(
              "olum: couldn't find " +
                name +
                " Component while building the tree!",
            );
            return;
          }

          const keyVal = placeholder.getAttribute("data-o-key");
          let instanceKey;
          if (keyVal !== null && keyVal !== "") {
            instanceKey = containerKey + ">" + name + "@" + keyVal;
          } else {
            occ[name] = occ[name] === undefined ? 0 : occ[name] + 1;
            instanceKey = containerKey + ">" + name + "#" + occ[name];
          }

          const propsJson = placeholder.getAttribute("data-o-props");
          const incomingProps = propsJson
            ? JSON.parse(decodeURIComponent(propsJson))
            : {};
          const incomingPropSources = {};
          const srcStr = placeholder.getAttribute("data-o-props-src") || "";
          if (srcStr)
            srcStr.split("|").forEach((pair) => {
              const parts = pair.split(":");
              const propKey = parts[0],
                kind = parts[1],
                srcKey = parts[2];
              if (propKey && kind && srcKey)
                incomingPropSources[propKey] = { kind, key: srcKey };
            });

          const ownerKey = placeholder.getAttribute("data-o-props-owner");
          const ownerComp = (ownerKey && store[ownerKey]) || containerComp;

          Object.keys(incomingPropSources).forEach((propKey) => {
            const desc = incomingPropSources[propKey];
            if (desc.kind === "method") {
              const fn = ownerComp.methodsRef && ownerComp.methodsRef[desc.key];
              if (typeof fn === "function") incomingProps[propKey] = fn;
            } else if (
              desc.kind === "props" &&
              incomingProps[propKey] === undefined
            ) {
              const val =
                ownerComp.incomingProps && ownerComp.incomingProps[desc.key];
              if (typeof val === "function") incomingProps[propKey] = val;
            }
          });

          const childrenHtml = placeholder.innerHTML.trim();

          let child = store[instanceKey];
          if (!child) {
            store[instanceKey] = {
              parentCompName: containerKey,
              incomingProps,
              incomingPropSources,
              children: childrenHtml,
            };
            const created = factory(instanceKey);
            Object.assign(store[instanceKey], created);
            child = store[instanceKey];
          } else {
            child.parentCompName = containerKey;
            child.incomingProps = incomingProps;
            child.incomingPropSources = incomingPropSources;
            child.children = childrenHtml;
          }

          self.__renderingKey = instanceKey;
          const elm = child.__OLUM__.getElm;
          self.__renderingKey = null;
          if (elm) {
            elm.__olumKey = instanceKey;
            elm.setAttribute(
              "data-o-if",
              placeholder.getAttribute("if")
                ? placeholder.getAttribute("if")
                : "olum-no-condition",
            );
            placeholder.replaceWith(elm);
            renderChildren(child, instanceKey, elm);
          }
        });
      }

      renderChildren(comp, compKey, rootElm);
      return rootElm;
    },
    getInnerNames(entry) {
      const comps = [];
      const map = olum.app.map;
      if (map) {
        map.find((obj) => {
          if (obj.name == entry)
            obj.children.forEach((child) => comps.push(child));
        });
      }

      function recursive(num) {
        const child = comps[num];
        map.forEach((obj) => {
          if (obj.name == child)
            obj.children.forEach((item) => comps.push(item));
        });
        if (num + 1 <= comps.length) recursive(num + 1);
      }

      if (comps.length) recursive(0);

      return comps;
    },
  };

  __olumRT = olum;

  if (typeof window !== "undefined" && globalThis.__OLUM_DEV__)
    window.olum = olum;

  class Olum {
    root = null;
    $(s) {
      this.root = document.querySelector(s);
      return this;
    }

    use(comp) {
      if (comp) {
        const isRouter =
          typeof comp?.name === "function" && comp.name() === "Router";
        if (isRouter) {
          this.useRouter(comp);
        } else {
          this.useComponent(comp);
        }
      }
    }

    useRouter(router) {
      olum.router = {
        pathname: router.pathname,
        push: router.push,
        replace: router.replace,
        back: router.back,
        forward: router.forward,
        go: router.go,
        extractParams: router.extractParams,
      };
      router.__proto__.rootElm = this.root;
      router.render = (view) => this.useComponent(view);
      if (router.isReady) router.listen();
    }

    useComponent(comp) {
      const entry = comp();
      const { store, rootKey } = this.share(entry);
      const tree = olum.buildTree(entry, store, rootKey);
      if (!tree) return console.warn("olum: couldn't build tree!");

      this.setupListeners(store);

      this.root.innerHTML = "";
      this.root.append(tree);

      if (entry.hooks.mounted) {
        const onMount = entry.hooks.mounted;
        const onTeardown = onMount();
        entry.hooks.unMounted = onTeardown;
      }
      entry.hooks.isMounted = true;

      Object.keys(store).forEach((key) => {
        if (key === rootKey) return;
        const c = store[key];
        if (!c || !c.el) return;
        const ifConValue = c.el.getAttribute("data-o-if");
        if (!ifConValue) {
        } else {
          if (["olum-no-condition", "true"].includes(ifConValue)) {
            if (c.hooks.mounted) {
              const onMount = c.hooks.mounted;
              const onTeardown = onMount();
              c.hooks.unMounted = onTeardown;
            }
            c.hooks.isMounted = true;
          }
        }
      });
    }

    setupListeners(store) {
      const mkHash = olum.mkHash;

      const pending = new Map();
      let scheduled = false;

      const rebuild = (compName) => {
        const comp = store[compName];
        if (!comp || !comp.el) return;
        if (!document.body.contains(comp.el)) return;

        const innerNames = Object.keys(store).filter(
          (name) => name !== compName,
        );
        const prevMounted = {};
        innerNames.forEach((name) => {
          const c = store[name];
          if (c) prevMounted[name] = c.hooks.isMounted;
        });

        const treeElm = olum.buildTree(comp, store, compName);
        if (!treeElm) return console.warn("olum: couldn't build tree!");

        if (treeElm !== comp.el) olum.vdom.patch(comp.el, treeElm);

        const afterNames = Object.keys(store).filter(
          (name) => name !== compName,
        );
        afterNames.forEach((name) => {
          const c = store[name];
          if (!c) return;
          const isInDOM = document.body.contains(c.el);
          if (prevMounted[name] && !isInDOM) {
            if (c.hooks.unMounted && !c.hooks.isUnMounted) {
              const onTeardown = c.hooks.unMounted;
              c.hooks.isUnMounted = true;
              c.hooks.isMounted = false;
              if (onTeardown && typeof onTeardown === "function") onTeardown();
            }
          } else if (!prevMounted[name] && isInDOM) {
            if (c.hooks.mounted && !c.hooks.isMounted) {
              const onMount = c.hooks.mounted;
              c.hooks.isMounted = true;
              c.hooks.isUnMounted = false;
              const onTeardown = onMount();
              c.hooks.unMounted = onTeardown;
            }
          }
        });
      };

      const flush = () => {
        scheduled = false;
        if (!pending.size) return;
        const names = Array.from(pending.keys());
        pending.clear();
        names.forEach((name) => {
          const covered = names.some(
            (other) => other !== name && name.indexOf(other + ">") === 0,
          );
          if (!covered) rebuild(name);
        });
      };

      olum.flushUpdates = flush;

      window.addEventListener("updateOlumComp", (e) => {
        if (
          e &&
          e.detail &&
          e.detail.compName &&
          e.detail.compId &&
          e.detail.hash
        ) {
          if (e.detail.hash !== mkHash(e.detail.compName + e.detail.compId))
            return;
          const comp = store[e.detail.compName];
          if (!comp || !comp.el) return;
          if (!document.body.contains(comp.el)) return;

          const deps = comp.__OLUM__ && comp.__OLUM__.deps;
          if (
            deps &&
            typeof e.detail.key === "string" &&
            deps.indexOf(e.detail.key) === -1
          )
            return;

          pending.set(e.detail.compName, true);
          if (!scheduled) {
            scheduled = true;
            Promise.resolve().then(flush);
          }
        }
      });
    }

    share(entry) {
      const store = {};
      const rootKey = entry.__OLUM__.compName;
      store[rootKey] = entry;
      Object.assign(olum.app, { store, registry: {} });
      return { store, rootKey };
    }
  }

  Olum.__olum = olum;

  return Olum;
})();

export const __olum = __olumRT;

export const onMount = (cb) => cb;

export const flushUpdates = () => __olumRT.flushUpdates();

export const crossfade = (opts) => __olumRT.crossfade(opts);
export const easings = __olumRT.easings;
export const transitions = __olumRT.transitions;
export const params = (path, pathname) =>
  __olumRT.router.extractParams(path, pathname);
export const push = (path) => __olumRT.router.push(path);
export const replace = (path) => __olumRT.router.replace(path);
export const back = () => __olumRT.router.back();
export const pathname = () => __olumRT.router.pathname();
export const forward = () => __olumRT.router.forward();
export const go = (n) => __olumRT.router.go(n);

export const props = (storeKey) => __olumRT.props(storeKey);

export const store = (init) => {
  if (!__olumRT.store)
    throw new Error(
      "olum: store is unavailable — the store module (./store.js / olum-store package) is not installed",
    );
  return __olumRT.store(init);
};

if (typeof window !== "undefined")
  await import("olum-store")
    .then((m) => (__olumRT.store = m.default(__olumRT)))
    .catch(() => {});

if (typeof window !== "undefined")
  await import("olum-transition")
    .then((m) => __olumRT.useTransition(m.default))
    .catch(() => {});

export const scope = (name, index = 0) => {
  const entries = (__olumRT.app && __olumRT.app.store) || {};
  const matches = Object.keys(entries).filter((key) => {
    const tail = key.split(">").pop();
    return tail === name || tail.split(/[#@]/)[0] === name;
  });
  const key = matches[index];
  if (!key) {
    console.warn(
      'olum: scope("' + name + '") — no mounted component matches that name',
    );
    return null;
  }
  const entry = entries[key];
  return {
    key,
    el: entry.el || null,
    state: entry.stateProps || null,
    props: entry.props || null,
    methods: entry.methods || null,
  };
};
