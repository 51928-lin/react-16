function createElement(type, properties = {}, children) {
    let ref = properties.ref; // 后面会讲到，这里只需要知道是跟操作DOM相关
    let key = properties.key; // 后面会讲到，这里只需要知道这个跟DOM DIFF相关

    ;['ref', 'key'].forEach(key => { // 可能还会有别的属性也不需要，在发现的时候我们再添加需要删除的属性
        if(properties[key]){
            delete properties[key] // props中有些属性并不需要
        }
    })

    let props = {...properties}

    if (arguments.length > 3) {
        // 多个子元素, 转化成数组
        props.children = Array.prototype.slice.call(arguments, 2);
      } else {
        // 单个子元素，转化为数组
        props.children = children ? [children] : [];
      }


    return {
      type, // 虚拟DOM的元素类型
      ref,
      key,
      props
    }
  }
  const React = {
    createElement
  }
  export default React;