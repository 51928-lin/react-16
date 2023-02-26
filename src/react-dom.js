import { REACT_ELEMENT, REACT_FORWARD_REF, MOVE, CREATE, REACT_TEXT } from './utils'
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
    } else if (type && type.$$typeof === REACT_FORWARD_REF) {
        return getDomByRefForwardFunction(VNode);
    } else if (type === REACT_TEXT){
        dom = document.createTextNode(props.text);
    } else if (type && VNode.$$typeof === REACT_ELEMENT) {
        dom = document.createElement(type);
    }
    if (props) {
        if (typeof props.children === 'object' && props.children.type) {
            mount(props.children, dom)
        } else if (Array.isArray(props.children)) {
            mountArray(props.children, dom);
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
        children[i].index = i;
        mount(children[i], parent)
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
    let dom = createDOM(renderVNode);
    if (instance.componentDidMount) instance.componentDidMount();
    return dom
}
function getDomByRefForwardFunction(vNode) {
    let { type, props, ref } = vNode;
    let renderVdom = type.render(props, ref);
    if (!renderVdom) return null;
    return createDOM(renderVdom);
}
function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
    oldVNodeChildren = (Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]).filter(Boolean);
    newVNodeChildren = (Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]).filter(Boolean);
    
    // 利用Map数据结构为旧的虚拟DOM数组找到key和节点的关系，为后续根据key查找是否有可复用的虚拟DOM创造条件
    let lastNotChangedIndex = -1;
    let oldKeyChildMap = {};
    oldVNodeChildren.forEach((oldVNode, index) => {
        let oldKey = oldVNode && oldVNode.key ? oldVNode.key : index;
        oldKeyChildMap[oldKey] = oldVNode;
    });

    // 遍历新的子虚拟DOM树组，找到可以复用但需要移动的、需要重新创建的、需要删除的节点，剩下的都是不用动的节点
    let actions = [];
    newVNodeChildren.forEach((newVNode, index) => {
        if(typeof newVNode !== 'string'){
            newVNode.index = index;
        }
        let newKey = newVNode.key ? newVNode.key : index;
        let oldVNode = oldKeyChildMap[newKey];
        if (oldVNode) {
            deepDOMDiff(oldVNode, newVNode);
            if (oldVNode.index < lastNotChangedIndex) {
                actions.push({
                    type: MOVE,
                    oldVNode,
                    newVNode,
                    index
                });
            }
            delete oldKeyChildMap[newKey]
            lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
        } else {
            actions.push({
                type: CREATE,
                newVNode,
                index
            });
        }
    });

    // 可以复用但需要移动位置的节点，以及用不上需要删除的节点，都从父节点上移除
    let VNodeToMove = actions.filter(action => action.type === MOVE).map(action => action.oldVNode);
    let VNodeToDelete = Object.values(oldKeyChildMap)
    VNodeToMove.concat(VNodeToDelete).forEach(oldVChild => {
        let currentDOM = findDomByVNode(oldVChild);
        currentDOM.remove();
    });

    // 对需要移动以及需要新创建的节点统一插入到正确的位置
    actions.forEach(action => {
        let { type, oldVNode, newVNode, index } = action;
        let childNodes = parentDOM.childNodes;
        const getDomForInsert = () => {
            if(type === CREATE){
                return createDOM(newVNode)
            }
            if(type === MOVE){
                return findDomByVNode(oldVNode)
            }
        }
        let childNode = childNodes[index];
        if (childNode) {
            parentDOM.insertBefore(getDomForInsert(), childNode)
        } else {
            parentDOM.appendChild(getDomForInsert());
        }
    });
}
function updateClassComponent(oldVNode, newVNode) {
    const classInstance = newVNode.classInstance = oldVNode.classInstance;
    classInstance.updater.launchUpdate();
}
function updateFunctionComponent(oldVNode, newVNode) {
    let oldDOM = findDomByVNode(oldVNode);
    if (!oldDOM) return;
    const { type, props } = newVNode;
    let newRenderVNode = type(props);
    updateDomTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
    newVNode.oldRenderVNode = newRenderVNode;
}

function deepDOMDiff(oldVNode, newVNode) {
    let diffTypeMap = {
        ORIGIN_NODE: typeof oldVNode.type === 'string', // 原生节点
        CLASS_COMPONENT: typeof oldVNode.type === 'function' && oldVNode.type.isReactComponent,
        FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
        TEXT: oldVNode.type === REACT_TEXT
    }
    let DIFF_TYPE = Object.keys(diffTypeMap).filter(key => diffTypeMap[key])[0]
    switch (DIFF_TYPE) {
        case 'ORIGIN_NODE':
            let currentDOM = newVNode.dom = findDomByVNode(oldVNode);
            setPropsForDOM(currentDOM, newVNode.props)
            updateChildren(currentDOM, oldVNode.props.children, newVNode.props.children);
            break;
        case 'CLASS_COMPONENT':
            updateClassComponent(oldVNode, newVNode);
            break;
        case 'FUNCTION_COMPONENT':
            updateFunctionComponent(oldVNode, newVNode);
            break;
        case 'TEXT':
            newVNode.dom = findDomByVNode(oldVNode);
            newVNode.dom.textContent = newVNode.props.text;
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
        DELETE: oldVNode && !newVNode,
        REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type // 类型不同
    }
    let UPDATE_TYPE = Object.keys(typeMap).filter(key => typeMap[key])[0]

    switch (UPDATE_TYPE) {
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
            break;
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