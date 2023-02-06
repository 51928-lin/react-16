// import React from 'react';///////
// import ReactDOM from 'react-dom';///////

import React from './react';//////
import ReactDOM from './react-dom';//////

function MyFunctionComponent(){
    return <div style={{
        cursor: 'pointer', 
        border: '1px solid gray', 
        borderRadius: '6px',
        width: '176px',
        marginTop: '20px',
        padding: '6px 12px'
    }}>Hello Function Component</div>
}

class MyClassComponent extends React.Component{
    counter = 0
    isBlue = false
    constructor(props) {
        super(props);
        this.state = { text: '当前数字: 0' };
    }
    updateShowText(){
        this.setState({
            text: '当前数字:' + ++this.counter
        })
    }
    render(){
        return <div>
                <div className='test-class' style={
                    {
                        color: 'red', 
                        cursor: 'pointer', 
                        border: '1px solid gray', 
                        borderRadius: '6px',
                        display: 'inline-block',
                        padding: '6px 12px'
                    }
                } onClick={ () => this.updateShowText() }>Hello Class Component: {this.state.text}</div>
                <MyFunctionComponent/>
              </div>
    }
}
ReactDOM.render(<MyClassComponent />, document.getElementById('root'))