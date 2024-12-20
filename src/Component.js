import { updatedomtree,  findDomByVNode} from "./ReactDom";

export let updatterQqueue = {
    isbatch: false,
    updates: new Set()
}

export function flushupdatterQqueue(){
    updatterQqueue.isbatch = false;
    for (const update of updatterQqueue.updates) {
        // 这个update 实类就是updatter类的实类
        update.launchUpdate()
    }
    updatterQqueue.updates.clear()
}

class Updatter {
    // 这里去处理batch, 让两个类关联上的方式，通过挂载this对象
    constructor(classComponentInstance){
        this.classComponentInstance = classComponentInstance; // 这个this是updatter的this
        this.pendingState = []
    }
    addState(partialState){
        this.pendingState.push(partialState)
        // 然后开始预处理， 
        // 1. 先调用this.setstate({a: 1}) 继续调用 this.setstate({b: 1})，2次后
        // 2. this.setstate({a: 1})只调用了一次
        this.preHandleForUpdate()
    }
    preHandleForUpdate(){
        if(updatterQqueue.isbatch){
            // 批量合并处理，
            updatterQqueue.updates.add(this) // 这个this其实是updatter实类，这个实类有类组件的实类classComponentInstance
        }else {
            // 直接更新视图
            this.launchUpdate()
        }
    }
/**
场景一：当前类组件return的是原生dom树，则当前类中触发setstate更新后，nextProps是空的，shouldComponentUpdate在react内部执行
       把两次新旧状态传入，拿到用户执行函数的返回值，然后再次处理
场景二：当前类组件return的是子类组件树，当触发setstate后，父组件中nextProps也是空的，shouldComponentUpdate如果返回true，
       则父组件执行update更新，更新的是render函数中return的返回值，子组件可能有props，
 */
    launchUpdate(nextProps){
        const {classComponentInstance, pendingState} = this;
        if( this.pendingState.length === 0 && !nextProps ) return
        let isShouldUpdate = true
        let nextState = pendingState.reduce( (prestate, nextstate) => {
            return {
                ...prestate, ...nextstate
            }
        },  classComponentInstance.state)

        /*
            if判断这段代码应该提前，在实类修改state，props之前，如果在之后，就会造成前后state，props相同
            导致this.props与nextprops一样了
        */

        if(classComponentInstance.shouldComponentUpdate && !classComponentInstance.shouldComponentUpdate(nextProps, nextState)){
            isShouldUpdate = false
        }
        /**
         * 就算是不更新，我们也把状态赋值到实类
         */
        classComponentInstance.state = nextState
        if(nextProps) classComponentInstance.props = nextProps


        if(isShouldUpdate) classComponentInstance.update()
        this.pendingState.length = 0
    }

}

export class Component {
    static IS_CLASS_COMPONENT = true
    constructor(props){
        this.updater = new Updatter(this)
        // 每个实类都拥有自己的props对象
        this.props = props;
        // 页面存在多个类组件，当每个类组件使用的时候，需要继承父类的state属性，每个实类拥有state对象
        this.state = {}
    }
    setState(partialState){
        // 是否批处理，是否需要合并setstate中的对象
        // 然后调用update函数开始更新视图
        this.updater.addState(partialState)
    }
    /**  
     * 父子组件嵌套
     *  第一次this是父实类，它的oldVNode是子类dom树，render()返回的最新的子类dom树，开始updatedomtree，
     *  此时是两个子类dom树，由于他们新旧节点都存在，type类型相同，进行深度比较，由于都是类dom不是原生dom，继续update
     *  第二次this是子旧的实类(新的虚拟dom没有实类？？) 他的oldVNode就是原生dom树，render()返回原生dom树
     *  再次updatedomtree
     * 
    */
    update(){
        let oldVNode = this.oldVNode
        let oldDom = findDomByVNode(oldVNode)
        let newVNode = this.render();
        updatedomtree(oldVNode, newVNode, oldDom)
        this.oldVNode = newVNode
        if(this.componentDidUpdate){
            this.componentDidUpdate(this.props, this.state)
        }
    }

}