declare const global: typeof globalThis;
const universal = typeof globalThis !== "undefined" ? globalThis : global;
const performance = universal.performance;

export { performance };
