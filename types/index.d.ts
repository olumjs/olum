// Type definitions for olum

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** Teardown returned from an `onMount` callback; runs when the component unmounts. */
export type Teardown = () => void;

/** An async callback can't return a teardown: the runtime only runs a returned function. */
export type MountCallback = () => void | Teardown | Promise<void>;

export interface ComponentHooks {
  mounted: MountCallback | null;
  unMounted: Teardown | null;
  isMounted: boolean;
  isUnMounted: boolean;
}

/** The instance a compiled component returns. Produced by the compiler, not written by hand. */
export interface OlumComponent {
  __OLUM__: Record<string, any>;
  el: HTMLElement;
  hooks: ComponentHooks;
  methods?: Record<string, (...args: any[]) => any>;
  props?: Record<string, any>;
  stateProps?: Record<string, any> | null;
  [key: string]: any;
}

/** The default export of a compiled component file. */
export type ComponentFactory = (instanceKey?: string) => OlumComponent;

/** The parts of an `olum-router` instance that `Olum#use` relies on. */
export interface RouterLike {
  name(): string;
  pathname(): string;
  push(path: string): void;
  replace(path: string): void;
  back(): void;
  forward(): void;
  go(n: number): void;
  extractParams(path: string, pathname: string): RouteParams;
  searchParams(): SearchParams;
  setSearchParam(key: string, value?: SearchParamInput): void;
  listen(): void;
  [key: string]: any;
}

export default class Olum {
  /** The runtime object; compiled components read it from here. */
  static __olum: OlumRuntime;

  root: Element | null;

  /** Selects the mount point, by selector or element, and empties it. */
  $(target: string | Element): this;

  /** Mounts a component, or starts an `olum-router` instance. */
  use(comp: ComponentFactory | RouterLike): void;

  /** Runs every cleanup, restores `<head>` and empties the root. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Transitions
// ---------------------------------------------------------------------------

export type EasingFunction = (t: number) => number;

export type EasingName =
  | "linear"
  | "backIn"
  | "backOut"
  | "backInOut"
  | "bounceIn"
  | "bounceOut"
  | "bounceInOut"
  | "circIn"
  | "circOut"
  | "circInOut"
  | "cubicIn"
  | "cubicOut"
  | "cubicInOut"
  | "elasticIn"
  | "elasticOut"
  | "elasticInOut"
  | "expoIn"
  | "expoOut"
  | "expoInOut"
  | "quadIn"
  | "quadOut"
  | "quadInOut"
  | "quartIn"
  | "quartOut"
  | "quartInOut"
  | "quintIn"
  | "quintOut"
  | "quintInOut"
  | "sineIn"
  | "sineOut"
  | "sineInOut";

export type Easing = EasingName | EasingFunction;

export type Easings = Record<EasingName, EasingFunction>;

export interface TransitionParams {
  delay?: number;
  duration?: number;
  easing?: Easing;
}

export interface FlyParams extends TransitionParams {
  x?: number;
  y?: number;
  opacity?: number;
}

export interface ScaleParams extends TransitionParams {
  start?: number;
  opacity?: number;
}

export interface DrawParams extends TransitionParams {
  speed?: number;
}

/** What a transition function returns. `t` runs 0 to 1 and `u` is `1 - t`. */
export interface TransitionConfig {
  delay?: number;
  duration?: number;
  easing?: Easing;
  css?: (t: number, u: number) => string;
  tick?: (t: number, u: number) => void;
}

export type TransitionFunction<P = TransitionParams> = (
  node: Element,
  params?: P,
) => TransitionConfig;

export interface Transitions {
  fade: TransitionFunction;
  fly: TransitionFunction<FlyParams>;
  scale: TransitionFunction<ScaleParams>;
  slide: TransitionFunction;
  draw: TransitionFunction<DrawParams>;
}

export interface CrossfadeParams extends TransitionParams {
  key: unknown;
}

export type CrossfadeFallback = (
  node: Element,
  params?: CrossfadeParams,
  intro?: boolean,
) => TransitionConfig | null | undefined;

export interface CrossfadeOptions {
  delay?: number;
  /** Milliseconds, or a function of the distance travelled in pixels. */
  duration?: number | ((distance: number) => number);
  easing?: Easing;
  /** Plays when an element has no partner with the same key. */
  fallback?: CrossfadeFallback;
}

/** Called by the transition system; the returned function builds the config. */
export type CrossfadeTransition = (
  node: Element,
  params?: CrossfadeParams,
) => () => TransitionConfig | null | undefined;

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

/** Catch-all segments (`[...slug]`) arrive as arrays. */
export type RouteParams = Record<string, string | string[]>;

export type SearchParamValue = string | number;

/** Exact numbers become numbers, and a repeated key becomes an array. */
export type SearchParams = Record<
  string,
  SearchParamValue | SearchParamValue[]
>;

/** `null`, `undefined`, `""` and `[]` remove the param. */
export type SearchParamInput =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

export interface OlumHtml {
  __olumHtml: true;
  html: string;
}

export interface OlumRuntime {
  version: string;
  framework: string;
  /** Mounted component instances and the component registry. */
  app: {
    store?: Record<string, OlumComponent>;
    registry?: Record<string, ComponentFactory>;
    [key: string]: any;
  };
  transitions: Transitions;
  easings: Easings;
  flushUpdates(): void;
  $emit(event: string, data?: unknown): void;
  dispatchEvent(event: string, data?: unknown): void;
  mkHash(str: string): number;
  mkElm(type: string, compName?: string, compId?: string): HTMLElement;
  injectStyle(compName: string, cssContent: string): void;
  /** Escapes a value for HTML output. `OlumHtml` values pass through unescaped. */
  esc(value: unknown): string;
  /** Marks a value as raw HTML, opting it out of escaping. */
  html(value: unknown): OlumHtml;
  crossfade(opts?: CrossfadeOptions): [CrossfadeTransition, CrossfadeTransition];
}

export const __olum: OlumRuntime;

// ---------------------------------------------------------------------------
// Lifecycle and updates
// ---------------------------------------------------------------------------

export function onMount<T extends MountCallback>(cb: T): T;

/** Applies pending updates to the DOM now instead of on the next microtask. */
export function flushUpdates(): void;

// ---------------------------------------------------------------------------
// Transition helpers (need the `olum-transition` package)
// ---------------------------------------------------------------------------

/**
 * Returns a `[send, receive]` pair.
 * @throws if `olum-transition` is not installed.
 */
export function crossfade(
  opts?: CrossfadeOptions,
): [CrossfadeTransition, CrossfadeTransition];

/** Empty at runtime unless `olum-transition` is installed. */
export const easings: Easings;

/** Empty at runtime unless `olum-transition` is installed. */
export const transitions: Transitions;

// ---------------------------------------------------------------------------
// Router helpers (throw until an `olum-router` instance is passed to `use()`)
// ---------------------------------------------------------------------------

export function push(path: string): void;
export function replace(path: string): void;
export function back(): void;
export function forward(): void;
export function go(n: number): void;

/**
 * Reads the route params. Call it with no arguments in a component: the
 * compiler fills in `path` and `pathname`.
 */
export function params<T extends RouteParams = RouteParams>(
  path?: string,
  pathname?: string,
): T;

export function pathname(): string;

/** Reads the current query string as an object. Not reactive. */
export function searchParams<T extends SearchParams = SearchParams>(): T;

/** Sets or removes one query param without rendering or adding a history entry. */
export function setSearchParam(key: string, value?: SearchParamInput): void;

// ---------------------------------------------------------------------------
// Component data
// ---------------------------------------------------------------------------

/**
 * Reads this instance's props. Call it with no arguments in a component: the
 * compiler fills in `storeKey`.
 */
export function props<T extends object = Record<string, any>>(
  storeKey?: string,
): Readonly<T> & { readonly children?: any };

/**
 * Creates a reactive store.
 * @throws if `olum-store` is not installed.
 */
export function store<T extends object = Record<string, any>>(init?: T): T;

export interface ComponentScope {
  key: string;
  el: HTMLElement | null;
  state: Record<string, any> | null;
  props: Record<string, any> | null;
  methods: Record<string, (...args: any[]) => any> | null;
}

/**
 * Reaches a mounted component by name. Pass `index` to pick one of several
 * instances. Returns `null`, and logs a warning, when nothing matches.
 */
export function scope(name: string, index?: number): ComponentScope | null;

// ---------------------------------------------------------------------------
// Globals
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    /** Production builds expose only `version` and `framework`. */
    olum: Pick<OlumRuntime, "version" | "framework"> & Partial<OlumRuntime>;
  }
}
