import {startUpdateHooks } from './react-dom'
let hookStates = []; //存放状态的数组
export let hookIndex = 0

export function useReducer(reducer, initialState) {
  hookStates[hookIndex] = hookStates[hookIndex] || (typeof initialState === 'function' ? initialState() : initialState);
  const currentIndex = hookIndex;
  function dispatch(action) {
    //获取老状态
    let oldState = hookStates[currentIndex];
    if (typeof reducer === 'function') {
      let newState = reducer(oldState, action);
      hookStates[currentIndex] = newState;
    } else {
      let newState = typeof action === 'function' ? action(oldState) : action;
      hookStates[currentIndex] = newState;
    }
    startUpdateHooks();
  }
  return [hookStates[hookIndex++], dispatch];
}
/**
 * 在函数组件中使用状态
 * @param {*} initialState 初始状态 
 * @returns 
 */
export function useState(initialState) {
  console.log(hookIndex, initialState, '....')
  // return useReducer(null, initialState);
  hookStates[hookIndex] = hookStates[hookIndex] || initialState;
  const currentIndex = hookIndex;//在函数内部声明一个变量，缓存当前的索引
  function setState(newState) {
    hookStates[currentIndex] = newState;
    startUpdateHooks();
  }
  let returnVal = hookStates[hookIndex]
  hookIndex = hookIndex + 1
  return [returnVal, setState];
}
export function useEffect(callback, deps) {
  const currentIndex = hookIndex;
  if (hookStates[hookIndex]) {
    const [destroy, lastDeps] = hookStates[hookIndex];
    let same = deps && deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hookIndex++;
    } else {
      setTimeout(() => {
        destroy && destroy();
        hookStates[currentIndex] = [callback(), deps];
      });
      hookIndex++;
    }
  } else {
    setTimeout(() => {
      const destroy = callback();
      hookStates[currentIndex] = [destroy, deps];
    });
    hookIndex++;
  }
}
export function useLayoutEffect(callback, deps) {
  const currentIndex = hookIndex;
  if (hookStates[hookIndex]) {
    const [destroy, lastDeps] = hookStates[hookIndex];
    let same = deps && deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hookIndex++;
    } else {
      queueMicrotask(() => {
        destroy && destroy();
        hookStates[currentIndex] = [callback(), deps];
      });
      hookIndex++;
    }
  } else {
    queueMicrotask(() => {
      const destroy = callback();
      hookStates[currentIndex] = [destroy, deps];
    });
    hookIndex++;
  }
}
export function useRef(initialValue) {
  hookStates[hookIndex] = hookStates[hookIndex] || { current: initialValue }
  return hookStates[hookIndex++]
}
export function useImperativeHandle(ref, factory) {
  ref.current = factory();
}
export function useMemo(factory, deps) {
  // 后面再渲染的时候
  if (hookStates[hookIndex]) {
    let [lastMemo, lastDeps] = hookStates[hookIndex];
    let same = deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hookIndex++;
      return lastMemo;
    } else {
      let newMemo = factory();
      hookStates[hookIndex++] = [newMemo, deps];
      return newMemo;
    }
  } else { //第一次渲染的时候
    let newMemo = factory();
    hookStates[hookIndex++] = [newMemo, deps];
    return newMemo;
  }
}
export function useCallback(callback, deps) {
  // 后面再渲染的时候
  if (hookStates[hookIndex]) {
    let [lastCallback, lastDeps] = hookStates[hookIndex];
    let same = deps.every((item, index) => item === lastDeps[index]);
    if (same) {
      hookIndex++;
      return lastCallback;
    } else {
      hookStates[hookIndex++] = [callback, deps];
      return callback;
    }
  } else { //第一次渲染的时候
    hookStates[hookIndex++] = [callback, deps];
    return callback;
  }
}