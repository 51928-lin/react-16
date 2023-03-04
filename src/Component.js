import { updateDomTree, findDomByVNode } from './react-dom'
import { deepClone } from './utils'
export let updaterQueue = {
    isBatch: false,
    updaters: new Set()
}
export function flushUpdaterQueue(){
    updaterQueue.isBatch = false;
    for (let updater of updaterQueue.updaters) {
        updater.launchUpdate();
    }
    updaterQueue.updaters.clear();
}
class Updater {
    constructor(ClassComponentInstance) {
        this.ClassComponentInstance = ClassComponentInstance;
        this.pendingStates = [];
    }
    addState(partialState) {
        this.pendingStates.push(partialState);
        this.preHandleForUpdate();
    }
    preHandleForUpdate(nextProps) {
        this.nextProps = nextProps;
        if (updaterQueue.isBatch) {//如果是批量
            updaterQueue.updaters.add(this);//就把当前的updater添加到set里保存
        } else {
            this.launchUpdate();
        }
    }
    launchUpdate(nextProps) {
        const { ClassComponentInstance, pendingStates} = this;
        let prevProps = deepClone(this.ClassComponentInstance.props)
        let prevState = deepClone(this.ClassComponentInstance.state)
        if (pendingStates.length === 0 && !nextProps) return
        let isShouldUpdate = true;
        let nextState = this.pendingStates.reduce((preState, newState) => {
            return {
                ...preState, ...newState
            }
        }, this.ClassComponentInstance.state);
        if (ClassComponentInstance.shouldComponentUpdate && (!ClassComponentInstance.shouldComponentUpdate(nextProps, nextState))) {
            isShouldUpdate = false;
        }
        if(nextProps) ClassComponentInstance.props = nextProps
        ClassComponentInstance.state = nextState;
        this.pendingStates.length = 0
        if(isShouldUpdate) ClassComponentInstance.update(prevProps, prevState);
    }
}
export class Component {
    static IS_CLASS_COMPONENT = true
    constructor(props) {
        this.props = props;
        this.state = {};
        this.updater = new Updater(this);
    }
    setState(partialState) {
        /**
         * this.state = { ...this.state, ...partialState };
         * this.update()
         */
        this.updater.addState(partialState);
    }
    update(prevProps, prevState) {
        let oldVNode = this.oldVNode;
        let oldDOM = findDomByVNode(oldVNode);
        if (this.constructor.getDerivedStateFromProps) {
            let newState = this.constructor.getDerivedStateFromProps(this.props, this.state) || {};
            this.state = { ...this.state, ...newState };
        }
        let snapshot = this.getSnapshotBeforeUpdate && this.getSnapshotBeforeUpdate(prevProps, prevState);
        let newVNode = this.render();
        updateDomTree(oldVNode, newVNode, oldDOM)
        this.oldVNode = newVNode;
        if (this.componentDidUpdate) {
            this.componentDidUpdate(this.props, this.state, snapshot);
        }
    }
}