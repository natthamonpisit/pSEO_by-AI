import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Zap, CheckCircle, Smartphone } from 'lucide-react';
import { API_URL } from '../config';

interface ComparisonSummary {
    id: number;
    title: string;
    product_a_id: string;
    product_b_id: string;
    score_a: number;
    score_b: number;
    verdict: string;
    winner: string; // From UI fix earlier, logic might vary, check backend response
    created_at: string;
}

export default function LandingPage() {
    const [comparisons, setComparisons] = useState<ComparisonSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch(`${API_URL}/api/comparisons?limit=9`);
                if (res.ok) {
                    const data = await res.json();
                    setComparisons(data);
                }
            } catch (error) {
                console.error("Failed to fetch comparisons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRecent();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, basic search just redirects to a mock search or we could filter locally if we had all data.
        // Let's make it look real but maybe just do nothing or show a toast for v1.
        console.log("Searching for:", searchQuery);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                            C
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            CompareX
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/admin" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                            Admin Login
                        </Link>
                        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-indigo-200">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-20">
                {/* Hero Section */}
                <section className="max-w-7xl mx-auto px-6 mb-20">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                            <Zap size={14} className="fill-indigo-700" />
                            AI-Powered Tech Reviews
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                            Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Best Tech</span> <br className="hidden md:block" />
                            Without the Hype.
                        </h1>
                        <p className="text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Stop reading endless reviews. Our AI agents browse thousands of specs, prices, and user feedback to give you the honest verdict in seconds.
                        </p>

                        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-12 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-slate-100">
                                <Search className="text-slate-400 ml-4 hidden sm:block" />
                                <input
                                    type="text"
                                    placeholder="Compare iPhone 15 Pro vs Galaxy S24..."
                                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 px-4 py-3"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                                    Analyze <ArrowRight size={18} />
                                </button>
                            </div>
                        </form>

                        <div className="flex items-center justify-center gap-8 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Unbiased AI Analysis</span>
                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Data-Driven Scores</span>
                            <span className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Daily Updates</span>
                        </div>
                    </div>
                </section>

                {/* Latest Comparisons */}
                <section className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Smartphone className="text-indigo-600" />
                            Latest Showdowns
                        </h2>
                        <Link to="#" className="text-indigo-600 font-medium hover:underline text-sm">View All</Link>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {comparisons.map((comp) => (
                                <Link
                                    key={comp.id}
                                    to={`/compare/${comp.product_a_id}`}
                                    className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="mb-4">
                                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Verdict Ready</div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {comp.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1">
                                        {comp.verdict}
                                    </p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">A</div>
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">B</div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">Vs Mode</span>
                                        </div>
                                        <div className="text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                                            Read Review →
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-400 text-sm">© 2026 CompareX AI. All rights reserved.</p>
                    <div className="flex gap-6 text-slate-500">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
