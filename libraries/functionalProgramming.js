export const compose  = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
export const pipe  = (...fns) => fns.reduce((f, g) => (...args) => g(f(...args)));
