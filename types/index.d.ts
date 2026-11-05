declare namespace Olum {
  interface OlumApp {
    [key: string]: any;
  }

  interface OlumInstance {
    version: string;
    framework: string;
    app: OlumApp;
    flushUpdates(): void;
    $emit(event: string, data?: any): void;
    dispatchEvent(event: string, data?: any): void;
    mkHash(str: string): number;
    mkElm(type: string, compName: string, compId?: string): HTMLElement;
    [key: string]: any;
  }
}

declare const olum: Olum.OlumInstance;
export default olum;
export = olum;
