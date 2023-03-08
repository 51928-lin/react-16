import {emitUpdateForHooks } from './react-dom'
let states = [];
let hookIndex = 0

export function resetHookIndex(){
  hookIndex = 0
}

export function useState(initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentIndex = hookIndex;
  function setState(newState) {
    states[currentIndex] = newState;
    emitUpdateForHooks();
  }
  return [states[hookIndex++], setState];
}

export function useReducer(reducer, initialValue) {
  states[hookIndex] = states[hookIndex] || initialValue;
  const currentIndex = hookIndex;
  function dispatch(action) {
    states[currentIndex] = reducer(states[currentIndex], action);;
    emitUpdateForHooks();
  }
  return [states[hookIndex++], dispatch];
}

export function useEffect(effectFunction, deps = []) {
  const currentIndex = hookIndex;
  const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
  if(!states[hookIndex] || deps.some((item, index) => item !== preDeps[index])){
    setTimeout(() => {
      destroyFunction && destroyFunction();
      states[currentIndex] = [effectFunction(), deps];
    })
  };
  hookIndex++;
}

export function useLayoutEffect(effectFunction, deps = []) {
  const currentIndex = hookIndex;
  const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
  if(!states[hookIndex] || deps.some((item, index) => item !== preDeps[index])){
    queueMicrotask(() => {
      destroyFunction && destroyFunction();
      states[currentIndex] = [effectFunction(), deps];
    })
  };
  hookIndex++;
}

export function useRef(initialValue) {
  states[hookIndex] = states[hookIndex] || { current: initialValue }
  return states[hookIndex++]
}

export function useImperativeHandle(ref, dataFactory) {
  ref.current = dataFactory();
}

export function useMemo(dataFactory, deps = []) {
  let [preData, preDeps] = states[hookIndex] || [null, null];
  if(!states[hookIndex] || deps.some((item, index) => item !== preDeps[index])){
    let newData = dataFactory()
    states[hookIndex++] = [newData, deps]
    return newData
  }
  hookIndex ++
  return preData
}

export function useCallback(callback, deps) {
  let [preCallback, preDeps] = states[hookIndex] || [null, null];
  if(!states[hookIndex] || deps.some((item, index) => item !== preDeps[index])){
    states[hookIndex++] = [callback, deps]
    return callback
  }
  hookIndex ++
  return preCallback
}
