import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Check, Award, BarChart3, Star, Clock } from 'lucide-react';
import { API_URL } from '../config';
import SEO from '../components/SEO';

interface ComparisonData {
    title: string;
    intro: string;
    verdict: string;
    score_a: number;
    score_b: number;
    winner_id: string | null;
    pros_a: string[];
    cons_a: string[];
    pros_b: string[];
    cons_b: string[];
    spec_comparison: Array<{ field: string, valueA: string, valueB: string, winner: string }>;
    faqs: Array<{ question: string, answer: string }>;
}

export default function ComparisonPage() {
    const { id } = useParams();
    const [data, setData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/api/comparisons/${id}`);
                if (!res.ok) throw new Error('Comparison not found');
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading comparison...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
    if (!data) return null;

    // --- SEO & Schema Generation ---
    const winnerScore = data.score_a > data.score_b ? data.score_a : data.score_b;
    // Basic Product Schema for the "Main Entity" (The Comparison or the Winner)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.title,
        "description": data.intro,
        "review": {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": String(winnerScore),
                "bestRating": "100"
            },
            "author": { "@type": "Organization", "name": "CompareX AI" },
            "reviewBody": data.verdict
        }
    };

    // Helper for check marks in specs
    const isWinner = (val: string, winner: string) => {
        if (!winner) return false;
        // Simple logic: if winner is "A" and val is valueA (implied by column)
        // But here we rely on the row's 'winner' field: "A", "B", or "Tie"
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <SEO
                title={data.title}
                description={data.intro.slice(0, 160) + '...'}
                schema={jsonLd}
            />

            {/* Header / Nav */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/admin" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">Back to Admin</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wider">
                            Verified by AI
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 mt-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        {data.title}
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {data.intro}
                    </p>
                </div>

                {/* Winner Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 uppercase tracking-wider backdrop-blur-sm">
                            <Award size={14} /> The Verdict
                        </div>
                        {/* Note: We don't have explicit winner NAME in top-level data, only winner_id. 
                            Ideally we'd fetch product names or store them. For now, infer from context or leave generic?
                            Actually, title usually says "A vs B", so we can guess. 
                            Let's just show the verdict text which usually names the winner. */}
                        <h2 className="text-3xl font-bold mb-4">Winner Revealed</h2>
                        <p className="text-indigo-100 leading-relaxed max-w-2xl mx-auto">
                            {data.verdict}
                        </p>
                    </div>
                </div>

                {/* Specs Comparison Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <BarChart3 className="text-indigo-600" />
                        <h3 className="text-xl font-bold text-slate-800">Technical Showdown</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Feature</th>
                                    <th className="px-6 py-4 text-indigo-700">Product A</th>
                                    <th className="px-6 py-4 text-slate-700">Product B</th>
                                    <th className="px-6 py-4 text-emerald-600 text-right">Better Choice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.spec_comparison && data.spec_comparison.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{item.field}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.valueA}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.valueB}</td>
                                        <td className="px-6 py-4 text-right">
                                            {/* Show check if winner matches. 
                                                The backend prompt now asks for "A" or "B" or "Tie". 
                                                We display the text, and maybe an icon if it's clear. 
                                            */}
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                                                {item.winner === 'A' && <Check size={12} />}
                                                {item.winner === 'B' && <Check size={12} />}
                                                {item.winner}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pros & Cons Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* Product 1 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">1</span>
                            Product A Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Pros</h4>
                                <ul className="space-y-2">
                                    {data.pros_a?.map((item, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-500 uppercase mb-2 mt-4">Cons</h4>
                                <ul className="space-y-2">
                                    {data.cons_a?.map((item, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="text-rose-500 shrink-0 font-bold text-xs mt-0.5">✕</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Product 2 */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs">2</span>
                            Product B Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Pros</h4>
                                <ul className="space-y-2">
                                    {data.pros_b?.map((item, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-500 uppercase mb-2 mt-4">Cons</h4>
                                <ul className="space-y-2">
                                    {data.cons_b?.map((item, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <span className="text-rose-500 shrink-0 font-bold text-xs mt-0.5">✕</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="max-w-4xl mx-auto px-6 text-center pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-400">
                    Generated by CompareX AI Engine • Data updated {new Date().toLocaleDateString()}
                </p>
            </footer>
        </div>
    );
}
