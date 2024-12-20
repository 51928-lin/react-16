import { REACT_ELEMENT, REACT_FORWARD_REF,REACT_TEXT,MOVE, CREATE,REACT_MEMO } from './utils'
import {resetHookIndex} from './hooks'
import {addEvent} from './event'
export let emitUpdateForHooks
/*
    一： dom树的定义很宽泛，是一个复合的dom结构，每个层级都可能包括type是函数，或类，或原生的对象够成的dom树
*/
function render(VNode, containerDOM){
    // console.log(VNode, containerDOM)
    mount(VNode, containerDOM)
    emitUpdateForHooks = () => {
        resetHookIndex()
        updatedomtree(VNode, VNode, findDomByVNode(VNode));
    }
}
// 这段代码是递归处理父子节点挂载问题
// 递归，如果写在一个函数体内，那么函数调用栈只是该函数入栈出栈
// 如果写两个函数，两个函数不断出栈入栈，需要另一个函数作为返回值
function mount(VNode, containerDOM){
    // dom操作中只能appendchild向父节点插入节点，如果从内向外，生成的父节点怎么包含子节点
    // 所以从外向内，先生成父节点，然后在生成子节点，然后通过api插入
    VNode.parentDom = containerDOM
    let newDOM = createDOM(VNode)
    newDOM && containerDOM.appendChild(newDOM)
}

function createDOM(VNode) {
    // 创建真实dom
    let {type, props, ref} = VNode;
    let dom;

    // 如果是memo对象，其type中有$$typeof字段，是memo类型
    if(type && type.$$typeof === REACT_MEMO){
       return getDomByMemoFunctionComponent(VNode)
    }

    if (type && type.$$typeof === REACT_FORWARD_REF) {
        return getDomByRefForwardFunction(VNode);
    }
    if(typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT && type.IS_CLASS_COMPONENT === true){
        return getDomByClassComponent(VNode)
    }
    if(typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT){
        // 如果type是函数，执行该函数，返回虚拟dom树
        return getDomByFunctionComponent(VNode)
    }
    if(type === REACT_TEXT){
        dom = (document.createTextNode(props.text))
    }
    if (type && VNode.$$typeof === REACT_ELEMENT) {
        // 如果type是标签，那么直接创建，然后挂载父节点
        dom = document.createElement(type);
    }
    if(props){
        if(typeof props.children === 'object' && props.children.type){
            mount(props.children, dom)
        }else if(Array.isArray(props.children)){
            mountArray(props.children, dom)
        }
    }
    // 如果要给每个dom上添加属性，应该在每次创建dom的时候添加
    setPropsForDom(dom, props)
    VNode.dom = dom

    ref && (ref.current = dom)
    return dom
}



function getDomByRefForwardFunction(vNode){
    let { type, props, ref } = vNode;
    let renderVdom = type.render(props, ref);
    if (!renderVdom) return null;
    return createDOM(renderVdom);
}

function getDomByClassComponent(VNode) {
    let {type, props,ref} = VNode;
// 1. 父子嵌套组件
/* 第一次VNode是父类dom树，instance是父实类，render是子类dom树，父类dom树挂载classInstance为父类实类
instance挂载的oldVNode是父类实类的render返回值，也就是子类dom树 */
/**
 * 第二次VNode是子类dom树，instance是子实类，render是原生dom树，子类dom树挂载classInstance为子类实类
 * instance挂载的oldvnode是子类实类的render返回值，也就是原生dom树 */
    let instance = new type(props);
    let renderDom = instance.render();
    VNode.classInstance = instance
    instance.oldVNode = renderDom
    instance.oldVNode && (instance.oldVNode.parentDom = VNode.parentDom)
    ref && (ref.current = instance)

    if(!renderDom) return null;
    let dom = createDOM(renderDom)
    VNode.dom = dom
    // 创建完真实dom之后就触发,这个返回值就是要插入到根节点的
    if(instance.componentDidMount) instance.componentDidMount()
    return dom
}

function getDomByFunctionComponent(VNode){
    // 创建虚拟dom，然后createdom创建真实dom，然后返回值给到mount函数，最终插入到div#root
    let {type, props, ref} = VNode;
    let rendervdom = type(props, ref);
    if(!rendervdom) return null;
    VNode.oldRenderVNode = rendervdom
    let dom = createDOM(rendervdom)
    VNode.dom = dom;
    return dom
}

function getDomByMemoFunctionComponent(vNode){
    let {type, props} = vNode
    let renderDom = type.type(props)
    if(!renderDom) return null // jsx中返回null
    // 这里为何要挂载相同的属性oldRenderVNode ？？？？
    vNode.oldRenderVNode = renderDom
    return createDOM(renderDom)
}

export function findDomByVNode(oldVNode){
    if(oldVNode.dom) return oldVNode.dom
    // if(typeof oldVNode.type === 'function' && oldVNode.$$typeof === REACT_ELEMENT && oldVNode.type.IS_CLASS_COMPONENT === true){
    //     let dom = (oldVNode.classInstance && oldVNode.classInstance.oldVNode.dom)
    //     return dom 
    // }
}

export function updatedomtree(oldVNode, newVNode, oldDom){
    const typeMap = {
        NO_OPERATE: !oldVNode && !newVNode,
        // 大概知道什么意思
        ADD: !oldVNode && newVNode,
        // 已完成场景测试
        DELETE: oldVNode && !newVNode,
        // 已完成场景测试
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
            oldDom.parentNode.appendChild(createDOM(newVNode));
            break
        case 'REPLACE':
            removeVNode(oldVNode);
            // 这里直接追加到尾巴上
            oldVNode.parentDom.appendChild(createDOM(newVNode));
            break
        default:
            // 深度的 dom-diff，新老虚拟DOM都存在且类型相同
            deepDOMDiff(oldVNode, newVNode)
            break;
    }

    
}

/**
 *  1. 原生dom节点，旧节点div，新节点p，此时需要先移除div，再追加p，但原生直接操作就可以，没有生命周期
 *  2. 类dom节点，每个类都有自己的卸载前钩子，如果新旧都是同一个A组件，会深度比较，不会移除，只有当前后两个类型不同
 *     此时前一个如果是类组件，才会调用
 */
function removeVNode(vNode) {
    const currentDOM = findDomByVNode(vNode);
    if (currentDOM) currentDOM.remove();
    if(vNode.classInstance && vNode.classInstance.componentWillUnmount){
        vNode.classInstance.componentWillUnmount()
    }
}

function deepDOMDiff(oldVNode, newVNode) {
    // console.log(oldVNode, newVNode)
    let diffTypeMap = {
        ORIGIN_NODE: typeof oldVNode.type === 'string', // 原生节点
        CLASS_COMPONENT: typeof oldVNode.type === 'function' && oldVNode.type.IS_CLASS_COMPONENT,
        FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
        TEXT: oldVNode.type === REACT_TEXT,
        MEMO: oldVNode.type.$$typeof === REACT_MEMO
    }
    let DIFF_TYPE = Object.keys(diffTypeMap).filter(key => diffTypeMap[key])[0]
    switch (DIFF_TYPE) {
        case 'ORIGIN_NODE':
            // newVNode只是根据render返回的一段解析jsx的复合虚拟dom树，oldVNode已经挂载真实dom节点
            // 就要利用这个真实dom，需要把新的虚拟dom属性传递
            let currentDOM = newVNode.dom = findDomByVNode(oldVNode);
            // 属性直接用新虚拟dom覆盖真实dom节点
            setPropsForDom(currentDOM, newVNode.props)
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
        case 'MEMO':
            updateMemoFunctionComponent(oldVNode, newVNode)
        default:
            break;
    }
}

function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
    oldVNodeChildren = (Array.isArray(oldVNodeChildren) ? oldVNodeChildren : [oldVNodeChildren]).filter(Boolean);
    newVNodeChildren = (Array.isArray(newVNodeChildren) ? newVNodeChildren : [newVNodeChildren]).filter(Boolean);
    
    /*
    创建key或者index与虚拟dom的对应关系，diff算法根据key或者index，从而找到背后的虚拟dom
    如果没有key，那么对比关系新旧children都是index下标，会按照顺序比较，效率非常低下
    */ 
    let lastNotChangedIndex = -1;
    let oldKeyChildMap = {};
    oldVNodeChildren.forEach((oldVNode, index) => {
        let oldKey = oldVNode && oldVNode.key ? oldVNode.key : index;
        oldKeyChildMap[oldKey] = oldVNode;
    });

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


    actions.forEach(action => {
        debugger
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

// 1. 父子嵌套
/**
    第一次updateClassComponent时候，oldVNode与newvnode都是type为childcomponent的子类dom树，当再次出发update时
    就可以获取子组件中的原生dom树
 */
function updateClassComponent(oldVNode, newVNode) {
    const classInstance = newVNode.classInstance = oldVNode.classInstance;
    // 如果render中的return是子组件，那么很可能父组件有state传入子组件，props中包括自定义属性
    classInstance.updater.launchUpdate(newVNode.props);
}

/**
 * 类组件的更新重新调用launchUpdate
 * 函数和对象，并没有重新launchUpdate，而是直接调用updatedomtree，因为直接拿到renderdom
 */

function updateFunctionComponent(oldVNode, newVNode) {
    let oldDOM = newVNode.dom = findDomByVNode(oldVNode);
    if (!oldDOM) return;

    const { type, props } = newVNode;
    let newRenderVNode = type(props);
    updatedomtree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
    newVNode.oldRenderVNode = newRenderVNode;
}

function updateMemoFunctionComponent(oldVNode, newVNode){
    let { type } = oldVNode;
    if (!type.compare(oldVNode.props, newVNode.props)) {
        const oldDOM = findDomByVNode(oldVNode);
        const { type } = newVNode;
        let renderVNode = type.type(newVNode.props);
        updatedomtree(oldVNode.oldRenderVNode, renderVNode, oldDOM);
        newVNode.oldRenderVNode = renderVNode;
    } else {
        newVNode.oldRenderVNode = oldVNode.oldRenderVNode;
    }
}   



function mountArray(children, parent){
    for(let i = 0;  i< children.length; i++){
        if(!children[i]) continue
        children[i].index = i // diff算法用处
        mount(children[i], parent)
    }
}

function setPropsForDom(dom, VNodeProps = {}){
    if(!dom) return 
    for (const key in VNodeProps) {
            if(key === 'children') continue;
            if(/^on[A-Z].*/.test(key)){
                // debugger
                // dom[key.toLowerCase()] = VNodeProps[key] // 古老的方式，在每个dom上绑定事件并处理回调函数
                addEvent(dom, key.toLowerCase(), VNodeProps[key])
                // 以on开头，^管的是后面的字符串直到遇到下个正则表达式
                // [A-Z] 表示其中任何一个自符，
               // 如果是事件 todo
            }else if(key === 'style'){
                // 如果是style样式
                Object.keys(VNodeProps[key]).forEach(styleName => {
                    // 挂载到dom上
                    dom.style[styleName] = VNodeProps[key][styleName]
                })
            }else {
                // console.log('---', key, VNodeProps[key])
                // 如果是class，如果是其他属性
                dom[key] = VNodeProps[key]
            }
    }
}



const ReactDom = {
    render
}

export default ReactDom
// 分析代码
/*
第一次调mount函数，传入{type: 'div', props: { children: { type: 'p', props: {children: 'asdf'} } } }, 真实root
第一次调用createdom函数，document.createElement(type)创建div真实dom，由于children是一个对象
第二次调用mount函数，传入{ type: 'p', props: {children: 'asdf'} }， div真实dom
第二次调用createdom函数，document.createElement(type)创建p真实dom，由于children是一个字符串
在本次调用中，向p标签正插入文本，然后返回真实的p节点的dom，回到mount函数中此时出现两个真实的p，div节点
然后第二次调用mount函数结束，此时dom是一个包含p节点的div节点
回到第一次调用createdom函数体中，返回的是div节点，然后插入到根dom节点中

*/


