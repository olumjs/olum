export default function createStore(self) {
  return (init) => {
    const target = {};
    const subs = new Set(); // runtime instance keys of components that read this store during render
    let scheduled = false;
    const proxies = new WeakMap(); // raw object -> proxy: wrap each object once so identity stays stable
    const raws = new WeakMap(); // proxy -> raw object: unwrap values assigned back into the store

    function flush() {
      scheduled = false;
      const appStore = (self.app && self.app.store) || {};
      const live = [];
      subs.forEach(function (key) {
        const c = appStore[key];
        if (!c || !c.el || !document.body.contains(c.el)) {
          return subs.delete(key);
        }
        live.push(key);
      });
      live.forEach(function (key) {
        const covered = live.some(function (other) {
          return other !== key && key.indexOf(other + ">") === 0;
        });
        if (covered) return;
        const c = appStore[key];
        const meta = JSON.parse(c.el.getAttribute("data-olum")); // { compName, compId } set by mkElm
        self.$emit("updateOlumComp", {
          compName: key,
          compId: meta.compId,
          hash: self.mkHash(key + meta.compId),
        });
      });
    }

    function notify() {
      if (scheduled) return;
      scheduled = true;
      Promise.resolve().then(flush);
    }

    function track() {
      if (self.__renderingKey) subs.add(self.__renderingKey);
    }

    const objHandler = {
      get: function (obj, key) {
        track();
        return wrap(obj[key]);
      },
      set: function (obj, key, val) {
        val = raws.get(val) || val;
        if (obj[key] === val) return true;
        obj[key] = val;
        notify();
        return true;
      },
      deleteProperty: function (obj, key) {
        if (!(key in obj)) return true;
        delete obj[key];
        notify();
        return true;
      },
    };

    // Map/Set methods read internal slots, which proxies can't forward — so every method is
    // rebound to run against the raw collection: mutators notify, Map.get results are wrapped.
    const collectionMutators = ["set", "add", "delete", "clear"];
    const collectionHandler = {
      get: function (coll, key) {
        track();
        const val = coll[key];
        if (typeof val !== "function") return val; // e.g. size
        return function (...args) {
          const result = val.apply(
            coll,
            args.map((a) => raws.get(a) || a)
          );
          if (collectionMutators.includes(key)) notify();
          return key === "get" ? wrap(result) : result;
        };
      },
    };

    // deep reactivity is limited to what can safely cross a proxy: plain objects, arrays,
    // Map, Set. Anything else (Date, DOM nodes, class instances...) passes through raw.
    function wrap(val) {
      if (val === null || typeof val !== "object") return val;
      const isCollection = val instanceof Map || val instanceof Set;
      if (!isCollection && !Array.isArray(val)) {
        const proto = Object.getPrototypeOf(val);
        if (proto !== Object.prototype && proto !== null) return val;
      }
      let p = proxies.get(val);
      if (!p) {
        p = new Proxy(val, isCollection ? collectionHandler : objHandler);
        proxies.set(val, p);
        raws.set(p, val);
      }
      return p;
    }

    Object.assign(target, init || {});
    return wrap(target);
  };
}
