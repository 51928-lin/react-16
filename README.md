# simple-react

模拟实现react16 / react-dom16

1、 底层基于npx create-react-app 创建react项目，目的是方便直接使用react依赖的底层包，比如babel转译jsx
2、 创建自己的react / reac-dom 文件并引用，不再引用官方的react / react-dom
3、 该版本主要实现类组件 / 函数组件实现
4、 类组件中实现 componentdidmount / componentdidupdate / componentwillunmount / shouldcomponentupdate等钩子函数
5、 函数组件中实现 useState，useEffect，useMemo，useCallback，useRef等主要hooks
6、 diff算法实现通过将需要移动的节点，需要创建的节点存起来，删除没用到的节点方式实现
