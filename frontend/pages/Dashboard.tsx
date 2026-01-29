
import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { SystemLog } from '../types';
import { ArrowUpRight, Database, FileText, Layers, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    products: 0,
    generated: 0,
    potential: 0
  });
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    // Load Stats
    const products = dataService.getProducts();
    const comparisons = dataService.getComparisons();
    const potential = dataService.getPotentialCombinationsCount();

    setStats({
      products: products.length,
      generated: comparisons.length,
      potential: potential
    });

    // Load Logs (Observability)
    setLogs(dataService.getLogs());
  }, []);

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        <p className="text-xs text-slate-400 mt-2">{sub}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  );

  const LogItem = ({ log }: { log: SystemLog }) => {
    const getIcon = () => {
        switch(log.level) {
            case 'SUCCESS': return <CheckCircle size={14} className="text-green-500" />;
            case 'ERROR': return <AlertTriangle size={14} className="text-red-500" />;
            case 'WARNING': return <AlertTriangle size={14} className="text-yellow-500" />;
            default: return <Info size={14} className="text-blue-500" />;
        }
    };
    return (
        <div className="flex items-start space-x-3 text-sm py-2 border-b border-slate-50 last:border-0">
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1">
                <div className="flex justify-between">
                    <span className={`font-bold text-xs px-1.5 rounded ${
                        log.agent === 'SYSTEM' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                        {log.agent}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                </div>
                <p className="text-slate-700 mt-0.5">{log.message}</p>
                {log.details && <p className="text-xs text-slate-400 mt-1 pl-2 border-l-2 border-slate-200">{log.details}</p>}
            </div>
        </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-slate-500">Welcome back, P'Ook. Here is your SEO factory status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Products" 
          value={stats.products} 
          sub="Items in Supabase"
          icon={Database} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Potential Pages (pSEO)" 
          value={stats.potential} 
          sub="Combinations (N * (N-1) / 2)"
          icon={Layers} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Generated Pages" 
          value={stats.generated} 
          sub="Indexed Content"
          icon={FileText} 
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="flex gap-4">
            <button className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors">
                Add New Product
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition-colors">
                Run Batch Generator
                <ArrowUpRight size={16} className="ml-2" />
            </button>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-900 text-white rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Architecture Tip: Clean Code</h3>
                <p className="text-indigo-200 text-sm">
                    "We just implemented the <strong>Repository Pattern</strong>. This decouples our business logic from LocalStorage, making it 100% ready for Supabase migration."
                </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-5 translate-y-5">
                <Layers size={100} />
                </div>
            </div>
        </div>

        {/* Observability Panel (System Logs) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Activity size={18} className="mr-2 text-slate-400" />
                    System Logs
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Live</span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-1">
                {logs.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No activity recorded yet.</p>}
                {logs.map((log) => <LogItem key={log.id} log={log} />)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
