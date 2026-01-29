import { useEffect, useState } from 'react';
import { RefreshCw, Search, ArrowUpRight } from 'lucide-react';

interface TrendItem {
    id: string;
    productName: string;
    category: string;
    newsHeadline: string;
    status: string;
}

export default function TrendMonitor() {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState("Technology");

    const fetchTrends = async () => {
        setLoading(true);
        try {
            // In dev mode, using proxy or full URL
            const res = await fetch(`http://127.0.0.1:8000/api/hunter/trends?category=${category}`);
            const data = await res.json();
            setTrends(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrends();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        🦅 Hunter: Real-time Trends
                    </h2>
                    <p className="text-xs text-slate-500">Watching RSS Feeds & Search Signals</p>
                </div>
                <button
                    onClick={fetchTrends}
                    disabled={loading}
                    className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Filter / Search Bar could go here */}

            <div className="space-y-3">
                {trends.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-400 text-sm">No trends found yet.</div>
                )}

                {trends.map((trend) => (
                    <div key={trend.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all group">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-700 mb-2">
                                    {trend.category}
                                </span>
                                <h3 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {trend.productName}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{trend.newsHeadline}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.status === 'NEW' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {trend.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
