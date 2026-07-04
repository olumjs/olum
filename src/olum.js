/**
 * @name Olum.js
 * @version 0.5.4
 * @copyright 2026
 * @author Eissa Saber
 * @license MIT
 */
export default (function () {
  var olum = {
    app: {}, // this is a must to access live changes
    $emit(event, data) {
      this.dispatchEvent(event, data);
    },
    dispatchEvent(event, data) {
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    mkElm(type, compName, compId) {
      const el = document.createElement(type);
      if (compName && compId) el.setAttribute("data-olum", JSON.stringify({ compName, compId }));
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
      function mkHash(str) {
        var hash = 0;
        var i;
        var char;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
          char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      }
      var handler = {
        get: function (obj, key) {
          return obj[key];
        },
        set: function (obj, key, newVal) {
          if (key === "__olum__") return false;
          const oldVal = obj[key];
          if (oldVal === newVal) return true;
          obj[key] = newVal;
          if (watcher && watcher[key] && typeof watcher[key] === "function") watcher[key](oldVal, newVal);
          // todo prefix compName with instance e.g. you may have one component used twice so compName-1 & compName-2
          const dataObj = { compName: obj.__olum__.compName, compId: obj.__olum__.compId };
          const hash = mkHash(dataObj.compName + dataObj.compId);
          dataObj.hash = hash;

          window.olum.$emit("updateOlumComp", dataObj);
          return true;
        },
        deleteProperty: function (obj, key) {
          if (key === "__olum__") return false;
          delete obj[key];
          // todo prefix compName with instance e.g. you may have one component used twice so compName-1 & compName-2
          const dataObj = { compName: obj.__olum__.compName, compId: obj.__olum__.compId };
          const hash = mkHash(dataObj.compName + dataObj.compId);
          dataObj.hash = hash;

          window.olum.$emit("updateOlumComp", dataObj);
          return true;
        },
      };
      return new Proxy(obj, handler);
    },
    proxyHandlerForStore(obj, originalProxy) {
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
    // #2 (escape-by-default): HTML-escape a value before it is interpolated into a template.
    // The compiler wraps every text/attribute interpolation `{expr}` in `olum.esc(expr)` so a
    // user-supplied string (a todo title, a comment, anything) can't inject markup/scripts (XSS)
    // or visually break rendering when it contains <, >, &, or quotes.
    //   - null/undefined render as "" (instead of the literal text "null"/"undefined").
    //   - To render trusted HTML on purpose, opt out explicitly with `olum.html(value)` (below);
    //     esc() detects the marker it returns and passes the HTML through unescaped.
    esc(value) {
      if (value === null || value === undefined) return "";
      if (value && value.__olumHtml === true) return value.html; // explicit raw-HTML opt-in
      return String(value)
        .replace(/&/g, "&amp;") // must run first so the entities below aren't double-escaped
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },
    // #2 opt-in escape hatch: mark a string as trusted raw HTML so `esc()` leaves it untouched.
    // Usage in a template: {olum.html(props.richText)}. Use it ONLY on HTML you control or have
    // already sanitized — this is the deliberate, greppable way to bypass auto-escaping.
    html(value) {
      return { __olumHtml: true, html: value == null ? "" : String(value) };
    },
    eventsHandler(el, nodes, compName, methodsRefObj) {
      function event(item, str, modifiers) {
        const eventName = str.split("|")[0];
        str = str.split("|").slice(1).join();

        let methods = str.split("&");
        const data = methods.map((chunk) => {
          const chunks = chunk.split("=");
          const name = chunks[0];
          const args = JSON.parse(chunks.slice(1).join(""));
          return { args, methodName: name };
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

        item.addEventListener(
          eventName.slice(2),
          (e) => {
            if (modifiers && modifiers.length) {
              if (modifiers.includes("prevent")) e.preventDefault();
              if (modifiers.includes("stop")) e.stopPropagation();
            }

            function init() {
              data.forEach((obj) => {
                if (methodsRefObj[obj.methodName]) {
                  if (obj.args.length) {
                    const eventIndex = obj.args.indexOf("$event");
                    if (eventIndex !== -1) obj.args.splice(eventIndex, 1, e);
                    methodsRefObj[obj.methodName](...obj.args);
                  } else {
                    methodsRefObj[obj.methodName](e);
                  }
                } else {
                  console.warn("olum: can't access the method");
                }
              });
            }

            if (modifiers && modifiers.length && modifiers.includes("self")) {
              if (e.target === item) init();
              return;
            }
            init();
          },
          opts
        );

        item.removeAttribute("data-o-event");
        item.removeAttribute("data-o-event-mode");
        // item.removeAttribute("data-child-of");
      }

      nodes.forEach((node) => {
        const hasEvent = olum.clean(node.getAttribute("data-o-event"));
        const hasMode = olum.clean(node.getAttribute("data-o-event-mode"));
        const mode = hasMode && hasMode.trim() !== "" ? hasMode.split(".") : [];
        if (hasEvent) event(node, hasEvent, mode);
      });
    },
    stylesHandler(el, nodes, compName) {
      function setStyles(item, obj, keys) {
        let str = "";
        keys.forEach((key) => {
          const val = obj[key];
          if (val) {
            // console.log({ key, val });
            str += key + ": " + val + "; ";
          }
        });
        str = str.trim();
        // console.log(str);
        if (str !== "") item.setAttribute("style", str);
        item.removeAttribute("data-o-style");
        // item.removeAttribute("data-child-of");
      }

      function style(item, str) {
        const obj = JSON.parse(str);
        const keys = Object.keys(obj);
        if (keys.length) {
          // console.log("directObj: ", obj);
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
      return el;
    },
    isObj(obj) {
      return obj !== null && typeof obj === "object";
    },
    isFullArr(arr) {
      return !!(this.isObj(arr) && Array.isArray(arr) && arr.length);
    },
    isFullObj(obj) {
      return !!(this.isObj(obj) && Array.isArray(Object.keys(obj)) && Object.keys(obj).length);
    },
    createStore(entry) {
      const store = {};
      const map = [];
      store[entry.__OLUM__.compName] = entry; // bind root component

      // bind children components
      const recursive = (comp) => {
        if (this.isFullArr(comp.__OLUM__.components)) {
          comp.__OLUM__.components.forEach((item) => {
            var key = Object.keys(item)[0];
            var newComp = item[key]();
            if (!store[key]) store[key] = newComp;

            const obj = { name: key, children: newComp.__OLUM__.components.map((obj) => Object.keys(obj)[0]) };
            map.push(obj);

            if (this.isFullArr(obj.children)) recursive(newComp);
          });
        }
      };
      recursive(entry);

      return { store, map };
    },

    // direct <olum> placeholders of a container: those with no <olum> ancestor inside the container.
    // (deeper placeholders belong to a nested component and are handled when that component renders)
    directOlums(container) {
      return Array.prototype.slice.call(container.querySelectorAll("olum")).filter((p) => {
        const anc = p.parentElement && p.parentElement.closest && p.parentElement.closest("olum");
        return !anc || !container.contains(anc);
      });
    },
    buildTree(comp, store, compKey) {
      const rootElm = comp.__OLUM__.getElm;
      if (!rootElm) return null;
      const self = this;
      // lazy global factory registry: name -> factory. Accumulated from every instance's components map
      // as we descend, so slot-passed and cross-file components resolve regardless of where they were declared.
      const registry = window.olum.app.registry || (window.olum.app.registry = {});

      function renderChildren(containerComp, containerKey, containerElm) {
        if (containerComp.__OLUM__.components) Object.assign(registry, containerComp.__OLUM__.components);
        const placeholders = self.directOlums(containerElm);
        const occ = {}; // per-name occurrence counter -> positional instance keys, stable across re-renders
        placeholders.forEach((placeholder) => {
          const name = placeholder.getAttribute("name");
          const factory = registry[name] || (containerComp.__OLUM__.components && containerComp.__OLUM__.components[name]);
          if (!factory) {
            console.warn("olum: couldn't find " + name + " Component while building the tree!");
            return;
          }
          // #3 (keyed reconciliation): a placeholder rendered inside a keyed <for> carries data-o-key
          // (the evaluated `key={...}` value for that item). Keyed instances are stored under
          // "...Name@<key>", so the SAME instance — and therefore its state and DOM — is reused for a
          // given item no matter where it moves, is inserted, or is removed in the list. Without a key
          // we fall back to positional "...Name#<i>" keys, where state follows position, not identity
          // (delete the middle item of a list and the survivors inherit the wrong neighbour's state).
          const keyVal = placeholder.getAttribute("data-o-key");
          let instanceKey;
          if (keyVal !== null && keyVal !== "") {
            instanceKey = containerKey + ">" + name + "@" + keyVal;
          } else {
            occ[name] = occ[name] === undefined ? 0 : occ[name] + 1;
            instanceKey = containerKey + ">" + name + "#" + occ[name];
          }

          // reuse the instance from a previous render (preserves its state) or mint a fresh one
          let child = store[instanceKey];
          if (!child) {
            child = factory(instanceKey);
            store[instanceKey] = child;
          }

          // handle props
          child.parentCompName = containerKey;
          const propsJson = placeholder.getAttribute("data-o-props");
          child.incomingProps = propsJson ? JSON.parse(decodeURIComponent(propsJson)) : {};
          const srcStr = placeholder.getAttribute("data-o-props-src") || "";
          child.incomingPropSources = {};
          if (srcStr)
            srcStr.split("|").forEach((pair) => {
              const parts = pair.split(":"); // propKey:kind:srcKey
              const propKey = parts[0],
                kind = parts[1],
                srcKey = parts[2];
              if (propKey && kind && srcKey) child.incomingPropSources[propKey] = { kind, key: srcKey };
            });

          // handle slot/children — must be set before getElm so ${children} resolves in the child's template
          child.children = placeholder.innerHTML.trim();

          const elm = child.__OLUM__.getElm;
          if (elm) {
            elm.setAttribute("data-o-if", placeholder.getAttribute("if") ? placeholder.getAttribute("if") : "olum-no-condition"); // display if condition value (truthy, falsy)
            placeholder.replaceWith(elm);
            renderChildren(child, instanceKey, elm); // recurse into this child's own subtree
          }
        });
      }

      renderChildren(comp, compKey, rootElm);
      return rootElm;
    },
    getInnerNames(entry) {
      const comps = [];
      const map = window.olum.app.map;
      if (map) {
        map.find((obj) => {
          if (obj.name == entry) obj.children.forEach((child) => comps.push(child));
        });
      }

      function recursive(num) {
        const child = comps[num];
        map.forEach((obj) => {
          if (obj.name == child) obj.children.forEach((item) => comps.push(item));
        });
        if (num + 1 <= comps.length) recursive(num + 1);
      }

      if (comps.length) recursive(0);

      // console.warn("innerComps: ", comps);
      return comps;
    },
  };

  if (typeof window !== "undefined") window.olum = olum;

  class Olum {
    root = null;
    $(s) {
      this.root = document.querySelector(s);
      return this;
    }

    use(comp) {
      if (comp) {
        const isRouter = typeof comp?.name === "function" && comp.name() === "Router";
        const isComponent = typeof comp?.name == "string" && comp.name === "default";
        if (isRouter) {
          this.useRouter(comp);
        } else if (isComponent) {
          this.useComponent(comp)
        } else {
          throw new Error("Can't mount, Missing component or router @use()");
        }
      }
    }

    useRouter(router) {
      // share props/methods with router
      router.__proto__.rootElm = this.root;
      router.render = (view) => this.useComponent(view);
      if (router.isReady) router.listen();
    }

    useComponent(comp) {
      const entry = comp();
      const { store, rootKey } = this.share(entry);
      const tree = window.olum.buildTree(entry, store, rootKey);
      if (!tree) return console.warn("olum: couldn't build tree!");

      this.setupListeners(store); // unmounted hook & state system

      this.root.innerHTML = ""; // clear any previously mounted view (router navigation)
      this.root.append(tree); // bind full comps tree
      // handle mounted hook
      if (entry.hooks.mounted) {
        const onMount = entry.hooks.mounted; // force mounting parent component (entry point comp) regardless of the data-o-if value
        const onTeardown = onMount();
        entry.hooks.unMounted = onTeardown;
      }
      entry.hooks.isMounted = true;
      // mount every instance created during buildTree (keyed by runtime instance key)
      Object.keys(store).forEach((key) => {
        if (key === rootKey) return;
        const c = store[key];
        if (!c || !c.el) return;
        const ifConValue = c.el.getAttribute("data-o-if");
        if (!ifConValue) {
          // don't render comp because it has falsy value
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

    getPath(el, root) {
      const path = [];
      let cur = el;
      while (cur && cur !== root) {
        const parent = cur.parentElement;
        if (!parent) break;
        const siblings = Array.from(parent.children).filter((c) => c.tagName === cur.tagName);
        path.unshift({ tag: cur.tagName, index: siblings.indexOf(cur) });
        cur = parent;
      }
      return path;
    }

    findByPath(root, path) {
      let cur = root;
      for (const step of path) {
        const siblings = Array.from(cur.children).filter((c) => c.tagName === step.tag);
        cur = siblings[step.index];
        if (!cur) return null;
      }
      return cur;
    }

    setupListeners(store) {
      function mkHash(str) {
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
      }

      // const snapshots = {}; // persists across re-renders: { [compName]: Map<pathKey, entry> }

      window.addEventListener("updateOlumComp", (e) => {
        if (e && e.detail && e.detail.compName && e.detail.compId && e.detail.hash) {
          if (e.detail.hash !== mkHash(e.detail.compName + e.detail.compId)) return;
          const comp = store[e.detail.compName];
          if (!comp || !comp.el) return;
          if (!document.body.contains(comp.el)) return; // comp was unmounted; ignore stale state updates

          const compName = e.detail.compName;

          // snapshot input values of child components currently in DOM
          // only child components (data-child-of !== compName) so we don't overwrite state inputs with stale values
          // entries not updated here (hidden components) keep their previous snapshot value intact
          // if (!snapshots[compName]) snapshots[compName] = new Map();
          // comp.el.querySelectorAll("input, textarea, select").forEach(field => {
          //   const childOf = field.getAttribute("data-child-of");
          //   if (childOf && childOf !== compName) {
          //     const path = this.getPath(field, comp.el);
          //     const entry = { path };
          //     if (field.type === "checkbox" || field.type === "radio") entry.checked = field.checked;
          //     else entry.value = field.value;
          //     snapshots[compName].set(JSON.stringify(path), entry);
          //   }
          // });

          const innerNames = Object.keys(store).filter((name) => name !== compName);
          const prevMounted = {};
          innerNames.forEach((name) => {
            const c = store[name];
            if (c) prevMounted[name] = c.hooks.isMounted;
          });

          // get current active element location/path before re-render (buildTree)
          const activeEl = document.activeElement;
          const selStart = activeEl && activeEl.selectionStart != null ? activeEl.selectionStart : null;
          const selEnd = activeEl && activeEl.selectionEnd != null ? activeEl.selectionEnd : null;
          const activePath = activeEl && comp.el.contains(activeEl) ? this.getPath(activeEl, comp.el) : null;

          const treeElm = window.olum.buildTree(comp, store, compName);
          if (!treeElm) return console.warn("olum: couldn't build tree!");
          comp.el.replaceWith(treeElm);

          // restore child component input values after rebuild
          // snapshots[compName].forEach(({ path, value, checked }) => {
          //   const field = this.findByPath(treeElm, path);
          //   if (!field) return; // component is hidden in this render, skip
          //   if (checked !== undefined) field.checked = checked;
          //   else if (value !== undefined) field.value = value;
          // });

          // load prev active element after re-render (buildTree) to focus (e.g. input) or restore its data (e.g. forms)
          if (activePath && activePath.length) {
            const toRestore = this.findByPath(treeElm, activePath);
            if (toRestore) {
              if (toRestore.focus && typeof toRestore.focus == "function") toRestore.focus();
              if (selStart !== null && toRestore.setSelectionRange && typeof toRestore.setSelectionRange == "function")
                toRestore.setSelectionRange(selStart, selEnd);
            }
          }

          // after rebuild, call lifecycle hooks for any inner component that changed visibility.
          // recompute keys here so instances created during this rebuild (e.g. a grown loop) are included.
          const afterNames = Object.keys(store).filter((name) => name !== compName);
          afterNames.forEach((name) => {
            const c = store[name];
            if (!c) return;
            const isInDOM = document.body.contains(c.el);
            if (prevMounted[name] && !isInDOM) {
              // was mounted, now removed from DOM → unMounted
              if (c.hooks.unMounted && !c.hooks.isUnMounted) {
                const onTeardown = c.hooks.unMounted;
                if (onTeardown) onTeardown();
                c.hooks.isUnMounted = true;
                c.hooks.isMounted = false;
              }
            } else if (!prevMounted[name] && isInDOM) {
              // was not mounted, now in DOM → mounted
              if (c.hooks.mounted && !c.hooks.isMounted) {
                const onMount = c.hooks.mounted;
                const onTeardown = onMount();
                c.hooks.unMounted = onTeardown;
                c.hooks.isMounted = true;
                c.hooks.isUnMounted = false;
              }
            }
          });
        }
      });
    }

    share(entry) {
      // store now holds live instances keyed by runtime instance key; buildTree populates it lazily.
      // registry holds name->factory and is accumulated as the tree is walked.
      const store = {};
      const rootKey = entry.__OLUM__.compName;
      store[rootKey] = entry;
      Object.assign(window.olum.app, { store, registry: {} }); // this is a must to access live changes
      return { store, rootKey };
    }
  }

  return Olum;
})();

export const onMount = (cb) => cb