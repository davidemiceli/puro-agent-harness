import { Suspense } from 'solid-js';
import { BootstrapProvider } from '@/src/contexts/bootstrapContext';
import { NotificationProvider } from '@/src/contexts/notificationContext';
import LoadingGlobal from '@/src/components/LoadingGlobal';
import Header from '@/src/components/Header/Header';


export default function App(props) {
    return <BootstrapProvider>
        <main class='font-mono font-firamono text-gray-900'>
            <NotificationProvider>
                <Suspense fallback={<LoadingGlobal />}>
                    <div class="flex flex-col h-screen min-w-7xl overflow-hidden">
                        <Header />
                        {props.children}
                    </div>
                </Suspense>
            </NotificationProvider>
        </main>
    </BootstrapProvider>;
};
