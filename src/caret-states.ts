import { CaretStyle } from "./style";

let caretIndex = 0;
export function getCaretIndex() {
  return caretIndex;
}
export function setCaretIndex(v: number) {
  caretIndex = v;
}
export function addCaretIndex(v: number) {
  caretIndex += v;
}

let caretPositions: CaretStyle[] = [];
export function initCaretPositions() {
  caretPositions = [];
}
export function getCaretPositions() {
  return caretPositions;
}
export function addCaret(v: CaretStyle) {
  caretPositions.push(v);
}
export function getCurrentCaret() {
  return caretPositions[caretIndex];
}
