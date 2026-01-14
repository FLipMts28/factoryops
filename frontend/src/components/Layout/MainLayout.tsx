// frontend/src/components/Layout/MainLayout.tsx
import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { useTheme } from '../../context/ThemeContext';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-transparent' // O background vem do CSS no html.dark
          : 'bg-transparent' // O background vem do CSS no html.light
      }`}
    >
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;