import { createMemo } from 'solid-js';
import { estimateTokensCount } from '@/src/libs/helpers/utils';
import { settings } from '@/src/features/settings/stores/settingStore';
import { promptActions } from '@/src/features/prompt/stores/promptStore';
import { getEnabledToolsDefinitions } from '@/src/agent-engine/libs/helpers';
import { formatKilo, calcPercentage, getProgressStyles } from './contextUsageUtils';

export function ContextUsage() {

    const tokenEstimates = createMemo(() => {
        const text = promptActions.buildPrompt().getAllContent();
        const toolsDefinitions = getEnabledToolsDefinitions();
        return estimateTokensCount(text, toolsDefinitions);
    });

    const contextWindow = createMemo(() => {
        const max = tokenEstimates().max;
        const limit = settings().context_window_size;
        const percent = calcPercentage(max, limit);
        
        return {
            maxK: formatKilo(max),
            limitK: formatKilo(limit),
            percent: Math.round(percent),
            styles: getProgressStyles(percent)
        };
    });

    const minK = createMemo(() => formatKilo(tokenEstimates().min));
    const maxK = createMemo(() => formatKilo(tokenEstimates().max));

    return <div class="flex flex-col gap-2 w-full text-xs font-semibold text-gray-500">
        <div class="flex justify-between items-end">
            <div>
                Context Window Usage &approx; {contextWindow().maxK}k/{contextWindow().limitK}k Tokens
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
            Estimated Tokens Current Prompt &approx; {minK()}k-{maxK()}k
        </div>

    </div>;
}

export function ContextUsageMinimal() {
    const stats = createMemo(() => {
        const text = promptActions.buildPrompt().getAllContent();
        const toolsDefinitions = getEnabledToolsDefinitions();
        const est = estimateTokensCount(text, toolsDefinitions);
        const limit = settings()?.context_window_size || 0;
        const percent = calcPercentage(est.max, limit);
        
        return {
            avgK: formatKilo(est.max),
            limitK: formatKilo(limit),
            color: getProgressStyles(percent).text
        };
    });

    return <div class="flex items-center gap-2 truncate">
        <span class="text-gray-400">Tokens &approx;</span>
        <span class={stats().color}>{stats().avgK}k<span class={`mx-0.5 ${stats().color}`}>/</span>{stats().limitK}k</span>
    </div>;
}
