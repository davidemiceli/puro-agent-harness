import { Navigate } from '@solidjs/router';
import { createComponent, lazy } from 'solid-js';
import Settings from '@/src/features/settings/Settings';
import Workspace from '@/src/features/workspace/Workspace';
import Session from '@/src/features/session/Session';
import Agent from '@/src/features/agent/Agent';
import Prompt from '@/src/features/prompt/Prompt';
import Chat from '@/src/features/chat/Chat';


export const routes = [
    {
        path: '/',
        component: () => createComponent(Navigate, { href: '/workspace' })
    },
    { path: '/settings', component: Settings },
    { path: '/workspace', component: Workspace },
    { path: '/session', component: Session },
    { path: '/agent', component: Agent },
    { path: '/prompt', component: Prompt },
    { path: '/chat', component: Chat },
    // { path: '/about', component: About },
    {
        path: '**',
        component: lazy(() => import('@/src/errors/404')),
    },
];
