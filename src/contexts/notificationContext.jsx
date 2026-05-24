import { createContext, useContext, createSignal } from 'solid-js';
import { NotificationUI } from '@/src/components/Notification';

const NotificationContext = createContext();

export function NotificationProvider(props) {
    const [notification, setNotification] = createSignal(null);

    const notify = (message, type = 'success', position = { x: 'right', y: 'top' }) => {
        setNotification({ message, type, position });
        setTimeout(() => setNotification(null), 4000);
    };

    return <NotificationContext.Provider value={{ notify }}>
        {props.children}
        <NotificationUI data={notification()} />
    </NotificationContext.Provider>;
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}