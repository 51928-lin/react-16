
import React from 'react';
import ReactDOM from 'react-dom';

class Greeting extends React.PureComponent {
  render() {
    console.log("Greeting was rendered at", new Date().toLocaleTimeString());
    return <h3>Hello{this.props.name && ', '}{this.props.name}!</h3>;
  }
}

class MyApp extends React.Component {
  constructor(props){
    super(props)
    this.state = {name: '', address: ''}
  }

  setName = (name) => {
    this.setState({name})
  }
  setAddress = (address) => {
    this.setState({address})
  }
  render(){
    return <div>
      <label>
        Name{': '}
        <input value={this.state.name} onChange={e => this.setName(e.target.value)} />
      </label>
      <label>
        Address{': '}
        <input value={this.state.address} onChange={e => this.setAddress(e.target.value)} />
      </label>
      <Greeting name={this.state.name} />
    </div> 
  };
}

ReactDOM.render(<MyApp />, document.getElementById('root'));