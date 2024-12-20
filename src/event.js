import { updatterQqueue, flushupdatterQqueue } from './Component'

export function addEvent(dom, eventName, bindFunction){
    // 1. 把事件挂载到document上，所以相同事件不需要在每个dom节点都挂载，节省内存
    // 2. 每个节点原先的事件绑定函数还是要执行，通过给每个dom新增一个属性去存事件名与函数的对应关系
    // 3. 然后while循环，从最内层开始，如果有就执行回调函数，这样每个dom节点的回调函数都执行了

    dom.attach = dom.attach || {} // 一个dom绑定多个事件，第一次click，第二次doubleclick 
    dom.attach[eventName] = bindFunction // 该bindFunction是箭头函数，指向类组件实类本身
    /* 
        1. 当 div > p > span 都绑定的是click事件，document此时绑定click事件
        第一次：span, click, () => {console.log('span')}
        第二次：p， click, () => {console.log('p')}
        第三次：div， click, () => {console.log('div')}
    */
    if(document[eventName]) return 
    document[eventName] = dispatchEvent

}


function dispatchEvent(nativeEvent){
    // 虽然事件绑定在document上，但是事件对象是触发事件那个dom的事件对象
    // console.log('nativeEvent', nativeEvent)
    updatterQqueue.isbatch = true;

    let syntheticEvent = createSyntheticEvent(nativeEvent)
    let target = nativeEvent.target;
    while(target){
        syntheticEvent.currentTarget = target;
        let eventname = `on${nativeEvent.type}`
        let bindfunction = target.attach && target.attach[eventname]
        bindfunction && bindfunction(syntheticEvent)
        if(syntheticEvent.isPropagationStopped){
            break
        }
        target = target.parentNode
    }



    flushupdatterQqueue()

}

function createSyntheticEvent(nativeEvent){
    // 当ie下，传入的是ie的nativeEvent， 当chrome下，传入的是chrome的nativeEvent
    let nativeEventkeyvalues = {}
    for(let key in nativeEvent){
        // nativeEvent[key].bind(nativeEvent) 原因： 当调用合成事件的阻止冒泡后，相关函数的this会变成合成事件
        // 但是我门需要的是让它绑定到真实的event对象上，也就是span节点上
        nativeEventkeyvalues[key] = typeof nativeEvent[key] === 'function' ? nativeEvent[key].bind(nativeEvent) : nativeEvent[key]
    }
    let syntheticEvent = Object.assign(nativeEventkeyvalues, {
        nativeEvent,
        isDefaultPrevented: false, // 这两个属性自己定义的，为合成事件判断当前是否已经执行默认行为
        isPropagationStopped: false,
        preventDefault: function(){
            this.isDefaultPrevented = true // 修改标志
            if(this.nativeEvent.preventDefault){
                // 谷歌等标准浏览器中 event.defaultPrevented 用来检测是否调用了 preventDefault()
                this.nativeEvent.preventDefault()
            }else{
                // ie 中 通过returnValue 阻止默认事件
                this.nativeEvent.returnValue = false
            }
        },
        stopPropagation(){
            this.isPropagationStopped = true;
            if(this.nativeEvent.stopPropagation){
                this.nativeEvent.stopPropagation()
            }else{
                this.nativeEvent.cancelBubble = true
            }
        }
         
    })
    return syntheticEvent
}