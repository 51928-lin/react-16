import { REACT_ELEMENT, REACT_FORWARD_REF,toVNode,shallowEqual,REACT_MEMO} from './utils'
import { Component } from './Component';
export * from './hooks'
// babel会先解析jsx语法，但是babel不会执行，只是转译
// 每次将执行的结果也就是对象，传递到上一个函数体内，那么在上一个函数中通过指针拿到下个节点的对象数据
function createElement(type, properties = {}, children) {  
   // 1  对于div来说，他的children其实是一个对象
   // 2 <div>asdf<p>asdf</p></div> 对于div来说，他的children是数组

    let ref = properties.ref || null; // 后面会讲到，这里只需要知道是跟操作DOM相关
    let key = properties.key || null; // 后面会讲到，这里只需要知道这个跟DOM DIFF相关
    // 观察一下我们编写的createElement函数的返回值会发现有多余的__sorce,__self
    ;['ref', 'key', '__self', '__source'].forEach(key => { // 可能还会有别的属性也不需要，在发现的时候我们再添加需要删除的属性
        delete properties[key] 
    })
    let props = {...properties}

    // 通过children属性去挂载父子关系
    if (arguments.length > 3) {
        // 多个子元素, 转化成数组
        props.children = Array.prototype.slice.call(arguments, 2).map(toVNode);
      } else {
        // 单个子元素，转化为数组
        props.children = toVNode(children);
      }


    let result = {
        $$typeof: REACT_ELEMENT, 
        type,
        ref,
        key,
        props
    }

    return result
  }

function createRef(){
  return {
    current: null
  }
}

function forwardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render
  }
}


class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
  }
}

function memo(type, compare = shallowEqual){
  return {
    $$typeof: REACT_MEMO,
    type: type,
    compare,
  }
}

  const React = {
    createElement,
    Component,
    PureComponent,
    memo,
    createRef,
    forwardRef
  }
  export default React;