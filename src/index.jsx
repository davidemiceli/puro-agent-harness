import 'solid-devtools'; // To refresh reload
import '@/src/index.css';
import { render } from 'solid-js/web';
import App from '@/src/app';
import { HashRouter } from '@solidjs/router';
import { routes } from '@/src/routes/routes';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error('Root element not found.');
}

render(
    () => <HashRouter root={(props) => <App>{props.children}</App>}>{routes}</HashRouter>,
    root,
);
