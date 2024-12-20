
import {emitUpdateForHooks} from './ReactDom'

export function resetHookIndex(){
    hookIndex = 0
  }

let states = []
let hookIndex = 0
export function useState(initialvalue){
    states[hookIndex] = states[hookIndex] || initialvalue;
    const currentIndex = hookIndex
    function setState(newState){
        states[currentIndex] = newState
        emitUpdateForHooks()
    }
    return [states[hookIndex++], setState]
}


export function useReducer(reducer, initialvalue){
    states[hookIndex] = states[hookIndex] || initialvalue;
    const currentIndex = hookIndex
    function dispatch(action){
        states[currentIndex] = reducer(states[currentIndex], action)
        emitUpdateForHooks()
    }
    return [states[hookIndex++], dispatch]
}


export function useEffect(effectFunction, deps = []) {
    const currentIndex = hookIndex;
    const [destroyFunction, preDeps] = states[hookIndex] || [null, null];
    if(!states[hookIndex] || deps.some((item, index) => item !== preDeps[index])){
        destroyFunction && destroyFunction();
        states[currentIndex] = [effectFunction(), deps];
    };
    hookIndex++;
  }

  export function useRef(initialValue) {
    states[hookIndex] = states[hookIndex] || { current: initialValue }
    return states[hookIndex++]
  }

  export function useMemo(dataFactory, deps){
    const [preData, preDep] = states[hookIndex] || [null, null]
    if(!states[hookIndex] || deps.some((item, index) => item != preDep[index])){
        // 如果不存在，第一次肯定不存在
        const newdata = dataFactory();
        // 建立依赖项与返回值关系
        states[hookIndex++] = [newdata, deps]
        return newdata
    }
    hookIndex++
    return preData
  }

  export function useCallback(callback, deps){
    // 存函数与依赖项关系
    const [precallback, predep] = states[hookIndex] || [null, null]
    if(!states[hookIndex] || predep.some((item, index) => item != deps[index])){
        states[hookIndex++] = [callback, deps]
        return callback
    }
    // 如果依赖没有发生变化
    hookIndex++
    return precallback
  }