import type { AggregatedAnswer } from "../types/types";

export function aggregateSingleChoice(answers: AggregatedAnswer[], options: string[]) {
    const counts = options.reduce<Record<string, number>>((acc, option) => {
        acc[option] = 0;
        return acc;
    }, {});

    answers.forEach(({ value }) => {
        const stringValue = String(value); // приведение к строке
        if (stringValue in counts) {
            counts[stringValue]++;
        }
    });
    return options.map(option => ({
        type: option,
        value: counts[option],
    }));
}
