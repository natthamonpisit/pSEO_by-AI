import React, { useState } from 'react';
import { LayoutDashboard, ShoppingBag, Zap, Globe, Menu, X, Box } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentPage === page
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-full shadow-xl z-20">
        <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Box size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CompareX</h1>
            <p className="text-xs text-slate-500">pSEO Engine v1.0</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-4">Back Office</div>
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem page="products" icon={ShoppingBag} label="Product DB" />
          <NavItem page="generator" icon={Zap} label="AI Generator" />
          
          <div className="mt-8 mb-2 px-4 border-t border-slate-800 pt-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Front Office</div>
          </div>
          <NavItem page="public_view" icon={Globe} label="Public Site Preview" />
        </nav>
        
        <div className="p-4 bg-slate-950 text-xs text-slate-500 text-center">
          Built with React & Gemini
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-30 flex justify-between items-center p-4 shadow-md">
        <div className="flex items-center space-x-2">
           <Box size={24} className="text-blue-500" />
           <span className="font-bold">CompareX</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900 z-20 pt-20 px-4 space-y-2">
          <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem page="products" icon={ShoppingBag} label="Product DB" />
          <NavItem page="generator" icon={Zap} label="AI Generator" />
          <NavItem page="public_view" icon={Globe} label="Public Site Preview" />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full relative">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
