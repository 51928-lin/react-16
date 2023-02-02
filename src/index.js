import React from './react';
import ReactDOM from './react-dom';
// function MyFunctionComponent(props){
//     return <div className='test-class' style={{color: 'red'}}>Simple React App<span>{props.xx}</span><span>xx2</span></div>
// }
class MyClassComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = { xxx: '999' };
    }
    render(){
        return <div className='test-class' style={{color: 'red'}}>Simple React App {this.state.xxx}</div>
    }
}
ReactDOM.render(<MyClassComponent />, document.getElementById('root'))