import type { AggregatedAnswer, BarChartDatum } from "../../types/types.ts";


export function aggregateInteger(answers: AggregatedAnswer[]): BarChartDatum[] {
    const count: Record<number, number> = {};

    for (const a of answers) {
        const n = Number(a.value);
        if (!Number.isNaN(n)) {
            count[n] = (count[n] ?? 0) + 1;
        }
    }

    return Object.entries(count)
        .map(([value, count]) => ({
            value: Number(value),
            count,
        }))
        .sort((a, b) => a.value - b.value);
}

