import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'منصة مكتبي الرقمية للمحاماة',
  description: 'النظام الذكي لإدارة القضايا والموكلين',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}