let calculator = function (operator, x, y) {
    if (operator == 'add') {
        return x + y
    } else {
        return x * y
    }
}
calculator.add = (x, y) => {
    return x + y
}
calculator.mutiple = (x, y)=> {
    return x * y
}



