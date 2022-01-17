var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class DefaultCodeEditorConfig {
  constructor() {
    __publicField(this, "language", "javascript");
    __publicField(this, "code");
    __publicField(this, "theme", "vs-light");
    __publicField(this, "readOnly", false);
  }
  buildConf() {
    return {
      value: this.code,
      language: this.language,
      theme: this.theme,
      automaticLayout: true,
      readOnly: this.readOnly
    };
  }
  isDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
}
export { DefaultCodeEditorConfig };
