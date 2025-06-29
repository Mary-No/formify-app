import type {AggregatedAnswer} from "../types/types.ts";

export function aggregateBoolean(answers: AggregatedAnswer[]) {
    const result: Record<'true' | 'false', number> = {
        true: 0,
        false: 0,
    };

    for (const a of answers) {
        const stringValue = String(a.value).toLowerCase();
        if (stringValue === 'true') {
            result.true += 1;
        } else {
            result.false += 1;
        }
    }

    return [
        { value: 'true', count: result.true },
        { value: 'false', count: result.false },
    ];
}
