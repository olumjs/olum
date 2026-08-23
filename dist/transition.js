/**
* @name olum
* @version 0.9.5
* @copyright 2026 
* @author Eissa Saber
* @license MIT
*/
const transition = {
  easings: {
    linear: (t) => t,

    backIn: (t) => {
      const s = 1.70158;
      return t * t * ((s + 1) * t - s);
    },
    backOut: (t) => {
      const s = 1.70158;
      return --t * t * ((s + 1) * t + s) + 1;
    },
    backInOut: (t) => {
      const s = 1.70158 * 1.525;
      if ((t *= 2) < 1) return 0.5 * (t * t * ((s + 1) * t - s));
      return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
    },

    bounceOut: (t) => {
      const a = 4.0 / 11.0,
        b = 8.0 / 11.0,
        c = 9.0 / 10.0;
      const ca = 4356.0 / 361.0,
        cb = 35442.0 / 1805.0,
        cc = 16061.0 / 1805.0;
      const t2 = t * t;
      return t < a
        ? 7.5625 * t2
        : t < b
          ? 9.075 * t2 - 9.9 * t + 3.4
          : t < c
            ? ca * t2 - cb * t + cc
            : 10.8 * t * t - 20.52 * t + 10.72;
    },
    bounceIn: (t) => 1.0 - transition.easings.bounceOut(1.0 - t),
    bounceInOut: (t) =>
      t < 0.5
        ? 0.5 * (1.0 - transition.easings.bounceOut(1.0 - t * 2.0))
        : 0.5 * transition.easings.bounceOut(t * 2.0 - 1.0) + 0.5,

    circIn: (t) => 1.0 - Math.sqrt(1.0 - t * t),
    circOut: (t) => Math.sqrt(1 - --t * t),
    circInOut: (t) => {
      if ((t *= 2) < 1) return -0.5 * (Math.sqrt(1 - t * t) - 1);
      return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
    },

    cubicIn: (t) => t * t * t,
    cubicOut: (t) => {
      const f = t - 1;
      return f * f * f + 1;
    },
    cubicInOut: (t) =>
      t < 0.5 ? 4 * t * t * t : 0.5 * Math.pow(2 * t - 2, 3) + 1,

    elasticIn: (t) =>
      Math.sin((13.0 * t * Math.PI) / 2) * Math.pow(2.0, 10.0 * (t - 1.0)),
    elasticOut: (t) =>
      Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) +
      1.0,
    elasticInOut: (t) =>
      t < 0.5
        ? 0.5 *
          Math.sin(((+13.0 * Math.PI) / 2) * 2.0 * t) *
          Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
        : 0.5 *
            Math.sin(((-13.0 * Math.PI) / 2) * (2.0 * t - 1.0 + 1.0)) *
            Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) +
          1.0,

    expoIn: (t) => (t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0))),
    expoOut: (t) => (t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t)),
    expoInOut: (t) =>
      t === 0.0 || t === 1.0
        ? t
        : t < 0.5
          ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0)
          : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0,

    quadIn: (t) => t * t,
    quadOut: (t) => -t * (t - 2.0),
    quadInOut: (t) => {
      t /= 0.5;
      if (t < 1) return 0.5 * t * t;
      t--;
      return -0.5 * (t * (t - 2) - 1);
    },

    quartIn: (t) => Math.pow(t, 4.0),
    quartOut: (t) => Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0,
    quartInOut: (t) =>
      t < 0.5 ? +8.0 * Math.pow(t, 4.0) : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0,

    quintIn: (t) => t * t * t * t * t,
    quintOut: (t) => --t * t * t * t * t + 1,
    quintInOut: (t) => {
      if ((t *= 2) < 1) return 0.5 * t * t * t * t * t;
      return 0.5 * ((t -= 2) * t * t * t * t + 2);
    },

    sineIn: (t) => {
      const v = Math.cos(t * Math.PI * 0.5);
      return Math.abs(v) < 1e-14 ? 1 : 1 - v;
    },
    sineOut: (t) => Math.sin((t * Math.PI) / 2),
    sineInOut: (t) => -0.5 * (Math.cos(Math.PI * t) - 1),
  },

  resolveEasing(e) {
    if (typeof e === "function") return e;
    if (typeof e === "string" && this.easings[e]) return this.easings[e];
    return null;
  },

  transitions: {
    fade(node, o) {
      o = o || {};
      const op = +getComputedStyle(node).opacity;
      return {
        delay: o.delay || 0,
        duration: o.duration == null ? 400 : o.duration,
        easing: o.easing || transition.easings.linear,
        css: (t) => `opacity: ${t * op}`,
      };
    },
    fly(node, o) {
      o = o || {};
      const style = getComputedStyle(node);
      const target = +style.opacity;
      const tf = style.transform === "none" ? "" : style.transform;
      const x = o.x || 0,
        y = o.y || 0,
        od = target * (1 - (o.opacity || 0));
      return {
        delay: o.delay || 0,
        duration: o.duration == null ? 400 : o.duration,
        easing: o.easing || transition.easings.cubicOut,
        css: (t, u) =>
          `transform: ${tf} translate(${u * x}px, ${u * y}px); opacity: ${target - od * u}`,
      };
    },
    scale(node, o) {
      o = o || {};
      const style = getComputedStyle(node);
      const target = +style.opacity;
      const tf = style.transform === "none" ? "" : style.transform;
      const sd = 1 - (o.start == null ? 0 : o.start),
        od = target * (1 - (o.opacity == null ? 0 : o.opacity));
      return {
        delay: o.delay || 0,
        duration: o.duration == null ? 400 : o.duration,
        easing: o.easing || transition.easings.cubicOut,
        css: (t, u) =>
          `transform: ${tf} scale(${1 - sd * u}); opacity: ${target - od * u}`,
      };
    },
    slide(node, o) {
      o = o || {};
      const s = getComputedStyle(node);
      const h = parseFloat(s.height),
        py = parseFloat(s.paddingTop),
        pb = parseFloat(s.paddingBottom),
        my = parseFloat(s.marginTop),
        mb = parseFloat(s.marginBottom);
      return {
        delay: o.delay || 0,
        duration: o.duration == null ? 400 : o.duration,
        easing: o.easing || transition.easings.cubicOut,
        css: (t) =>
          `overflow:hidden; height:${t * h}px; padding-top:${t * py}px; padding-bottom:${t * pb}px; margin-top:${t * my}px; margin-bottom:${t * mb}px`,
      };
    },
    draw(node, o) {
      o = o || {};
      let len = 0;
      try {
        len = node.getTotalLength();
      } catch (e) {}
      const duration =
        o.duration == null
          ? o.speed == null
            ? 800
            : len / o.speed
          : o.duration;
      return {
        delay: o.delay || 0,
        duration,
        easing: o.easing || transition.easings.cubicInOut,
        css: (t, u) =>
          `stroke-dasharray: ${len}; stroke-dashoffset: ${u * len}`,
      };
    },
  },

  animate(node, config, dir, onDone) {
    config = config || {};
    const delay = config.delay || 0;
    const duration = config.duration == null ? 400 : config.duration;
    const easing = config.easing || this.easings.linear;
    const css = config.css,
      tick = config.tick;

    const base =
      node.__olumBaseStyle != null ? node.__olumBaseStyle : node.style.cssText;
    const now = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const raf =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (cb) => setTimeout(() => cb(now()), 16);
    const caf =
      typeof cancelAnimationFrame === "function"
        ? cancelAnimationFrame
        : clearTimeout;
    const start = now() + delay;
    const end = start + duration;
    let handle;
    const apply = (p) => {
      const eased = easing(Math.min(1, Math.max(0, p)));
      const t = dir === 1 ? eased : 1 - eased;
      if (css) node.style.cssText = base + ";" + css(t, 1 - t);
      if (tick) tick(t, 1 - t);
    };
    apply(0);
    const frame = () => {
      const p = duration <= 0 ? 1 : (now() - start) / duration;
      if (now() < start) {
        handle = raf(frame);
        return;
      }
      apply(p);
      if (now() < end) handle = raf(frame);
      else {
        if (dir === 1) node.style.cssText = base;
        if (onDone) onDone();
      }
    };
    handle = raf(frame);
    return () => caf(handle);
  },

  _start(node, result, dir, done) {
    const go = (config) => {
      if (!config) {
        if (dir === 1 && node.__olumBaseStyle != null)
          node.style.cssText = node.__olumBaseStyle;
        node.__olumAnim = null;
        if (done) done();
        return;
      }
      node.__olumAnim = this.animate(node, config, dir, () => {
        node.__olumAnim = null;
        if (done) done();
      });
    };
    if (typeof result === "function") {
      (typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (cb) => setTimeout(cb, 16))(() => go(result()));
    } else {
      go(result);
    }
  },
  playIntro(node) {
    const spec = node.__olumTrans;
    if (!spec || !spec.in || node.__olumIntroDone) return;

    if (!node.isConnected) {
      if ((node.__olumIntroTries = (node.__olumIntroTries || 0) + 1) <= 5) {
        (typeof requestAnimationFrame === "function"
          ? requestAnimationFrame
          : (cb) => setTimeout(cb, 16))(() => this.playIntro(node));
      }
      return;
    }
    node.__olumIntroDone = true;
    if (node.removeAttribute) node.removeAttribute("data-o-intro");
    const ev = spec.events || {};
    if (node.__olumAnim) node.__olumAnim();
    if (ev.introstart) ev.introstart();

    let result;
    if (node.__olumIntroPrimed) {
      result = node.__olumIntroResult;
      node.__olumIntroPrimed = false;
      node.__olumIntroResult = null;
    } else result = spec.in.fn(node, spec.in.params);
    this._start(node, result, 1, () => {
      if (ev.introend) ev.introend();
    });
  },

  primeIntros(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    const nodes = root.querySelectorAll("[data-o-intro]");
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const spec = node.__olumTrans;
      if (
        !spec ||
        !spec.in ||
        node.__olumIntroDone ||
        node.__olumIntroPrimed ||
        !node.isConnected
      )
        continue;
      const base =
        node.__olumBaseStyle != null
          ? node.__olumBaseStyle
          : node.style.cssText;
      let result = spec.in.fn(node, spec.in.params);
      if (typeof result === "function") result = result();
      node.__olumIntroPrimed = true;
      node.__olumIntroResult = result;
      if (result && result.css)
        node.style.cssText = (base ? base + ";" : "") + result.css(0, 1);
      else if (result && result.tick) result.tick(0, 1);
      else node.style.opacity = "0";
    }
  },
  playOutro(node, onDone) {
    const spec = node.__olumTrans;
    if (!spec || !spec.out) return onDone();
    node.__olumLeaving = true;
    const ev = spec.events || {};
    if (node.__olumAnim) node.__olumAnim();
    if (ev.outrostart) ev.outrostart();
    this._start(node, spec.out.fn(node, spec.out.params), -1, () => {
      if (ev.outroend) ev.outroend();
      onDone();
    });
  },

  remove(parent, node) {
    if (node.nodeType === 1 && node.__olumLeaving) return;
    if (node.nodeType === 1 && node.__olumTrans && node.__olumTrans.out) {
      if (node.__olumFlip !== undefined) this.freezeOutOfFlow(node);
      this.playOutro(node, () => {
        if (node.parentNode === parent) parent.removeChild(node);
      });
      return;
    }
    parent.removeChild(node);
  },

  freezeOutOfFlow(node) {
    if (node.__olumFrozen || !node.style) return;
    const freeze =
      "position:absolute;margin:0;box-sizing:border-box;top:" +
      node.offsetTop +
      "px;left:" +
      node.offsetLeft +
      "px;width:" +
      node.offsetWidth +
      "px;height:" +
      node.offsetHeight +
      "px;";
    const clean =
      node.__olumBaseStyle != null ? node.__olumBaseStyle : node.style.cssText;
    node.__olumFrozen = true;
    node.__olumPreFreezeBase = node.__olumBaseStyle;
    node.__olumBaseStyle = (clean ? clean + ";" : "") + freeze;
    node.style.cssText = node.__olumBaseStyle;
  },
  unfreeze(node) {
    if (!node.__olumFrozen) return;
    node.__olumFrozen = false;
    node.__olumBaseStyle = node.__olumPreFreezeBase;
    node.__olumPreFreezeBase = undefined;
  },

  sync(oldN, newN) {
    if (newN.__olumTrans) oldN.__olumTrans = newN.__olumTrans;
    if (newN.__olumFlip !== undefined) oldN.__olumFlip = newN.__olumFlip;
    if (oldN.__olumLeaving) {
      if (oldN.__olumAnim) oldN.__olumAnim();
      oldN.__olumLeaving = false;
      oldN.__olumIntroDone = false;
      oldN.__olumIntroPrimed = false;
      this.unfreeze(oldN);
      oldN.style.cssText = oldN.__olumBaseStyle || oldN.style.cssText;
      this.playIntro(oldN);
    } else if (oldN.removeAttribute && oldN.hasAttribute("data-o-intro")) {
      oldN.removeAttribute("data-o-intro");
    }
  },

  crossfade(opts) {
    opts = opts || {};
    const self = transition;
    const defaults = {
      delay: opts.delay || 0,
      duration: opts.duration,
      easing: opts.easing,
    };
    const fallback = opts.fallback;
    const toSend = new Map();
    const toReceive = new Map();

    const build = (fromRect, node, toRect, params) => {
      const o = Object.assign({}, defaults, params);
      const easing = self.resolveEasing(o.easing) || self.easings.cubicOut;
      const dx = fromRect.left - toRect.left;
      const dy = fromRect.top - toRect.top;
      const dw = toRect.width ? fromRect.width / toRect.width : 1;
      const dh = toRect.height ? fromRect.height / toRect.height : 1;
      const d = Math.sqrt(dx * dx + dy * dy);
      const style =
        typeof getComputedStyle === "function"
          ? getComputedStyle(node)
          : { transform: "none", opacity: "1" };
      const tf = style.transform === "none" ? "" : style.transform;
      const opacity = +style.opacity;
      let duration =
        o.duration == null ? (dd) => Math.sqrt(dd) * 30 : o.duration;
      duration = typeof duration === "function" ? duration(d) : duration;
      return {
        delay: o.delay || 0,
        duration,
        easing,
        css: (t, u) =>
          "opacity:" +
          t * opacity +
          "; transform-origin: top left; transform:" +
          tf +
          " translate(" +
          u * dx +
          "px," +
          u * dy +
          "px) scale(" +
          (t + (1 - t) * dw) +
          "," +
          (t + (1 - t) * dh) +
          ");",
      };
    };

    const side = (mine, theirs, intro) => (node, params) => {
      const key = (params || {}).key;
      const rect = node.getBoundingClientRect();
      mine.set(key, { node, rect });
      return () => {
        if (theirs.has(key)) {
          const other = theirs.get(key);
          theirs.delete(key);
          return build(other.rect, node, rect, params);
        }
        mine.delete(key);
        return fallback ? fallback(node, params, intro) : null;
      };
    };

    return [side(toSend, toReceive, false), side(toReceive, toSend, true)];
  },

  flipCapture(root) {
    if (!root || typeof root.querySelectorAll !== "function") return null;
    const nodes = root.querySelectorAll("[data-o-flip]");
    if (!nodes.length) return null;
    const snap = [];
    for (let i = 0; i < nodes.length; i++)
      snap.push({ node: nodes[i], rect: nodes[i].getBoundingClientRect() });
    return snap;
  },
  flipPlay(snap) {
    if (!snap) return;
    for (let i = 0; i < snap.length; i++) {
      const node = snap[i].node;
      if (!node.isConnected) continue;
      if (node.__olumLeaving) continue;

      const first = snap[i].rect;
      const last = node.getBoundingClientRect();
      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
      const p = node.__olumFlip || {};
      const easing = this.resolveEasing(p.easing) || this.easings.cubicOut;
      const duration = p.duration == null ? 300 : p.duration;
      const delay = p.delay || 0;
      if (node.__olumFlipAnim) node.__olumFlipAnim();
      const base = node.style.cssText;
      const baseTf = node.style.transform ? node.style.transform + " " : "";
      const done = () => {
        node.style.cssText = base;
        node.__olumFlipAnim = null;
      };
      node.__olumFlipAnim = this._ticker(
        duration,
        delay,
        easing,
        (t) => {
          const u = 1 - t;
          node.style.transform =
            baseTf + "translate(" + u * dx + "px," + u * dy + "px)";
        },
        done,
      );
    }
  },

  _ticker(duration, delay, easing, onFrame, onDone) {
    const now = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const raf =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (cb) => setTimeout(() => cb(now()), 16);
    const caf =
      typeof cancelAnimationFrame === "function"
        ? cancelAnimationFrame
        : clearTimeout;
    const start = now() + (delay || 0);
    const end = start + duration;
    let handle;
    const frame = () => {
      const t = now();
      if (t < start) {
        handle = raf(frame);
        return;
      }
      const p = duration <= 0 ? 1 : (t - start) / duration;
      onFrame(easing(Math.min(1, Math.max(0, p))));
      if (t < end) handle = raf(frame);
      else if (onDone) onDone();
    };
    onFrame(easing(0));
    handle = raf(frame);
    return () => caf(handle);
  },
};

export default transition;
