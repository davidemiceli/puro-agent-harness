
export default (props) => <div class='flex text-xs font-normal text-gray-500 gap-2'>
    <div class="font-semibold">{props.title}</div>
    <div>-</div>
    <div class="truncate">{props.description}.</div>
</div>;
