import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute('/')({
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token');
        if (token)
            throw redirect({ to: '/overview' });
        throw redirect({ to: '/login' })

    },
})