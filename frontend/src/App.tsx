import { useState } from 'react';
import { LayoutDashboard, Package, TrendingUp, Settings, Bell, Search, HelpCircle } from 'lucide-react';
import TrendMonitor from './components/TrendMonitor';
import ProductManager from './components/ProductManager';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        CompareX
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">AI pSEO Engine v1.0</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Package size={20} />} label="Products" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                    <NavItem icon={<TrendingUp size={20} />} label="Trends" active={activeTab === 'trends'} onClick={() => setActiveTab('trends')} />
                    <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            M
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">Metafist</p>
                            <p className="text-xs text-slate-400">Admin</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-slate-800 capitalize">{activeTab}</h2>
                    <div className="flex items-center gap-4 text-slate-400">
                        <button className="hover:text-slate-600 transition-colors"><Search size={20} /></button>
                        <button className="hover:text-slate-600 transition-colors"><Bell size={20} /></button>
                        <button className="hover:text-slate-600 transition-colors"><HelpCircle size={20} /></button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="p-8 flex-1 overflow-auto">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                            {/* Left Column: Trends (Real-time Feed) */}
                            <div className="lg:col-span-4 h-full">
                                <TrendMonitor />
                            </div>

                            {/* Right Column: Products (Verified DB) */}
                            <div className="lg:col-span-8 h-full">
                                <ProductManager />
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && <ProductManager />}

                    {activeTab === 'trends' && <TrendMonitor />}

                    {activeTab === 'settings' && (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Settings coming soon...
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

export default App;
