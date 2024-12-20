
import React, {useState, useMemo,useCallback} from './react';
import ReactDom from './ReactDom'


function Child({ data, handleClick }) {
    console.log('render Child')
    return (<button onClick={handleClick}>Button Number: {data.number}</button>)
  }
  const MemoChild = React.memo(Child);

  function App() {
    console.log('render App')
    const [name, setName] = useState('yangyitao');
    const [number, setNumber] = useState(0);
    let data = useMemo(() => ({number}), [number])
    let handleClick = useCallback(() => setNumber(number + 1), [number])

    return (
      <div>
        <input type="text" value={name} onInput={event => setName(event.target.value)} />
        <MemoChild data={data} handleClick={handleClick} />
      </div>
    )
  }
  ReactDom.render(<App />, document.getElementById('root'));







