export const REACT_ELEMENT = Symbol('react.element');
export const REACT_FORWARD_REF = Symbol('react.element')
export const REACT_TEXT = Symbol('react.text')
export const MOVE = Symbol('dom.diff.move')
export const CREATE = Symbol('dom.diff.create')
export const toVNode = (node) => {
    return typeof node === 'string' || typeof node === 'number' ? {
        type: REACT_TEXT, props: node
    } : node
}