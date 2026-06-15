import { createMemo, Show } from 'solid-js';
import { llm } from '@/src/stores/llmStore';
import { settings } from '@/src/features/settings/stores/settingStore';
import { formatKilo, calcPercentage, getProgressStyles } from './contextUsageUtils';

export function LastContextUsage() {
    const contextWindow = createMemo(() => {
        const meta = llm.lastResponseMeta;
        if (!meta) return null;
        const total = meta.promptEvalCount + meta.evalCount;
        const limit = settings().context_window_size;
        const percent = calcPercentage(total, limit);
        return {
            totalK: formatKilo(total),
            limitK: formatKilo(limit),
            percent: Math.round(percent),
            styles: getProgressStyles(percent),
            promptEvalCount: meta.promptEvalCount,
            evalCount: meta.evalCount,
        };
    });

    return <Show when={contextWindow()} fallback={
        <div class="text-xs font-semibold text-gray-400">No response data yet</div>
    }>
        <div class="flex flex-col gap-2 w-full text-xs font-semibold text-gray-500">
            <div class="flex justify-between items-end">
                <div>
                    Last Response Actual Usage &approx; {contextWindow().totalK}k/{contextWindow().limitK}k Tokens
                </div>
                <div class={contextWindow().styles.text}>
                    {contextWindow().percent}%
                </div>
            </div>

            <div class="w-full h-2 bg-gray-200 overflow-hidden">
                <div
                    class={`h-full transition-all duration-300 ease-out ${contextWindow().styles.bar}`}
                    style={{ width: `${contextWindow().percent}%` }}
                />
            </div>

            <div>
                Actual Tokens Used &approx; {contextWindow().promptEvalCount} prompt + {contextWindow().evalCount} output
            </div>
        </div>
    </Show>;
}
