import { createMemo } from 'solid-js';
import { estimateTokensCount } from '@/src/libs/helpers/utils';


export default (props) => {
    const estimates = createMemo(() => estimateTokensCount(props.text));
    return <div>&approx; {estimates().min}-{estimates().max} Tokens</div>;
};
