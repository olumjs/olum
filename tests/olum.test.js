// ============================================================================
// OlumJS runtime test suite — the counterpart to compiler.test.js.
//
// compiler.test.js exercises the *compiler* (a pure string->string function).
// This file exercises the *runtime* in core/olum.js: the browser-side helpers
// the compiled output calls at render time — escaping, reactivity (proxyHandler),
// the props() accessor, DOM helpers, the component tree builder, etc.
//
// The runtime is written as an ES module that expects a DOM (`window`/`document`)
// and installs itself as `window.olum`. We load it under jsdom: read the source,
// rewrite its `export`s into locals, and eval it against a fresh jsdom global so
// each `load()` gets an isolated `window.olum` (tests that mutate window.olum.app
// don't leak into one another).
//
// Run:  node tests/olum.test.js
// ============================================================================

const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

let passed = 0;
let failed = 0;

// ── Output styling (copied from compiler.test.js so the two suites look alike) ─
const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, s) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => paint("32", s);
const red = (s) => paint("31", s);
const dim = (s) => paint("2", s);
const bold = (s) => paint("1", s);
const yellow = (s) => paint("33", s);
const cyan = (s) => paint("36", s);
const PASS_ICON = green("✔");
const FAIL_ICON = red("✖");

// ── Runtime loader ───────────────────────────────────────────────────────────
// Build a fresh jsdom + a freshly-evaluated copy of core/olum.js. `export default`
// (the Olum class) and the `export const` accessors are rewritten to plain locals
// and handed back so tests can reach both the class and the `window.olum` singleton.
const OLUM_SRC = fs.readFileSync(path.join(__dirname, "../core/olum.js"), "utf8");
function load() {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", { url: "http://localhost/" });
  // The module reads bare `window`/`document`/`CustomEvent`; point the node globals
  // at this jsdom instance so its own `window.olum = olum` install lands here.
  global.window = dom.window;
  global.document = dom.window.document;
  global.CustomEvent = dom.window.CustomEvent;
  global.Node = dom.window.Node;

  let src = OLUM_SRC.replace(/^\s*export\s+default\s+/m, "const __OlumClass = ").replace(/^\s*export\s+const\s+/gm, "const ");
  // `params` is intentionally omitted — it's router-bound (delegates to extractParams,
  // which lives outside this module) and is covered by the router's own tests.
  src += "\n;return { Olum: __OlumClass, onMount: onMount, props: props };";
  const exported = new Function(src)();
  return { window: dom.window, document: dom.window.document, olum: dom.window.olum, ...exported };
}

// ── Section / check plumbing (mirrors compiler.test.js) ───────────────────────
let currentSection = "(no section)";
const failedSections = [];

function recordFail(name) {
  failed++;
  failedSections.push({ section: currentSection, name });
}

function check(name, fn) {
  let ok = false;
  let detail = "";
  try {
    ok = fn();
  } catch (e) {
    detail = " (" + e.message + ")";
  }
  if (ok) {
    passed++;
    console.log("  " + PASS_ICON + " " + name);
  } else {
    recordFail(name);
    console.log("  " + FAIL_ICON + " " + red(name) + dim(detail));
    console.log("      " + dim("↳ in " + currentSection));
  }
}

function section(title) {
  currentSection = title;
  console.log("\n" + bold(cyan(title)));
}

console.log("\n" + bold("🧪 OlumJS runtime fixtures") + "\n========================");

// ── §0 module loads & self-installs ──────────────────────────────────────────
// If the ESM→locals rewrite in load() ever breaks, every downstream test would
// fail with the same opaque error; this pins the failure to the loader itself.
section("§0 module bootstrap");

check("evaluating the module installs window.olum", () => {
  const { window } = load();
  return window.olum && typeof window.olum.esc === "function" && typeof window.olum.buildTree === "function";
});

check("the default export is the Olum class", () => {
  const { Olum } = load();
  return typeof Olum === "function" && typeof new Olum().use === "function";
});

// ── §1 esc() — escape-by-default ─────────────────────────────────────────────
section("§1 esc() escape-by-default");

check("escapes <, >, & into entities", () => {
  const { olum } = load();
  return olum.esc("<b> & </b>") === "&lt;b&gt; &amp; &lt;/b&gt;";
});

check("escapes double and single quotes", () => {
  const { olum } = load();
  return olum.esc(`"a" 'b'`) === "&quot;a&quot; &#39;b&#39;";
});

check("null and undefined render as empty string", () => {
  const { olum } = load();
  return olum.esc(null) === "" && olum.esc(undefined) === "";
});

check("numbers and plain strings pass through (stringified)", () => {
  const { olum } = load();
  return olum.esc(42) === "42" && olum.esc("hi") === "hi";
});

check("ampersand is escaped first (no double-escaping)", () => {
  const { olum } = load();
  // "&lt;" input must become "&amp;lt;" — not "&amp;amp;lt;"
  return olum.esc("&lt;") === "&amp;lt;";
});

check("olum.html() marker is passed through unescaped", () => {
  const { olum } = load();
  return olum.esc(olum.html("<i>raw</i>")) === "<i>raw</i>";
});

// ── §2 html() — raw-HTML opt-in ──────────────────────────────────────────────
section("§2 html() raw opt-in");

check("returns an __olumHtml marker object", () => {
  const { olum } = load();
  const m = olum.html("<b>x</b>");
  return m.__olumHtml === true && m.html === "<b>x</b>";
});

check("null/undefined value becomes empty string", () => {
  const { olum } = load();
  return olum.html(null).html === "" && olum.html(undefined).html === "";
});

// ── §3 clean() ────────────────────────────────────────────────────────────────
section("§3 clean()");

check('the literal string "null" becomes null', () => {
  const { olum } = load();
  return olum.clean("null") === null;
});

check("trims surrounding whitespace", () => {
  const { olum } = load();
  return olum.clean("  hi  ") === "hi";
});

// ── §4 type guards ────────────────────────────────────────────────────────────
section("§4 type guards");

check("isObj: objects/arrays true, null/primitives false", () => {
  const { olum } = load();
  return olum.isObj({}) && olum.isObj([]) && !olum.isObj(null) && !olum.isObj("s") && !olum.isObj(3);
});

check("isFullArr: non-empty array only", () => {
  const { olum } = load();
  return olum.isFullArr([1]) && !olum.isFullArr([]) && !olum.isFullArr({ a: 1 });
});

check("isFullObj: object with keys only", () => {
  const { olum } = load();
  return olum.isFullObj({ a: 1 }) && !olum.isFullObj({});
});

// ── §5 mkElm() ────────────────────────────────────────────────────────────────
section("§5 mkElm()");

check("creates an element of the requested tag", () => {
  const { olum } = load();
  return olum.mkElm("section").tagName === "SECTION";
});

check("stamps data-olum JSON when name+id given", () => {
  const { olum } = load();
  const el = olum.mkElm("div", "Card", "42");
  return JSON.parse(el.getAttribute("data-olum")).compName === "Card";
});

check("omits data-olum when name/id are missing", () => {
  const { olum } = load();
  return olum.mkElm("div").getAttribute("data-olum") === null;
});

// ── §6 injectStyle() ──────────────────────────────────────────────────────────
section("§6 injectStyle()");

check("injects a <style> tag with the css into <head>", () => {
  const { olum, document } = load();
  olum.injectStyle("Card", ".x{color:red}");
  const tag = document.getElementById("olum-style-Card");
  return !!tag && tag.textContent === ".x{color:red}";
});

check("is idempotent — same component injects once", () => {
  const { olum, document } = load();
  olum.injectStyle("Card", ".x{color:red}");
  olum.injectStyle("Card", ".x{color:blue}");
  return document.querySelectorAll("#olum-style-Card").length === 1;
});

check("empty / whitespace css injects nothing", () => {
  const { olum, document } = load();
  olum.injectStyle("Empty", "   ");
  return document.getElementById("olum-style-Empty") === null;
});

// ── §7 proxyHandler() — reactivity ────────────────────────────────────────────
section("§7 proxyHandler() reactivity");

// The proxy needs an __olum__ tag (compName/compId) to build the update event.
function reactiveState(extra) {
  const { olum, window } = load();
  const state = Object.assign({ count: 0, __olum__: { compName: "App", compId: "1" } }, extra);
  return { olum, window, state };
}

check("get returns the underlying value", () => {
  const { olum, state } = reactiveState();
  const p = olum.proxyHandler(state, null, null);
  return p.count === 0;
});

check("set emits an updateOlumComp event", () => {
  const { olum, window, state } = reactiveState();
  const p = olum.proxyHandler(state, null, null);
  let fired = null;
  window.addEventListener("updateOlumComp", (e) => (fired = e.detail));
  p.count = 5;
  return p.count === 5 && fired && fired.compName === "App";
});

check("setting the same value does not emit", () => {
  const { olum, window, state } = reactiveState();
  const p = olum.proxyHandler(state, null, null);
  let fired = 0;
  window.addEventListener("updateOlumComp", () => fired++);
  p.count = 0; // same as initial
  return fired === 0;
});

check("the __olum__ tag is write-protected", () => {
  const { olum, state } = reactiveState();
  const p = olum.proxyHandler(state, null, null);
  let threw = false;
  try {
    p.__olum__ = "hacked";
  } catch (e) {
    threw = true; // strict-mode proxies throw on a false set trap
  }
  return threw || p.__olum__.compName === "App";
});

check("a matching watcher is called with (oldVal, newVal)", () => {
  const { olum, state } = reactiveState();
  let seen = null;
  const watcher = { count: (o, n) => (seen = [o, n]) };
  const p = olum.proxyHandler(state, watcher, null);
  p.count = 7;
  return seen && seen[0] === 0 && seen[1] === 7;
});

check("deleteProperty emits an update too", () => {
  const { olum, window, state } = reactiveState({ tmp: 1 });
  const p = olum.proxyHandler(state, null, null);
  let fired = false;
  window.addEventListener("updateOlumComp", () => (fired = true));
  delete p.tmp;
  return fired && !("tmp" in state);
});

// ── §8 proxyHandlerForStore() ─────────────────────────────────────────────────
section("§8 proxyHandlerForStore()");

check("writes mirror into the original proxy", () => {
  const { olum } = load();
  const original = {};
  const mirror = olum.proxyHandlerForStore({}, original);
  mirror.a = 9;
  return original.a === 9 && mirror.a === 9;
});

// ── §9 $emit() / dispatchEvent() ──────────────────────────────────────────────
section("§9 $emit()");

check("$emit dispatches a CustomEvent carrying the payload", () => {
  const { olum, window } = load();
  let detail = null;
  window.addEventListener("ping", (e) => (detail = e.detail));
  olum.$emit("ping", { n: 1 });
  return detail && detail.n === 1;
});

// ── §10 props() accessor ──────────────────────────────────────────────────────
section("§10 props() accessor");

// props(storeKey) proxies a live store entry: reads pull from incomingProps,
// writes chain up to the parent's state source.
function withStore(store) {
  const env = load();
  env.window.olum.app.store = store;
  return env;
}

check("reads a prop from the instance's incomingProps", () => {
  const { props } = withStore({ child: { incomingProps: { v: 11 } } });
  return props("child").v === 11;
});

check("exposes slot content as props().children", () => {
  const { props } = withStore({ child: { incomingProps: {}, children: "<p>hi</p>" } });
  return props("child").children === "<p>hi</p>";
});

check("a missing store entry yields undefined props", () => {
  const { props } = withStore({});
  return props("ghost").v === undefined;
});

check("writing a state-sourced prop writes back to the parent's state", () => {
  const { props } = withStore({
    child: {
      parentCompName: "parent",
      incomingProps: { v: 1 },
      incomingPropSources: { v: { kind: "state", key: "count" } },
    },
    parent: { stateProps: { count: 0 } },
  });
  props("child").v = 99;
  const store = global.window.olum.app.store;
  return store.parent.stateProps.count === 99;
});

check("writing a props-sourced prop chains up the parent's props proxy", () => {
  // grandchild → child forwarding: a `props` source writes into the parent's
  // incomingPropsProxy (which itself recurses further up until a state owner).
  const { props } = withStore({
    grandchild: {
      parentCompName: "child",
      incomingProps: { v: 1 },
      incomingPropSources: { v: { kind: "props", key: "w" } },
    },
    child: { incomingPropsProxy: {} },
  });
  props("grandchild").v = 77;
  return global.window.olum.app.store.child.incomingPropsProxy.w === 77;
});

// ── §11 directOlums() ─────────────────────────────────────────────────────────
section("§11 directOlums()");

check("returns only top-level <olum> placeholders (skips nested)", () => {
  const { olum, document } = load();
  const container = document.createElement("div");
  container.innerHTML = `<olum name="A"><olum name="B"></olum></olum><olum name="C"></olum>`;
  const names = olum.directOlums(container).map((p) => p.getAttribute("name"));
  return names.length === 2 && names.includes("A") && names.includes("C") && !names.includes("B");
});

// ── §12 buildTree() ───────────────────────────────────────────────────────────
section("§12 buildTree()");

// Minimal component factory shape buildTree consumes.
function makeComp(html, components) {
  const el = global.document.createElement("div");
  el.innerHTML = html;
  return { __OLUM__: { compName: "App", getElm: el, components: components || {} }, methodsRef: {}, hooks: {} };
}

check("a childless component returns its root element unchanged", () => {
  const { window } = load();
  const comp = makeComp(`<span>hi</span>`);
  window.olum.app.store = { App: comp };
  window.olum.app.registry = {};
  const tree = window.olum.buildTree(comp, window.olum.app.store, "App");
  return tree && tree.querySelector("span").textContent === "hi";
});

check("an <olum> placeholder is replaced by the child's element", () => {
  const { window, document } = load();
  const childElm = document.createElement("p");
  childElm.textContent = "child";
  const childFactory = (instanceKey) => ({ __OLUM__: { compName: "Child", getElm: childElm, components: {} }, methodsRef: {}, hooks: {} });
  const comp = makeComp(`<olum name="Child"></olum>`, { Child: childFactory });
  window.olum.app.store = { App: comp };
  window.olum.app.registry = {};
  const tree = window.olum.buildTree(comp, window.olum.app.store, "App");
  // placeholder gone, child <p> present
  return !tree.querySelector("olum") && tree.querySelector("p") && tree.querySelector("p").textContent === "child";
});

check("a missing child factory warns and leaves the placeholder", () => {
  const { window } = load();
  const comp = makeComp(`<olum name="Ghost"></olum>`);
  window.olum.app.store = { App: comp };
  window.olum.app.registry = {};
  let warned = false;
  const origWarn = console.warn;
  console.warn = () => (warned = true);
  try {
    window.olum.buildTree(comp, window.olum.app.store, "App");
  } finally {
    console.warn = origWarn;
  }
  return warned && comp.__OLUM__.getElm.querySelector("olum");
});

// ── §13 eventsHandler() ───────────────────────────────────────────────────────
// data-o-event carries the RESOLVED serialization the compiled template produces
// after its `${JSON.stringify(...)}` runs, e.g.  onclick|inc=[]  /  oninput|setVal=["$event"].
section("§13 eventsHandler()");

// Build a node carrying a resolved data-o-event string and wire it up.
function wireEvent(tag, attr, methods, mode) {
  const { olum, window, document } = load();
  const el = document.createElement(tag);
  el.setAttribute("data-o-event", attr);
  if (mode) el.setAttribute("data-o-event-mode", mode);
  olum.eventsHandler(el, [el], "App", methods);
  return { el, window };
}

check("substitutes $event with the real event object", () => {
  let received;
  const { el, window } = wireEvent("input", 'oninput|setVal=["$event"]', { setVal: (e) => (received = e) });
  el.dispatchEvent(new window.Event("input"));
  return received && received.type === "input";
});

// a <for>-scoped handler serializes the loop variable's per-item VALUE into the args
// (compiler emits JSON.stringify(['$event', flavour])) — the runtime must pass it
// back alongside the substituted event object
check("extra serialized args (loop variables) are passed after $event", () => {
  let received;
  const { el, window } = wireEvent("input", 'onchange|toggle=["$event","Mint choc chip"]', {
    toggle: (e, flavour) => (received = { type: e.type, flavour }),
  });
  el.dispatchEvent(new window.Event("change"));
  return received && received.type === "change" && received.flavour === "Mint choc chip";
});

check("a no-arg handler still receives the event", () => {
  let received;
  const { el, window } = wireEvent("button", "onclick|inc=[]", { inc: (e) => (received = e) });
  el.dispatchEvent(new window.Event("click"));
  return received && received.type === "click";
});

check("multiple handlers in one attribute all fire", () => {
  const calls = [];
  const { el, window } = wireEvent("button", 'onclick|a=[]&b=["$event"]', {
    a: () => calls.push("a"),
    b: (e) => calls.push("b:" + e.type),
  });
  el.dispatchEvent(new window.Event("click"));
  return calls.join(",") === "a,b:click";
});

check("the `once` modifier fires the handler a single time", () => {
  let n = 0;
  const { el, window } = wireEvent("button", "onclick|inc=[]", { inc: () => n++ }, "once");
  el.dispatchEvent(new window.Event("click"));
  el.dispatchEvent(new window.Event("click"));
  return n === 1;
});

check("the `prevent` modifier calls preventDefault", () => {
  const { el, window } = wireEvent("button", "onclick|inc=[]", { inc: () => {} }, "prevent");
  const evt = new window.Event("click", { cancelable: true });
  el.dispatchEvent(evt);
  return evt.defaultPrevented === true;
});

check("the data-o-event attribute is stripped after wiring", () => {
  const { el } = wireEvent("button", "onclick|inc=[]", { inc: () => {} });
  return el.getAttribute("data-o-event") === null;
});

check("an unknown method warns instead of throwing", () => {
  const { el, window } = wireEvent("button", "onclick|missing=[]", {});
  let warned = false;
  const orig = console.warn;
  console.warn = () => (warned = true);
  try {
    el.dispatchEvent(new window.Event("click"));
  } finally {
    console.warn = orig;
  }
  return warned;
});

// ── §14 stylesHandler() ───────────────────────────────────────────────────────
section("§14 stylesHandler()");

check("applies a data-o-style JSON object as inline styles", () => {
  const { olum, document } = load();
  const el = document.createElement("div");
  el.setAttribute("data-o-style", JSON.stringify({ color: "red", padding: "8px" }));
  olum.stylesHandler(el, [el], "App");
  const style = el.getAttribute("style") || "";
  return /color:\s*red/.test(style) && /padding:\s*8px/.test(style) && el.getAttribute("data-o-style") === null;
});

check("a falsy style value is skipped", () => {
  const { olum, document } = load();
  const el = document.createElement("div");
  el.setAttribute("data-o-style", JSON.stringify({ color: "", margin: "1px" }));
  olum.stylesHandler(el, [el], "App");
  const style = el.getAttribute("style") || "";
  return !/color/.test(style) && /margin:\s*1px/.test(style);
});

// ── §15 handleMarkup() ────────────────────────────────────────────────────────
section("§15 handleMarkup()");

check("stamps data-child-of and the scope id on the element and descendants", () => {
  const { olum, document } = load();
  const el = document.createElement("div");
  el.innerHTML = `<span></span>`;
  olum.handleMarkup("App", "abc123", el, {});
  const span = el.querySelector("span");
  return (
    el.getAttribute("data-child-of") === "App" &&
    el.getAttribute("data-o-abc123") === "" &&
    span.getAttribute("data-child-of") === "App" &&
    span.getAttribute("data-o-abc123") === ""
  );
});

check("handleMarkup also wires events on descendants", () => {
  const { olum, window, document } = load();
  const el = document.createElement("div");
  const btn = document.createElement("button");
  btn.setAttribute("data-o-event", "onclick|inc=[]");
  el.appendChild(btn);
  let fired = false;
  olum.handleMarkup("App", "abc123", el, { inc: () => (fired = true) });
  btn.dispatchEvent(new window.Event("click"));
  return fired && btn.getAttribute("data-o-event") === null;
});

// ── §16 named exports ─────────────────────────────────────────────────────────
section("§16 named exports");

check("onMount(cb) returns the callback as-is", () => {
  const { onMount } = load();
  const cb = () => 42;
  return onMount(cb) === cb;
});

check("props export delegates to window.olum.props", () => {
  const { props, window } = load();
  window.olum.app.store = { c: { incomingProps: { k: 1 } } };
  return props("c").k === 1;
});

// ── Summary (mirrors compiler.test.js) ────────────────────────────────────────
console.log("\n========================");
const summary = `${passed} passed, ${failed} failed`;
console.log((failed ? red(bold(summary)) : green(bold(summary))) + "\n");

if (failed) {
  const bySection = {};
  failedSections.forEach(({ section, name }) => {
    (bySection[section] = bySection[section] || []).push(name);
  });
  console.log(bold("Failed in:"));
  Object.keys(bySection).forEach((sec) => {
    console.log("  " + red(sec));
    bySection[sec].forEach((name) => console.log("    " + dim("• " + name)));
  });
  console.log("");
}

// Guard against a whole section silently disappearing. Bump when you add/remove tests.
const EXPECTED_CHECKS = 52;
const total = passed + failed;
if (total !== EXPECTED_CHECKS) {
  console.log(yellow(`⚠ ran ${total} checks but expected ${EXPECTED_CHECKS} — did a test get dropped?`) + "\n");
  process.exit(1);
}

process.exit(failed ? 1 : 0);
