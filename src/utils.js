export const REACT_ELEMENT = Symbol('react.element');
export const REACT_FORWARD_REF = Symbol('react.forward.ref')
export const REACT_TEXT = Symbol('react.text')///
export const MOVE = Symbol('dom.diff.move')//
export const CREATE = Symbol('dom.diff.create')//
export const REACT_MEMO = Symbol('react.memo')
export const toVNode = (node) => {//
    return typeof node === 'string' || typeof node === 'number' ? {//
        type: REACT_TEXT, props: {text: node}//
    } : node//
}//



function getType(obj) {
    var toString = Object.prototype.toString;
    var map = {
      '[object Boolean]' : 'boolean', 
      '[object Number]'  : 'number', 
      '[object String]'  : 'string', 
      '[object Function]' : 'function', 
      '[object Array]'  : 'array', 
      '[object Date]'   : 'date', 
      '[object RegExp]'  : 'regExp', 
      '[object Undefined]': 'undefined',
      '[object Null]'   : 'null', 
      '[object Object]'  : 'object'
    };
    return map[toString.call(obj)];
  }

export const shallowEqual = (obj1, obj2) => {
    if(obj1 === obj2){
        // 如果引用相同，返回true
        return true
    }
    if(getType(obj1) !== 'object' || getType(obj2) !== 'object'){
        // state props可能是空
        return false
    }
    // 如果两个都不是对象，返回fasle
    let keys1 = Object.keys(obj1)
    let keys2 = Object.keys(obj2)
    if(keys1.length !== keys2.length){
        return false
    }
    // 既然是浅比较，首先要key都相同，其次直接比较key对应的value值
    for (const key of keys1) {
        if( !obj2.hasOwnProperty(key) || obj1[key] !== obj2[key] ){
            return false
        }
    }

    return true

}