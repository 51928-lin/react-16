// import calculator from './calculator'

// interface Calculator {

// }


// declare const calculator:Calculator


type Operator = "add" | "mutiple"
interface ICalculator {
    (operator: Operator, X: number, y: number): number
    add(x: number, y: number):number;
    mutiple(x: number, y: number): number;
}

declare const calculator:ICalculator