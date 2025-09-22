export const metadata = {
    title: 'AI Mindmap',
    description: 'AI協働型マインドマップ'
};

import 'reactflow/dist/style.css';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ja">
            <body>{children}</body>
        </html>
    );
}
