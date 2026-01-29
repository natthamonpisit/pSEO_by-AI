import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Check, Award, BarChart3, Star, Clock, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';
import SEO from '../components/SEO';

// Flexible interface to handle both Old and New schema
interface ComparisonData {
    title: string;
    intro: string;
    verdict: string;

    // New Schema
    score_a?: number;
    score_b?: number;
    winner_id?: string | null;
    pros_a?: string[];
    cons_a?: string[];
    pros_b?: string[];
    cons_b?: string[];
    spec_comparison?: any; // Can be Array or Object

    // Legacy Schema
    score_p1?: number;
    score_p2?: number;
    winner?: string;
    pros_cons_p1?: { pros: string[], cons: string[] };
    pros_cons_p2?: { pros: string[], cons: string[] };

    // Product Details from Join
    product_a_data?: { name?: string, image_url?: string };
    product_b_data?: { name?: string, image_url?: string };

    // Summaries
    summary_a?: string;
    summary_b?: string;
    summaryA?: string; // fallback
    summaryB?: string; // fallback

    [key: string]: any;
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
                console.log("Fetched Data:", json); // Debugging
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

    // --- Normalization Logic ---
    const scoreA = data.score_a ?? data.score_p1 ?? 0;
    const scoreB = data.score_b ?? data.score_p2 ?? 0;
    const winnerScore = Math.max(scoreA, scoreB);

    const prosA = data.pros_a ?? data.pros_cons_p1?.pros ?? [];
    const consA = data.cons_a ?? data.pros_cons_p1?.cons ?? [];
    const prosB = data.pros_b ?? data.pros_cons_p2?.pros ?? [];
    const consB = data.cons_b ?? data.pros_cons_p2?.cons ?? [];

    const winnerName = data.winner_id ? (data.winner_id === data.product_a_id ? "Product A" : "Product B") : (data.winner ?? "The Winner");
    const winnerId = data.winner_id || (data.winner === 'A' ? data.product_a_id : data.product_b_id);
    const winnerImage = winnerId === data.product_a_id ? data.product_a_data?.image_url : data.product_b_data?.image_url;

    // Normalize Specs: Convert legacy Object to Array
    const specs = Array.isArray(data.spec_comparison)
        ? data.spec_comparison
        : Object.entries(data.spec_comparison || {}).map(([key, val]: [string, any]) => ({
            field: key,
            valueA: val.p1 || "No data",
            valueB: val.p2 || "No data",
            winner: val.winner || "-"
        }));

    // SEO Data
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

                    {/* VS Images */}
                    <div className="flex items-center justify-center gap-8 my-8">
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-center">
                            {data.product_a_data?.image_url ? (
                                <img src={data.product_a_data.image_url} alt="Product A" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-200">A</span>
                            )}
                        </div>
                        <div className="text-2xl font-black text-slate-300 italic">VS</div>
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-center">
                            {data.product_b_data?.image_url ? (
                                <img src={data.product_b_data.image_url} alt="Product B" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <span className="text-4xl font-bold text-slate-200">B</span>
                            )}
                        </div>
                    </div>

                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {data.intro}
                    </p>
                </div>

                {/* Winner Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-xl mb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {winnerImage && (
                            <div className="w-40 h-40 bg-white rounded-xl p-2 shadow-lg shrink-0 rotate-3">
                                <img src={winnerImage} alt="Winner" className="w-full h-full object-contain rounded-lg" />
                            </div>
                        )}
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-4 uppercase tracking-wider backdrop-blur-sm">
                                <Award size={14} /> The Verdict
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Winner: {winnerName}</h2>
                            <p className="text-indigo-100 leading-relaxed">
                                {data.verdict}
                            </p>
                        </div>
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
                                {specs.map((item: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{item.field}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.valueA}</td>
                                        <td className="px-6 py-4 text-slate-600">{item.valueB}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700">
                                                {(item.winner === 'A' || item.winner === 'Product A') && <Check size={12} />}
                                                {(item.winner === 'B' || item.winner === 'Product B') && <Check size={12} />}
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
                                {prosA.length > 0 ? (
                                    <ul className="space-y-2">
                                        {prosA.map((item: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No data available</p>
                                )}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-500 uppercase mb-2 mt-4">Cons</h4>
                                {consA.length > 0 ? (
                                    <ul className="space-y-2">
                                        {consA.map((item: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <span className="text-rose-500 shrink-0 font-bold text-xs mt-0.5">✕</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No data available</p>
                                )}
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
                                {prosB.length > 0 ? (
                                    <ul className="space-y-2">
                                        {prosB.map((item: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No data available</p>
                                )}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-500 uppercase mb-2 mt-4">Cons</h4>
                                {consB.length > 0 ? (
                                    <ul className="space-y-2">
                                        {consB.map((item: string, i: number) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <span className="text-rose-500 shrink-0 font-bold text-xs mt-0.5">✕</span> {item}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">No data available</p>
                                )}
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
