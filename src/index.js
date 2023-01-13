import React from './react';
import ReactDOM from './react-dom';
// function MyFunctionComponent(props){
//     return <div className='test-class' style={{color: 'red'}}>Simple React App<span>{props.xx}</span><span>xx2</span></div>
// }
class MyClassComponent extends React.Component{
    render(){
        return <div className='test-class' style={{color: 'red'}}>Simple React App {this.props.xx}</div>
    }
}
ReactDOM.render(<MyClassComponent xx="xx1"/>, document.getElementById('root'))