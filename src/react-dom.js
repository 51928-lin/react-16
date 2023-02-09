import { REACT_ELEMENT, REACT_FORWARD_REF } from './utils'
import { addEvent } from './event'
function render(VNode, containerDOM) {
    mount(VNode, containerDOM)
}
function mount(VNode, containerDOM) {
    let newDOM = createDOM(VNode)
    newDOM && containerDOM.appendChild(newDOM);
}
export function createDOM(VNode) {
    if (!VNode) return
    const { type, props, ref } = VNode
    let dom;
    if (typeof type === 'function' && type.IS_CLASS_COMPONENT && VNode.$$typeof === REACT_ELEMENT) {
        return getDomByClassComponent(VNode)
    } else if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
        return getDomByFunctionComponent(VNode)
    } if (type && type.$$typeof === REACT_FORWARD_REF) {
        return getDomByRefForwardFunction(VNode);
    } else if (type && VNode.$$typeof === REACT_ELEMENT) {
        dom = document.createElement(type);
    }
    if (props) {
        if (typeof props.children === 'object' && props.children.type) {
            mount(props.children, dom)
        } else if (Array.isArray(props.children)) {
            mountArray(props.children, dom);
        } else if (typeof props.children === 'string') {
            dom.appendChild(document.createTextNode(props.children));
        }
    }
    setPropsForDOM(dom, props)
    VNode.dom = dom
    ref && (ref.current = dom)
    return dom
}
function mountArray(children, parent) {
    if (!Array.isArray(children)) return
    for (let i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') {
            parent.appendChild(document.createTextNode(children[i]))
        } else {
            mount(children[i], parent)
        }
    }
}

function setPropsForDOM(dom, VNodeProps = {}) {
    if (!dom) return
    for (let key in VNodeProps) {
        if (key === 'children') continue;
        if (/^on[A-Z].*/.test(key)) { // 大家需要注意这个正则表达式为什么这么写 
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes
            // ^ :开头
            // . :含义1: Matches any single character except line terminators: \n, \r, \u2028分隔符 or \u2029段落分隔符. For example, /.y/ matches "my" and "ay", but not "yes", in "yes make my day", as there is no character before "y" in "yes".
            // . :含义2: Inside a character class, the dot loses its special meaning and matches a literal dot.
            // * : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers Matches the preceding item "x" 0 or more times.
            addEvent(dom, key.toLowerCase(), VNodeProps[key])
        } else if (key === 'style') {
            Object.keys(VNodeProps[key]).forEach(styleName => {
                dom.style[styleName] = (VNodeProps[key])[styleName];
            })
        } else {
            // 如果用函数setAttribute(key, VNodeProps[key])，则需要对key值进行转化
            // dom上的属性名称和jsx的属性名称基本一致，但和我们编写html时候的属性名称是有差异的，需要注意
            // 在官方文档上有关于属性名称的说明：https://reactjs.org/docs/introducing-jsx.html
            // Since JSX is closer to JavaScript than to HTML, React DOM uses camelCase property naming convention instead of HTML attribute names.
            // For example, class becomes className in JSX, and tabindex becomes tabIndex.
            dom[key] = VNodeProps[key]
        }
    }
}

function getDomByFunctionComponent(vNode) {
    let { type, props } = vNode;
    let renderVNode = type(props);
    if (!renderVNode) return null;
    return createDOM(renderVNode);
}
function getDomByClassComponent(vNode) {
    let { type, props, ref } = vNode;
    let instance = new type(props)
    ref && (ref.current = instance);
    let renderVNode = instance.render();
    instance.oldVNode = renderVNode
    if (!renderVNode) return null;
    return createDOM(renderVNode);
}
function getDomByRefForwardFunction(vNode) {
    let { type, props, ref } = vNode;
    let renderVdom = type.render(props, ref);
    if (!renderVdom) return null;
    return createDOM(renderVdom);
}
function updateProps(currentDOM, oldVNodeProps, newVNodeProps){

}
function updateChildren(currentDOM, oldVNodeChildren, newVNodeChildren){

}
function updateClassComponent(oldVNode, newVNode){

}
function updateFunctionComponent(oldVNode, newVNode){
    
}
function deepDOMDiff(oldVNode, newVNode) {
    let diffTypeMap = {
        ORIGIN_NODE: typeof oldVNode.type === 'string', // 原生节点
        CLASS_COMPONENT: typeof oldVNode.type === 'function' && oldVNode.type.isReactComponent,
        FUNCTION_COMPONENT: typeof oldVNode.type === 'function'
    }
    let DIFF_TYPE = Object.keys(diffTypeMap).filter(key => diffTypeMap[key])[0]
    switch(DIFF_TYPE){
        case 'ORIGIN_NODE':
            let currentDOM = newVNode.dom = findDomByVNode(oldVNode);
            updateProps(currentDOM, oldVNode.props, newVNode.props);
            updateChildren(currentDOM, oldVNode.props.children, newVNode.props.children);
            break;
        case 'CLASS_COMPONENT':
            updateClassComponent(oldVNode, newVNode);
            break;
        case 'FUNCTION_COMPONENT':
            updateFunctionComponent(oldVNode, newVNode);
            break;
        default:
            break;
    }
}
function removeVNode(vNode) {
    const currentDOM = findDomByVNode(vNode);
    if (currentDOM) currentDOM.remove();
}
// 开始dom-diff
export function updateDomTree(oldVNode, newVNode, oldDOM) {
    const typeMap = {
        NO_OPERATE: !oldVNode && !newVNode,
        ADD: !oldVNode && newVNode,
        DELETE: oldVNode && newVNode,
        REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type // 类型不同
    }
    let UPDATE_TYPE = Object.keys(typeMap).filter(key => typeMap[key])[0]

    switch(UPDATE_TYPE){
        case 'NO_OPERATE':
            break
        case 'DELETE':
            removeVNode(oldVNode);
            break
        case 'ADD':
            oldDOM.parentNode.appendChild(createDOM(newVNode));
            break
        case 'REPLACE':
            removeVNode(oldVNode);
            // 这里直接追加到尾巴上
            oldDOM.parentNode.appendChild(createDOM(newVNode));
            break
        default:
            // 深度的 dom-diff，新老虚拟DOM都存在且类型相同
            deepDOMDiff(oldVNode, newVNode)
    }
}
export function findDomByVNode(VNode) {
    if (!VNode) return
    if (VNode.dom) return VNode.dom
}
const ReactDOM = {
    render
}
export default ReactDOM