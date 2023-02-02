import { updateDomTree, findDomByVNode } from './react-dom'
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
    preHandleForUpdate() {
        if (updaterQueue.isBatch) {//如果是批量
            updaterQueue.updaters.add(this);//就把当前的updater添加到set里保存
        } else {
            this.launchUpdate();
        }
    }
    launchUpdate() {
        const { ClassComponentInstance, pendingStates } = this;
        if (pendingStates.length === 0) return
        ClassComponentInstance.state = this.pendingStates.reduce((preState, newState) => {
            return {
                ...preState, ...newState
            }
        }, this.ClassComponentInstance.state);
        this.pendingStates.length = 0
        ClassComponentInstance.update();
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
    update() {
        let oldVNode = this.oldVNode;
        let oldDOM = findDomByVNode(oldVNode);
        let newVNode = this.render();
        updateDomTree(oldDOM, newVNode)
        this.oldVNode = newVNode;
    }
}