
import React from './react';
import ReactDOM from './react-dom';

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
        console.log('this.counter01:', this.state.text)
        this.setState({
            text: '当前数字:' + ++this.counter
        })
        console.log('this.counter02:',this.state.text)
        setTimeout(() => {
            this.setState({
                text: '当前数字:' + ++this.counter
            })
            console.log('this.counter03:', this.state.text)
            this.setState({
                text: '当前数字:' + ++this.counter
            })
            console.log('this.counter04:', this.state.text)
        }, 1000)
    }
    render(){
        return <div className='test-class' style={
                    {
                        color: 'red', 
                        cursor: 'pointer', 
                        border: '1px solid gray', 
                        borderRadius: '6px',
                        display: 'inline-block',
                        padding: '6px 12px'
                    }
                } onClick={ () => this.updateShowText() }>Hello ClassComponent: {this.state.text}</div>
    }
}
ReactDOM.render(<MyClassComponent />, document.getElementById('root'))