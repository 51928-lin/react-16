


const calculator:ICalculator = function (operator, x, y) {
    if (operator == 'add') {
        return x + y
    } else {
        return x * y
    }
}
calculator.add = (x, y) => {
    return x + y
}
calculator.mutiple = (x: number, y: number): number => {
    return x * y
}

calculator('add',1,2)

