import { updaterQueue, flushUpdaterQueue } from "./Component.js";

export function addEvent(dom, eventName, bindFunction) {
    dom.attach = dom.attach || {}
    dom.attach[eventName] = bindFunction

    // 核心点 1/2: 事件绑定到document上
    if(document[eventName]) return
    document[eventName] = dispatchEvent;
}

function dispatchEvent(nativeEvent) {
    updaterQueue.isBatch = true;

    // 这里本质上是对原始事件进行了一层代理
    // 核心点 2/2: 屏蔽浏览器差异
    let syntheticEvent = createSyntheticEvent(nativeEvent);

    let target = nativeEvent.target;

    /**
     * while循环是为了处理冒泡，否则执行执行下面代码就可以了:
     * let eventType = `on${nativeEvent.type}`;
     * let bindFunction = target.attach && target.attach[eventType];
     * bindFunction && bindFunction(nativeEvent.target)
     */
    while (target) {
        syntheticEvent.currentTarget = target
        let eventName = `on${nativeEvent.type}`;
        let bindFunction = target.attach && target.attach[eventName];
        bindFunction && bindFunction(syntheticEvent);
        if (syntheticEvent.isPropagationStopped) {
            break;
        }
        target = target.parentNode;
    }

    flushUpdaterQueue()
}

function createSyntheticEvent(nativeEvent) {
    let natvieEventKeyValues = {}
    for(let key in nativeEvent){
        natvieEventKeyValues[key] = typeof nativeEvent[key] === 'function'? nativeEvent[key].bind(nativeEvent) : nativeEvent[key]
    }
    let syntheticEvent = Object.assign(natvieEventKeyValues, {
        nativeEvent,
        isDefaultPrevented: false,
        isPropagationStopped: false,
        preventDefault: function () {
            this.isDefaultPrevented = true;
            if (this.nativeEvent.preventDefault) {
                this.nativeEvent.preventDefault();
            } else {
                this.nativeEvent.returnValue = false;
            }
        },
        stopPropagation: function () {
            this.isPropagationStopped = true;
            if (this.nativeEvent.stopPropagation) {
                this.nativeEvent.stopPropagation();
            } else {
                this.nativeEvent.cancelBubble = true;
            }
        }
    })
    return syntheticEvent
}