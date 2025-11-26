import type {AggregatedAnswer} from "../../types/types.ts";

export function aggregateBoolean(answers: AggregatedAnswer[]) {
    let trueCount = 0;
    let falseCount = 0;

    for (const a of answers) {
        a.value === "true"? trueCount++ : falseCount++;
    }

    return [
        { value: "true", count: trueCount },
        { value: "false", count: falseCount },
    ];
}
