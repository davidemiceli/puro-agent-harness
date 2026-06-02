import { createResource } from 'solid-js';
import APIs from '@/src/services/apis';
import { buildFileTree } from '@/src/libs/helpers/utils';


const [fileList, { refetch: refreshFileList }] = createResource(async () => {
    const files = await APIs.listFiles();
    return buildFileTree(files);
});

export { fileList, refreshFileList };