
function createElement(type){
  let arg = Array.prototype.slice.call(arguments, 1)
  console.log(arg)
  return {
    type,
    children: arg
  }
}


let jsx = createElement('section',
        createElement('div',createElement('span')),
)

console.log(jsx)




