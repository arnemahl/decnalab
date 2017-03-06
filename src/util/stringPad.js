export const getPadding = (string, minLength, char = ' ') => Array(Math.max(0, minLength - String(string).length)).fill(char).join('');

export const leftPad = (string, minLength, char) => getPadding(string, minLength, char) + string;

export const rightPad = (string, minLength, char) => string + getPadding(string, minLength, char);
