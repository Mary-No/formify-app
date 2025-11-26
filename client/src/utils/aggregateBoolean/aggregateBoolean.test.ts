import {aggregateBoolean} from "./aggregateBoolean";

test('Подсчет true и false',() => {
    const arr = [
        { author: "Мария", userId: "123", value: "true" },
        { author: "Иван", userId: "456", value: "false" },
        { author: "Оля", userId: "789", value: "true" }
    ]
        expect(aggregateBoolean(arr)).toEqual([
            { value: "true", count: 2 },
            { value: "false", count: 1 },
        ]);
})