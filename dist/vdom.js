/**
* @name olum
* @version 0.10.0
* @copyright 2026 
* @author Eissa Saber
* @license MIT
*/
const vdom = {
  transition: {
    remove(parent, node) {
      parent.removeChild(node);
    },
    sync() {},
    primeIntros() {},
    flipCapture() {
      return null;
    },
    flipPlay() {},
  },
  mkStaging(el) {
    const s = document.createElement(el.tagName);
    const meta = el.getAttribute("data-olum");
    if (meta) s.setAttribute("data-olum", meta);
    s.__olumStagedFor = el;
    return s;
  },
  moveNode(parent, node, ref) {
    if (parent.moveBefore) {
      try {
        parent.moveBefore(node, ref);
        return;
      } catch (e) {}
    }
    parent.insertBefore(node, ref);
  },
  materialize(newNode) {
    const real = newNode.__olumStagedFor;
    if (!real) return newNode;
    this.patchNode(real, newNode);
    return real;
  },

  nodeKey(node) {
    if (node.nodeType !== 1) return null;
    if (node.__olumKey) return "c:" + node.__olumKey;
    const k = node.getAttribute("key");
    return k ? "k:" + k : null;
  },
  compatible(oldN, newN) {
    if (oldN.nodeType !== newN.nodeType) return false;
    if (
      oldN.nodeType === 1 &&
      (oldN.tagName !== newN.tagName ||
        this.nodeKey(oldN) !== this.nodeKey(newN))
    )
      return false;
    return true;
  },
  syncEvents(oldN, newN) {
    const olds = oldN.__olumEvt || [];
    const news = newN.__olumEvt || [];
    if (!olds.length && !news.length) return;

    const matchedNew = new Set();
    const keep = [];
    for (const o of olds) {
      const idx = news.findIndex(
        (n, i) => !matchedNew.has(i) && n.sig === o.sig,
      );
      if (idx !== -1) {
        matchedNew.add(idx);
        keep.push(o);
      } else {
        oldN.removeEventListener(o.name, o.handler, o.opts);
      }
    }
    news.forEach((n, i) => {
      if (matchedNew.has(i)) return;
      oldN.addEventListener(n.name, n.handler, n.opts);
      keep.push({ sig: n.sig, name: n.name, handler: n.handler, opts: n.opts });
    });
    oldN.__olumEvt = keep.length ? keep : null;
  },
  syncAttrs(oldN, newN) {
    let i = oldN.attributes.length;
    while (i--) {
      const name = oldN.attributes[i].name;
      if (!newN.hasAttribute(name)) oldN.removeAttribute(name);
    }
    for (i = 0; i < newN.attributes.length; i++) {
      const a = newN.attributes[i];
      if (oldN.getAttribute(a.name) !== a.value)
        oldN.setAttribute(a.name, a.value);
    }
  },

  setLiveValue(node, v) {
    if (node.value === v) return;
    if (document.activeElement === node && node.setSelectionRange) {
      const s = node.selectionStart;
      const e = node.selectionEnd;
      node.value = v;
      try {
        if (s !== null)
          node.setSelectionRange(Math.min(s, v.length), Math.min(e, v.length));
      } catch (err) {}
    } else {
      node.value = v;
    }
  },
  patchNode(oldN, newN) {
    if (oldN === newN) return;
    const type = oldN.nodeType;
    if (type === 3 || type === 8) {
      if (oldN.nodeValue !== newN.nodeValue) oldN.nodeValue = newN.nodeValue;
      return;
    }
    if (type !== 1) return;
    if (newN.__olumKey) oldN.__olumKey = newN.__olumKey;

    const tag = oldN.tagName;

    const valueChanged =
      tag === "INPUT" &&
      oldN.getAttribute("value") !== newN.getAttribute("value");
    const checkedChanged =
      tag === "INPUT" &&
      oldN.hasAttribute("checked") !== newN.hasAttribute("checked");

    this.syncAttrs(oldN, newN);
    this.syncEvents(oldN, newN);
    this.transition.sync(oldN, newN);

    if (tag === "INPUT") {
      if (valueChanged)
        this.setLiveValue(
          oldN,
          newN.getAttribute("value") === null ? "" : newN.getAttribute("value"),
        );
      if (checkedChanged) oldN.checked = newN.hasAttribute("checked");
      return;
    }
    if (tag === "TEXTAREA") {
      if (oldN.textContent !== newN.textContent) {
        oldN.textContent = newN.textContent;
        this.setLiveValue(oldN, newN.textContent);
      }
      return;
    }
    if (tag === "SELECT") {
      const defaultsOf = (sel) => {
        const opts = sel.querySelectorAll("option[selected]");
        let s = "";
        for (let d = 0; d < opts.length; d++) s += opts[d].value + "\u0001";
        return s;
      };
      const prevValue = oldN.value;
      const prevDefaults = defaultsOf(oldN);
      this.patchChildren(oldN, newN);
      const newDefaults = defaultsOf(newN);
      if (newDefaults && newDefaults !== prevDefaults) {
        let j = oldN.options.length;
        while (j--)
          oldN.options[j].selected = oldN.options[j].hasAttribute("selected");
      } else if (oldN.value !== prevValue) {
        let j = oldN.options.length;
        while (j--) {
          if (oldN.options[j].value === prevValue) {
            oldN.value = prevValue;
            break;
          }
        }
      }
      return;
    }
    this.patchChildren(oldN, newN);
  },
  patchChildren(oldParent, newParent) {
    const newKids = Array.prototype.slice.call(newParent.childNodes);

    let keyedOld = null;
    for (let c = oldParent.firstChild; c; c = c.nextSibling) {
      const k = this.nodeKey(c);
      if (k) (keyedOld || (keyedOld = {}))[k] = c;
    }
    let wanted = null;
    if (keyedOld) {
      wanted = {};
      for (let w = 0; w < newKids.length; w++) {
        const wk = this.nodeKey(newKids[w]);
        if (wk) wanted[wk] = true;
      }
    }
    let oldKid = oldParent.firstChild;
    for (let i = 0; i < newKids.length; i++) {
      const newKid = newKids[i];
      const k = this.nodeKey(newKid);
      if (k && keyedOld && keyedOld[k]) {
        const match = keyedOld[k];
        delete keyedOld[k];
        if (match === oldKid) oldKid = oldKid.nextSibling;
        else this.moveNode(oldParent, match, oldKid);
        if (this.compatible(match, newKid)) {
          this.patchNode(match, newKid);
        } else {
          oldParent.replaceChild(this.materialize(newKid), match);
        }
        continue;
      }
      if (!oldKid) {
        oldParent.appendChild(this.materialize(newKid));
        continue;
      }
      const ck = this.nodeKey(oldKid);
      if (ck && wanted && wanted[ck] && keyedOld && keyedOld[ck]) {
        oldParent.insertBefore(this.materialize(newKid), oldKid);
        continue;
      }
      if (this.compatible(oldKid, newKid)) {
        const kept = oldKid;
        oldKid = oldKid.nextSibling;
        this.patchNode(kept, newKid);
        continue;
      }

      let matched = -1;
      for (let j = i + 1; j < newKids.length && j <= i + 10; j++) {
        if (this.nodeKey(newKids[j])) break;
        if (this.compatible(oldKid, newKids[j])) {
          matched = j;
          break;
        }
      }
      if (matched !== -1) {
        while (i < matched) {
          oldParent.insertBefore(this.materialize(newKids[i]), oldKid);
          i++;
        }
        this.patchNode(oldKid, newKids[i]);
        oldKid = oldKid.nextSibling;
        continue;
      }

      let aheadMatch = null;
      let steps = 0;
      for (
        let sib = oldKid.nextSibling;
        sib && steps < 10;
        sib = sib.nextSibling, steps++
      ) {
        if (this.nodeKey(sib)) break;
        if (this.compatible(sib, newKid)) {
          aheadMatch = sib;
          break;
        }
      }
      if (aheadMatch) {
        while (oldKid !== aheadMatch) {
          const nx = oldKid.nextSibling;
          this.transition.remove(oldParent, oldKid);
          oldKid = nx;
        }
        this.patchNode(oldKid, newKid);
        oldKid = oldKid.nextSibling;
        continue;
      }

      const m = this.materialize(newKid);
      const next = oldKid.nextSibling;
      oldParent.replaceChild(m, oldKid);
      oldKid = next;
    }

    while (oldKid) {
      const next = oldKid.nextSibling;
      this.transition.remove(oldParent, oldKid);
      oldKid = next;
    }
  },

  patch(liveEl, stagedEl) {
    try {
      const flips = this.transition.flipCapture(liveEl);
      this.patchNode(liveEl, stagedEl);

      this.transition.primeIntros(liveEl);
      if (flips) this.transition.flipPlay(flips);
      return true;
    } catch (err) {
      console.warn("olum: patch failed — falling back to full re-render", err);
      liveEl.innerHTML = "";
      while (stagedEl.firstChild) {
        const kid = stagedEl.firstChild;
        stagedEl.removeChild(kid);
        try {
          liveEl.appendChild(this.materialize(kid));
        } catch (e) {
          liveEl.appendChild(kid);
        }
      }
      return false;
    }
  },
};

export default vdom;
