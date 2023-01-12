import React from './react';
import ReactDOM from './react-dom';
function MyFunctionComponent(props){
    return <div className='test-class' style={{color: 'red'}}>Simple React App<span>{props.xx}</span><span>xx2</span></div>
}
ReactDOM.render(<MyFunctionComponent xx="xx1"/>, document.getElementById('root'))