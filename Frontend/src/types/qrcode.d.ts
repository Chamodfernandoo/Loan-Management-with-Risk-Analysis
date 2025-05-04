declare module 'qrcode' {
  function toDataURL(text: string, options?: any): Promise<string>;
  function toCanvas(canvasElement: HTMLCanvasElement, text: string, options?: any): Promise<void>;
  function toString(text: string, options?: any): Promise<string>;
  
  export { toDataURL, toCanvas, toString };
}