import type { BarChartDatum } from "../pages/StatisticPage/StatisticPage.tsx";
import type {AggregatedAnswer} from "../types/types.ts";

export function aggregateInteger(answers: AggregatedAnswer[]): BarChartDatum[] {
    const countMap = new Map<number, number>();

    for (const a of answers) {
        const v = Number(a.value);
        if (!isNaN(v)) {
            countMap.set(v, (countMap.get(v) || 0) + 1);
        }
    }

    const data = Array.from(countMap.entries()).map(([value, count]) => ({
        value,
        count,
    }));

    data.sort((a, b) => a.value - b.value);

    return data;
}
