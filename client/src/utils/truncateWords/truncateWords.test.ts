import {truncateWords} from "./truncateWords";

test('Слов меньше, чем лимит',() => {
    expect(truncateWords("hello world", 3)).toBe("hello world")
})
test('Количество слов равно лимиту',() => {
    expect(truncateWords("hello world", 2)).toBe("hello world")
})
test('Количество слов больше лимита',() => {
    expect(truncateWords("hello world and everyone", 2)).toBe("hello world...")
})