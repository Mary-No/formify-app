import {aggregateInteger} from "./aggregateInteger";


test('Подсчет количества цифр',() => {
    const arr = [
        { author: "Мария", userId: "123", value: "7" },
        { author: "Иван", userId: "456", value: "10" },
        { author: "Оля", userId: "789", value: "10" }
    ]
    expect(aggregateInteger(arr)).toEqual([
        { value: 7, count: 1 },
        { value: 10, count: 2 },
    ]);
})