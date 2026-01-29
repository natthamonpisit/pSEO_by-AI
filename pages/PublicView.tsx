import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Product, ComparisonResult } from '../types';
import { Trophy, Check, X, Star, ExternalLink, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PublicView: React.FC = () => {
  // Simulating URL Params /compare/[slug]
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonResult | null>(null);
  const [productA, setProductA] = useState<Product | null>(null);
  const [productB, setProductB] = useState<Product | null>(null);

  useEffect(() => {
    const all = dataService.getComparisons();
    setComparisons(all);
    if (all.length > 0) {
      loadComparison(all[0]);
    }
  }, []);

  const loadComparison = (comp: ComparisonResult) => {
    setSelectedComparison(comp);
    setProductA(dataService.getProductById(comp.productAId) || null);
    setProductB(dataService.getProductById(comp.productBId) || null);
  };

  if (comparisons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-10">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
           <Trophy size={48} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">No Pages Generated Yet</h2>
        <p className="text-slate-500 mt-2">Go to the 'AI Generator' tab to build your SEO pages.</p>
      </div>
    );
  }

  if (!selectedComparison || !productA || !productB) return <div>Loading...</div>;

  const chartData = [
    { name: productA.name, score: selectedComparison.scoreA, fill: '#3b82f6' },
    { name: productB.name, score: selectedComparison.scoreB, fill: '#ef4444' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Top Bar: Page Selector (Simulating Google Search Results Click) */}
      <div className="bg-white border-b border-slate-200 p-4 mb-6 flex items-center space-x-4 flex-shrink-0 overflow-x-auto whitespace-nowrap">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulate Page View:</span>
        {comparisons.map(c => (
           <button 
             key={c.id}
             onClick={() => loadComparison(c)}
             className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
               selectedComparison.id === c.id 
               ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
               : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
             }`}
           >
             {c.id}
           </button>
        ))}
      </div>

      {/* Actual SEO Page Template */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl max-w-5xl mx-auto w-full">
        
        {/* SEO Header: Apple Style */}
        <div className="bg-black text-white p-12 md:p-20 text-center relative overflow-hidden">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl bg-blue-900/20 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-8 text-slate-300 border border-white/10">
               <span>CompareX Analysis</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              {selectedComparison.title}
            </h1>
            
            <p className="text-slate-300 max-w-3xl mx-auto text-xl md:text-3xl leading-snug font-light tracking-tight">
              "{selectedComparison.intro}"
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-16">
          
          {/* Main Versus Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
             {/* Product A */}
             <div className="group border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center relative hover:shadow-2xl transition-all duration-300 bg-white hover:border-blue-200">
               {selectedComparison.winnerId === productA.id && (
                 <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg transform group-hover:scale-105 transition-transform">
                   <Trophy size={14} className="mr-1" /> WINNER
                 </div>
               )}
               <div className="h-56 flex items-center justify-center mb-8">
                  <img src={productA.imageUrl} className="max-h-full object-contain mix-blend-multiply transform group-hover:scale-110 transition-transform duration-500" alt={productA.name} />
               </div>
               <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{productA.name}</h3>
               <div className="text-2xl font-medium text-slate-500 mb-8">${productA.price}</div>
               
               <div className="w-full space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl">
                 {selectedComparison.prosA.slice(0, 3).map((pro, i) => (
                   <div key={i} className="flex items-start text-sm text-slate-700 font-medium">
                     <Check size={18} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                     {pro}
                   </div>
                 ))}
               </div>

               <a href={productA.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center shadow-lg hover:shadow-blue-200">
                 Buy Now
                 <ArrowRight size={20} className="ml-2" />
               </a>
             </div>

             {/* Product B */}
             <div className="group border border-slate-200 rounded-3xl p-8 flex flex-col items-center text-center relative hover:shadow-2xl transition-all duration-300 bg-white hover:border-red-200">
               {selectedComparison.winnerId === productB.id && (
                 <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg transform group-hover:scale-105 transition-transform">
                   <Trophy size={14} className="mr-1" /> WINNER
                 </div>
               )}
               <div className="h-56 flex items-center justify-center mb-8">
                 <img src={productB.imageUrl} className="max-h-full object-contain mix-blend-multiply transform group-hover:scale-110 transition-transform duration-500" alt={productB.name} />
               </div>
               <h3 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{productB.name}</h3>
               <div className="text-2xl font-medium text-slate-500 mb-8">${productB.price}</div>
               
               <div className="w-full space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl">
                 {selectedComparison.prosB.slice(0, 3).map((pro, i) => (
                   <div key={i} className="flex items-start text-sm text-slate-700 font-medium">
                     <Check size={18} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                     {pro}
                   </div>
                 ))}
               </div>

               <a href={productB.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center shadow-lg hover:shadow-slate-300">
                 Buy Now
                 <ArrowRight size={20} className="ml-2" />
               </a>
             </div>
          </div>

          {/* Quick Verdict */}
          <div className="bg-slate-50 rounded-3xl p-10 text-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              The Verdict
            </h3>
            <p className="text-2xl md:text-3xl font-semibold text-slate-800 leading-relaxed max-w-4xl mx-auto">
              "{selectedComparison.verdict}"
            </p>
          </div>

          {/* Visualization (Chart) & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Performance Score</h3>
                <div className="h-64 w-full bg-white rounded-2xl border border-slate-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis type="category" dataKey="name" width={120} tick={{fill: '#475569', fontSize: 14, fontWeight: 600}} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={48}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
             <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Why Trust Us?</h3>
                <div className="prose text-slate-600">
                   <p className="mb-4">
                     Our AI engine analyzes thousands of data points, from technical specifications to real-world user reviews, to bring you an unbiased comparison.
                   </p>
                   <p>
                     We focus on <strong>Value for Money</strong> and <strong>Real-world Usability</strong>, not just who has the highest numbers on a spec sheet.
                   </p>
                </div>
             </div>
          </div>

          {/* Comparison Table */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Technical Deep Dive</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest font-bold">
                    <th className="p-5 border-b border-slate-200 w-1/4">Feature</th>
                    <th className="p-5 border-b border-slate-200 w-1/3 text-blue-700">{productA.name}</th>
                    <th className="p-5 border-b border-slate-200 w-1/3 text-red-700">{productB.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm md:text-base">
                  {selectedComparison.specComparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 font-semibold text-slate-700">{row.feature}</td>
                      <td className={`p-5 transition-colors ${row.winner === 'A' ? 'font-bold text-slate-900 bg-blue-50/30' : 'text-slate-600'}`}>
                        {row.valueA} {row.winner === 'A' && <Check size={16} className="inline text-green-500 ml-2" />}
                      </td>
                      <td className={`p-5 transition-colors ${row.winner === 'B' ? 'font-bold text-slate-900 bg-red-50/30' : 'text-slate-600'}`}>
                        {row.valueB} {row.winner === 'B' && <Check size={16} className="inline text-green-500 ml-2" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicView;