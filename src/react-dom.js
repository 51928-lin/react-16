import { REACT_ELEMENT } from './utils'
function render(VNode, containerDOM){
    mount(VNode, containerDOM)
}
function mount(VNode, containerDOM){
    let newDOM = createDOM(VNode)
    newDOM && containerDOM.appendChild(newDOM);
}
function createDOM(VNode){
    const {type, props} = VNode
    let dom;
    if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT){
        return getDomByFunctionComponent(VNode)
    }else if (type && VNode.$$typeof === REACT_ELEMENT) {
        dom = document.createElement(type);
    } 
    if(props){
        if (typeof props.children === 'object' && props.children.type) {
            mount(props.children, dom)
        } else if (Array.isArray(props.children)) {
            mountArray(props.children, dom);
        } else if (typeof props.children === 'string'){
            dom.appendChild(document.createTextNode(props.children));
        }
    }
    setPropsForDOM(dom, props)
    return dom
}
function mountArray(children, parent){
    if(!Array.isArray(children)) return
    for (let i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string'){
            parent.appendChild(document.createTextNode(children[i]))
        }else{
            mount(children[i], parent)
        }
    }
}

function setPropsForDOM(dom, VNodeProps = {}) {
    if(!dom) return
    for (let key in VNodeProps) {
        if (key === 'children') continue;
        if (/^on[A-Z].*/.test(key)) { // 大家需要注意这个正则表达式为什么这么写 
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Character_Classes
            // ^ :开头
            // . :含义1: Matches any single character except line terminators: \n, \r, \u2028分隔符 or \u2029段落分隔符. For example, /.y/ matches "my" and "ay", but not "yes", in "yes make my day", as there is no character before "y" in "yes".
            // . :含义2: Inside a character class, the dot loses its special meaning and matches a literal dot.
            // * : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Quantifiers Matches the preceding item "x" 0 or more times.
            // TODO: 事件相关内容我们在后续单独介绍
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
const ReactDOM = {
    render
}
export default ReactDOM