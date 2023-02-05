import React from 'react';///////
import ReactDOM from 'react-dom';///////

// import React from './react';//////
// import ReactDOM from './react-dom';//////

class MyClassComponent extends React.Component{
    counter = 0
    isBlue = false
    constructor(props) {
        super(props);
        this.state = { count: '0' };
        this.myRef = React.createRef();
    }
    updateShowText(newText){
        this.setState({
            count: newText
        })
        const element = this.myRef.current;
        element.style.color = this.isBlue ? 'blue' : 'red' //////
        this.isBlue = !this.isBlue //////
    }
    render(){
        return <div className='test-class' ref={ this.myRef } style={
            {
                color: 'red', 
                cursor: 'pointer', 
                border: '1px solid gray', 
                borderRadius: '6px',
                display: 'inline-block',
                padding: '6px 12px'
            }
        } onClick={ () => this.updateShowText('' + ++this.counter) }>Simple React Counter: {this.state.count}</div>
    }
}
ReactDOM.render(<MyClassComponent />, document.getElementById('root'))