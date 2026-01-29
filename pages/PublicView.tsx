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

  // ---------------------------------------------------------------------------
  // [J's Architecture Note]
  // 📌 NEXT.JS IMPLEMENTATION (The Showroom)
  //
  // ใน Code React ปกติ (Client-side) เราใช้ useEffect ดึงข้อมูล
  // แต่สำหรับ SEO เราต้องใช้ "Server-Side Rendering (SSR)" หรือ "Static Site Generation (SSG)"
  //
  // ถ้าพี่อุ๊กใช้ Next.js โค้ดส่วนนี้จะเปลี่ยนเป็น:
  //
  // export async function generateStaticParams() {
  //    // ดึง list คู่สินค้าทั้งหมดเพื่อสร้างหน้า HTML รอไว้เลย (2,450 หน้า)
  //    const comparisons = await supabase.from('comparisons').select('id');
  //    return comparisons.map((c) => ({ slug: c.id }));
  // }
  //
  // export default async function Page({ params }) {
  //    // ดึงข้อมูลมาโชว์ โดย Google Bot จะเห็น HTML เต็มๆ ทันที ไม่ต้องรอ Loading
  //    const data = await getData(params.slug);
  //    return <PublicView data={data} />
  // }
  // ---------------------------------------------------------------------------

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
               ? 'bg-slate-800 text-white border-slate-800' 
               : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
             }`}
           >
             {c.id}
           </button>
        ))}
      </div>

      {/* Actual SEO Page Template */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl max-w-5xl mx-auto w-full">
        
        {/* SEO Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium mb-4 text-blue-200 border border-white/10">
             <span>Updated {new Date(selectedComparison.generatedAt).toLocaleDateString()}</span>
             <span>•</span>
             <span>Review by AI Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">{selectedComparison.title}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">{selectedComparison.intro}</p>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          
          {/* Main Versus Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
             {/* Product A */}
             <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center relative hover:shadow-lg transition-shadow bg-slate-50/50">
               {selectedComparison.winnerId === productA.id && (
                 <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                   <Trophy size={14} className="mr-1" /> WINNER
                 </div>
               )}
               <img src={productA.imageUrl} className="h-48 object-contain mb-6 mix-blend-multiply" alt={productA.name} />
               <h3 className="text-2xl font-bold text-slate-800 mb-2">{productA.name}</h3>
               <div className="text-3xl font-black text-blue-600 mb-6">${productA.price}</div>
               
               <div className="w-full space-y-2 mb-6 text-left">
                 {selectedComparison.prosA.slice(0, 3).map((pro, i) => (
                   <div key={i} className="flex items-start text-sm text-slate-600">
                     <Check size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                     {pro}
                   </div>
                 ))}
               </div>

               <a href={productA.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center">
                 Check Price
                 <ArrowRight size={16} className="ml-2" />
               </a>
             </div>

             {/* Product B */}
             <div className="border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center relative hover:shadow-lg transition-shadow bg-slate-50/50">
               {selectedComparison.winnerId === productB.id && (
                 <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                   <Trophy size={14} className="mr-1" /> WINNER
                 </div>
               )}
               <img src={productB.imageUrl} className="h-48 object-contain mb-6 mix-blend-multiply" alt={productB.name} />
               <h3 className="text-2xl font-bold text-slate-800 mb-2">{productB.name}</h3>
               <div className="text-3xl font-black text-red-600 mb-6">${productB.price}</div>
               
               <div className="w-full space-y-2 mb-6 text-left">
                 {selectedComparison.prosB.slice(0, 3).map((pro, i) => (
                   <div key={i} className="flex items-start text-sm text-slate-600">
                     <Check size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                     {pro}
                   </div>
                 ))}
               </div>

               <a href={productB.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center">
                 Check Price
                 <ArrowRight size={16} className="ml-2" />
               </a>
             </div>
          </div>

          {/* Quick Verdict */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center">
              <Star className="text-blue-500 mr-2" fill="currentColor" /> 
              Our Verdict
            </h3>
            <p className="text-blue-800 leading-relaxed text-lg">
              {selectedComparison.verdict}
            </p>
          </div>

          {/* Comparison Table */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Detailed Specs Comparison</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                    <th className="p-4 border-b border-slate-200 w-1/4">Feature</th>
                    <th className="p-4 border-b border-slate-200 w-1/3 text-blue-700">{productA.name}</th>
                    <th className="p-4 border-b border-slate-200 w-1/3 text-red-700">{productB.name}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm md:text-base">
                  {selectedComparison.specComparison.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{row.feature}</td>
                      <td className={`p-4 ${row.winner === 'A' ? 'font-bold text-slate-900 bg-blue-50/50' : 'text-slate-600'}`}>
                        {row.valueA} {row.winner === 'A' && <Check size={14} className="inline text-green-500 ml-1" />}
                      </td>
                      <td className={`p-4 ${row.winner === 'B' ? 'font-bold text-slate-900 bg-red-50/50' : 'text-slate-600'}`}>
                        {row.valueB} {row.winner === 'B' && <Check size={14} className="inline text-green-500 ml-1" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visualization (Chart) */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Score Analysis</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 10]} hide />
                  <YAxis type="category" dataKey="name" width={150} tick={{fill: '#475569', fontSize: 14}} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicView;
