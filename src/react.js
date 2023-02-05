import { REACT_ELEMENT, REACT_FORWARD_REF } from './utils'
import { Component } from './Component'
function createElement(type, properties = {}, children) {
    let ref = properties.ref || null; // 后面会讲到，这里只需要知道是跟操作DOM相关
    let key = properties.key || null; // 后面会讲到，这里只需要知道这个跟DOM DIFF相关
    // 观察一下我们编写的createElement函数的返回值会发现有多余的__sorce,__self
    ;['ref', 'key', '__self', '__source'].forEach(key => { // 可能还会有别的属性也不需要，在发现的时候我们再添加需要删除的属性
        delete properties[key] // props中有些属性并不需要
    })
    let props = {...properties}

    if (arguments.length > 3) {
        // 多个子元素, 转化成数组
        props.children = Array.prototype.slice.call(arguments, 2);
      } else {
        // 单个子元素，转化为数组
        props.children = children;
      }


    return {
        $$typeof: REACT_ELEMENT, // 代表着这是React元素，也就是React框架中的虚拟DOM
        type, // 虚拟DOM的元素类型
        ref,
        key,
        props
    }
  }
  function createRef() {
    return { current: null };
  }
  function forwardRef(render) {
    return {
      $$typeof: REACT_FORWARD_REF,
      render
    }
  }
  const React = {
    createElement,
    Component,
    createRef,
    forwardRef
  }
  export default React;