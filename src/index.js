
import React from 'react';
import ReactDOM from 'react-dom';

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  // https://reactjs.org/docs/react-component.html#componentdidmount
  // 1.组件挂载到页面上（已经操作了真实DOM）后调用
  // 2.需要DOM节点的相关初始化操作需要放在这里
  // 3.加载相关数据的好地方
  // 4.适合事件订阅的，但要记住订阅的事件要在componentWillUnmount中取消订阅
  // 5.不适合在这里调用setState，state初始值最好在constructor中赋值
  componentDidMount() {
    console.log('componentDidMount')
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  // https://reactjs.org/docs/react-component.html#componentdidupdate
  // 1.更新完成后调用，初始化渲染不会调用
  // 2.当组件完成更新，需要对DOM进行某种操作的时候，适合在这个函数中进行
  // 3.当当前的props和之前的props有所不同，可以在这里进行有必要的网络请求
  // 4.这里虽然可以调用setState，但是要记住有条件的调用，否则会陷入死循环
  // 5.如果shouldComponentUpdate() 返回false，componentDidUpdate不会执行
  // 6.如果实现了getSnapshotBeforeUpdate，componentDidUpdate会接收第三个参数
  // 7.如果将props中的内容拷贝到state，可以考虑直接使用props
  // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('componentDidUpdated', prevProps, prevState, snapshot)
  }

  // https://reactjs.org/docs/react-component.html#componentwillunmount
  // 1.组件从DOM树上卸载完成的时候调用该函数
  // 2.执行一些清理操作，比如清除定时器，取消事件订阅，取消网络请求等
  // 3.不能在该函数中调用setState，不会产生任何效果，卸载后不会重新渲染
  componentWillUnmount() {
    console.log('componentWillUnmount')
    clearInterval(this.timerID);
  }

  // https://reactjs.org/docs/react-component.html#shouldcomponentupdate
  // 1.让React知道state和props的变化不影响页面内容，也就是不会再次执行render函数
  // 2.默认行为是每次state发生变化，组件都会重新渲染，绝大多数场景下都应该使用默认行为，所以一般不用该函数
  // 3.会在接收到新的props或者state后，render函数执行前被调用，在初始化阶段和forceUpdate阶段不会执行
  // 4.该方法仅作为性能优化
  // 5.考虑使用内置的PureComponent，而不是手动在shouldComponentUpdate中编写代码，PureComponent对props和state都只进行浅层比较
  // 6.如果手动编写shouldComponentUpdate，应将this.props与nextProps以及this.state与nextState进行比较，相同则返回false表示可以跳过更新，但是返回false不能避免子组件的更新
  // 7.不建议在该函数内执行深度比较，或者通过JSON.stringify()比较，这样性能会很低
  // 8.如果返回false，UNSAFE_componentWillUpdate、render、componentDidUpdate都不会执行
  shouldComponentUpdate(nextProps, nextState){

  }

  // https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
  // 1.在render函数执行之前调用
  // 2.返回一个对象则更新state，返回null表示没有任何更新
  // 3.使用这个函数的场景很少，当state需要随着props的变化而变化的时候才会用到，其实相当于一种缓冲机制
  /**
   * class Form extends Component {
   *     state = {
   *       email: this.props.defaultEmail,
   *       prevUserID: this.props.userID
   *     };
   *     static getDerivedStateFromProps(props, state) {
   *       // Any time the current user changes,
   *       // Reset any parts of state that are tied to that user.
   *       // In this simple example, that's just the email.
   *       if (props.userID !== state.prevUserID) {
   *         return {
   *           prevUserID: props.userID,
   *           email: props.defaultEmail
   *         };
   *      }
   *       return null;
   *     }
   *     // ...
   *   }
   **/
  // 4.如果需要使用的时候，可以考虑用memoization技术
  // memoization技术介绍：https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#what-about-memoization
  // 5.静态函数不能访问类实例，因此多个类组件可以抽取为纯函数的公用逻辑
  // 6.该函数在初始化挂载，更新，调用forceUpdate都会执行，与场景无关，而UNSAFE_componentWillReceiveProps只在由于父组件导致的更新的场景下调用，组件内的setState导致的更新不会调用
  static getDerivedStateFromProps(props, state) {

  }
  
  // https://reactjs.org/docs/react-component.html#getsnapshotbeforeupdate
  // 1.该函数在render函数执行完成生成真实DOM后，DOM挂载到页面前执行
  // 2.该函数使得组件在DOM发生变化之前可以获取一些信息
  // 3.该函数返回的任何值都会作为componentDidUpdate的第三个参数传入
  // 4.该生命周期函数并不常用，仅仅在一些特定UI变化的场景才会用到
  // class ScrollingList extends React.Component {
  //   constructor(props) {
  //     super(props);
  //     this.listRef = React.createRef();
  //   }
  
  //   getSnapshotBeforeUpdate(prevProps, prevState) {
  //     // Are we adding new items to the list?
  //     // Capture the scroll position so we can adjust scroll later.
  //     if (prevProps.list.length < this.props.list.length) {
  //       const list = this.listRef.current;
  //       return list.scrollHeight - list.scrollTop;
  //     }
  //     return null;
  //   }
  
  //   componentDidUpdate(prevProps, prevState, snapshot) {
  //     // If we have a snapshot value, we've just added new items.
  //     // Adjust scroll so these new items don't push the old ones out of view.
  //     // (snapshot here is the value returned from getSnapshotBeforeUpdate)
  //     if (snapshot !== null) {
  //       const list = this.listRef.current;
  //       list.scrollTop = list.scrollHeight - snapshot;
  //     }
  //   }
  
  //   render() {
  //     return (
  //       <div ref={this.listRef}>{/* ...contents... */}</div>
  //     );
  //   }
  // }
  getSnapshotBeforeUpdate(prevProps, prevState){

  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}

ReactDOM.render(<Clock />, document.getElementById('root'));