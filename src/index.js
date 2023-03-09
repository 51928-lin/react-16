
import React from './react';
import ReactDOM from './react-dom';
import { useReducer, useState, useEffect, useRef, useImperativeHandlel, useMemo } from './react';

// ///////////////////////////////// useState ///////////////////////////////////
// export default function Counter() {
//   const [count, setCount] = useState(0);

//   function handleClick() {
//     setCount(count + 1);
//   }

//   return (
//     <button onClick={handleClick}>
//       You pressed me {count} times
//     </button>
//   );
// }
// ReactDOM.render(<Counter />, document.getElementById('root'));

// ///////////////////////////////// useReducer ///////////////////////////////////


// function reducer(state, action) {
//   if (action.type === 'incremented_age') {
//     return {
//       age: state.age + 1
//     };
//   }
//   throw Error('Unknown action.');
// }

// function Counter() {
//   const [state, dispatch] = useReducer(reducer, { age: 42 });

//   return (<div>
//         <button onClick={() => {
//           dispatch({ type: 'incremented_age' })
//         }}>
//           Increment age
//         </button>
//         <p>Hello! You are {state.age}.</p>
//       </div>);
// }

// ReactDOM.render(<Counter />, document.getElementById('root'));

// ///////////////////////////////// useEffect/useLayoutEffect ///////////////////////////////////
// export function createConnection(serverUrl, roomId) {
//   // A real implementation would actually connect to the server
//   return {
//     connect() {
//       console.log('✅ Connecting to "' + roomId + '" room at ' + serverUrl + '...');
//     },
//     disconnect() {
//       console.log('❌ Disconnected from "' + roomId + '" room at ' + serverUrl);
//     }
//   };
// }

// function ChatRoom({ roomId }) {
//   const [serverUrl, setServerUrl] = useState('https://localhost:1234');

//   useEffect(() => {
//     const connection = createConnection(serverUrl, roomId);
//     connection.connect();
//     return () => {
//       connection.disconnect();
//     };
//   }, [roomId, serverUrl]);

//   return (
//     <div>
//       <label>
//         Server URL:{' '}
//         <input
//           value={serverUrl}
//           onChange={e => setServerUrl(e.target.value)}
//         />
//       </label>
//       <h1>Welcome to the {roomId} room!</h1>
//     </div>
//   );
// }

// export default function App() {
//   const [roomId, setRoomId] = useState('general');
//   const [show, setShow] = useState(false);
//   return <div>
//       <label>
//         Choose the chat room:{' '}
//         <select
//           value={roomId}
//           onChange={e => setRoomId(e.target.value)}
//         >
//           <option value="general">general</option>
//           <option value="travel">travel</option>
//           <option value="music">music</option>
//         </select>
//       </label>
//       <button onClick={() => setShow(!show)}>
//         {show ? 'Close chat' : 'Open chat'}
//       </button>
//       {show && <hr />}
//       {show && <ChatRoom roomId={roomId} />}
//     </div>
// }
// ReactDOM.render(<App />, document.getElementById('root'));

// /////////////////////////////////useRef///////////////////////////////////
// export default function Form() {
//   const inputRef = useRef(null);

//   function handleClick() {
//     inputRef.current.focus();
//   }

//   return (
//     <div>
//       <input ref={inputRef} />
//       <button onClick={handleClick}>
//         Focus the input
//       </button>
//     </div>
//   );
// }

// ReactDOM.render(<Form />, document.getElementById('root'));


// ///////////////////////////////// useImperativeHandle ///////////////////////////////////

// const MyInput = React.forwardRef(function MyInput(props, ref) {
//   const inputRef = useRef(null);

//   useImperativeHandle(ref, () => {
//     return {
//       focus() {
//         inputRef.current.focus();
//       },
//       scrollIntoView() {
//         inputRef.current.scrollIntoView();
//       },
//     };
//   }, []);

//   return <input {...props} ref={inputRef} />;
// });

// export default function Form() {
//   const ref = useRef(null);

//   function handleClick() {
//     ref.current.focus();
//     // This won't work because the DOM node isn't exposed:
//     // ref.current.style.opacity = 0.5;
//   }

//   return (
//     <form>
//       <MyInput label="Enter your name:" ref={ref} />
//       <button type="button" onClick={handleClick}>
//         Edit
//       </button>
//     </form>
//   );
// }
// ReactDOM.render(<Form />, document.getElementById('root'));

// ///////////////////////////////// useMemo/useCallback ///////////////////////////////////
// export function createTodos() {
//   const todos = [];
//   for (let i = 0; i < 50; i++) {
//     todos.push({
//       id: i,
//       text: "Todo " + (i + 1),
//       completed: Math.random() > 0.5
//     });
//   }
//   return todos;
// }

// export function filterTodos(todos, tab) {
//   console.log('[ARTIFICIALLY SLOW] Filtering ' + todos.length + ' todos for "' + tab + '" tab.');
//   let startTime = performance.now();
//   while (performance.now() - startTime < 500) {
//     // Do nothing for 500 ms to emulate extremely slow code
//   }

//   return todos.filter(todo => {
//     if (tab === 'all') {
//       return true;
//     } else if (tab === 'active') {
//       return !todo.completed;
//     } else if (tab === 'completed') {
//       return todo.completed;
//     }
//   });
// }
// function TodoList({ todos, theme, tab }) {
//   const visibleTodos = useMemo(
//     () => filterTodos(todos, tab),
//     [todos, tab]
//   );
//   return (
//     <div className={theme}>
//       <p><b>Note: <code>filterTodos</code> is artificially slowed down!</b></p>
//       <ul>
//         {visibleTodos.map(todo => (
//           <li key={todo.id}>
//             {todo.completed ?
//               <s>{todo.text}</s> :
//               todo.text
//             }
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


// const todos = createTodos();

// function App() {
//   const [tab, setTab] = useState('all');
//   const [isDark, setIsDark] = useState(false);
//   return (
//     <div>
//       <button onClick={() => setTab('all')}>
//         All
//       </button>
//       <button onClick={() => setTab('active')}>
//         Active
//       </button>
//       <button onClick={() => setTab('completed')}>
//         Completed
//       </button>
//       <br />
//       <label>
//         <input
//           type="checkbox"
//           checked={isDark}
//           onChange={e => setIsDark(e.target.checked)}
//         />
//         Dark mode
//       </label>
//       <hr />
//       <TodoList
//         todos={todos}
//         tab={tab}
//         theme={isDark ? 'dark' : 'light'}
//       />
//     </div>
//   );
// }
// ReactDOM.render(<App />, document.getElementById('root'));