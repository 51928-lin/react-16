// class Updatter {
//     constructor(commoninstance) {
//         this.commoninstance = commoninstance;
//         this.pendingstate = []
//     }
//     addstate(partialstate){
//         this.pendingstate.push(partialstate)
//     }
//     sayHello() {
//         console.log(`Hello, my name is ${this.name} and I'm ${this.age} years old.`);
//     }
// }

// class Common extends Updatter {
//     constructor(name, age, grade) {
//         // 当执行super后，会调用父类constructor方法，然后子类就可以继承该2个属性
//         // super(name, age);
//         this.updatter = new Updatter(this);
//         this.grade = grade;
//     }
//     study() {
//         console.log(`${this.name} is studying in grade ${this.grade}.`);
//     }
// }

// // 实类化会调用constructor方法，
// let s1 = new Student('lin', 35, 'party')




// class Common {
//     constructor(props){
//         this.props = props
//         this.pendingstate = [1,2,3,4,5]
//     }
// }

// class Mycommon extends Common {
//     outputprops(){
//         console.log(this.props)
//     }
// }

// let s = new Mycommon({a: 'aaaa'})

// console.log(s)

class Commonclass {
    constructor(age){
        this.age = age;
        this.array = []
    }
    testthis(){
        console.log('this', this)
    }
}

class Mycommon extends Commonclass{
    constructor(age){
        super(age)
        this.name = 'hahaha'
    }
}

// 如果子类中不constructor调用，父类会调用constructor，并且把Mycommoninstance，array属性挂载到mycommon上
// 此时testthis这个普通函数中的this指向mycommon实类

// 如果子类中调用父类,父类中的属性也是追加到子类的实类中，但是方法在原型上，但是圆形脸可以调用
let s = new Mycommon()

s.testthis()
