import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { Product, ComparisonResult } from '../types';
import { Trophy, Check, X, Star, ExternalLink, ArrowRight, Info, Search, HelpCircle, Code, Share2, ImageIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const PublicView: React.FC = () => {
  // Simulating URL Params /compare/[slug]
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonResult | null>(null);
  const [productA, setProductA] = useState<Product | null>(null);
  const [productB, setProductB] = useState<Product | null>(null);
  const [showSourceCode, setShowSourceCode] = useState(false); // For learning purpose

  /**
   * 🔄 Init: Load all available comparisons to simulate a site map navigation.
   */
  useEffect(() => {
    const all = dataService.getComparisons();
    setComparisons(all);
    if (all.length > 0) {
      loadComparison(all[0]);
    }
  }, []);

  /**
   * 👆 Action: Load a specific comparison page.
   * Fetches the full product details (Price, Image) based on ID stored in the comparison result.
   */
  const loadComparison = (comp: ComparisonResult) => {
    setSelectedComparison(comp);
    setProductA(dataService.getProductById(comp.productAId) || null);
    setProductB(dataService.getProductById(comp.productBId) || null);
    setShowSourceCode(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    if (currency === 'THB' || currency === '฿') return `฿${amount.toLocaleString()}`;
    return `$${amount.toLocaleString()}`;
  };

  /**
   * 🤖 GEO SECRET: JSON-LD Generator
   * 
   * This function creates the "Machine Language" (Structured Data) for Google/AI to read.
   * It tells Google: "This is a Product Comparison page", "Here are the FAQs".
   * 
   * @returns JSON string of Schema.org data
   */
  const generateStructuredData = () => {
    if (!selectedComparison || !productA || !productB) return '';

    // Schema.org Product
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": selectedComparison.title,
      "description": selectedComparison.intro,
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "9",
          "bestRating": "10"
        },
        "author": {
          "@type": "Organization",
          "name": "CompareX AI"
        }
      },
      "mainEntity": [
        {
           "@type": "Product",
           "name": productA.name,
           "image": productA.imageUrl,
           "offers": {
              "@type": "Offer",
              "price": productA.price,
              "priceCurrency": productA.currency
           }
        },
        {
           "@type": "Product",
           "name": productB.name,
           "image": productB.imageUrl,
           "offers": {
              "@type": "Offer",
              "price": productB.price,
              "priceCurrency": productB.currency
           }
        }
      ],
      "mainEntityOfPage": {
        "@type": "FAQPage",
        "mainEntity": (selectedComparison.faqs || []).map(faq => ({
           "@type": "Question",
           "name": faq.question,
           "acceptedAnswer": {
             "@type": "Answer",
             "text": faq.answer
           }
        }))
      }
    };
    return JSON.stringify(schema, null, 2);
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
      <div className="bg-white border-b border-slate-200 p-4 mb-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4 overflow-x-auto whitespace-nowrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Simulate Page View:</span>
            {comparisons.map(c => (
            <button 
                key={c.id}
                onClick={() => loadComparison(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center space-x-2 ${
                selectedComparison.id === c.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                : 'bg-white text-slate-600 border-slate-300 hover:border-slate-500'
                }`}
            >
                {c.language === 'TH' ? <span>🇹🇭</span> : <span>🌍</span>}
                <span>{c.id}</span>
            </button>
            ))}
        </div>
        <button 
            onClick={() => setShowSourceCode(!showSourceCode)}
            className={`flex items-center text-xs font-bold px-3 py-1.5 rounded border ${showSourceCode ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-500 hover:bg-slate-50 border-slate-200'}`}
        >
            <Code size={14} className="mr-2" />
            {showSourceCode ? 'Hide Source' : 'View SEO Code'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-slate-200 shadow-xl max-w-5xl mx-auto w-full relative">
        
        {/* 💻 TECH TIP: Source Code Viewer Overlay */}
        {showSourceCode && (
            <div className="absolute inset-0 z-50 bg-slate-900/95 p-8 text-green-400 font-mono text-xs overflow-auto">
               <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <Code className="mr-2" /> How AI/Google sees this page (JSON-LD)
               </h3>
               <p className="text-slate-400 mb-4">
                  This "Structured Data" tells robots exactly what products are being compared, their prices, and the FAQs. 
                  This is how you get Rich Snippets and AI Answers.
               </p>
               <pre className="bg-black p-4 rounded-xl border border-slate-700 whitespace-pre-wrap">
                  {`<script type="application/ld+json">`}
                  {generateStructuredData()}
                  {`</script>`}
               </pre>
               <button 
                 onClick={() => setShowSourceCode(false)}
                 className="absolute top-4 right-4 text-white hover:text-red-400"
               >
                 <X size={24} />
               </button>
            </div>
        )}

        {/* 🖼️ UNIQUE IMAGE STRATEGY: Dynamic Social Card */}
        <div className="bg-slate-100 border-b border-slate-200 p-6">
           <div className="flex justify-between items-center mb-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <ImageIcon size={14} className="mr-1" /> 
                Unique Image Generator (The Anti-Spam Strategy)
              </div>
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 font-bold">
                 Google Safe ✅
              </span>
           </div>
           
           {/* This is the card we would generate as a .png using 'vercel/og' or 'sharp' */}
           <div className="relative w-full max-w-2xl mx-auto aspect-video bg-gradient-to-br from-slate-900 to-blue-900 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-8 border-4 border-slate-800">
               {/* Background Pattern */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
               
               <div className="relative z-10 flex items-center justify-between w-full">
                  {/* Product A */}
                  <div className="flex flex-col items-center w-1/3">
                     <div className="w-32 h-32 bg-white rounded-full p-4 flex items-center justify-center shadow-lg mb-4">
                        <img src={productA.imageUrl} className="max-w-full max-h-full object-contain" />
                     </div>
                     <h3 className="text-white font-bold text-lg text-center leading-tight">{productA.name}</h3>
                     <span className="mt-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-bold">{selectedComparison.scoreA}/10</span>
                  </div>

                  {/* VS Badge */}
                  <div className="flex flex-col items-center justify-center w-1/3">
                     <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 italic drop-shadow-lg">
                        VS
                     </div>
                     <div className="mt-2 text-slate-400 text-xs font-mono uppercase tracking-widest text-center">
                        CompareX Analysis
                     </div>
                  </div>

                  {/* Product B */}
                  <div className="flex flex-col items-center w-1/3">
                     <div className="w-32 h-32 bg-white rounded-full p-4 flex items-center justify-center shadow-lg mb-4">
                        <img src={productB.imageUrl} className="max-w-full max-h-full object-contain" />
                     </div>
                     <h3 className="text-white font-bold text-lg text-center leading-tight">{productB.name}</h3>
                     <span className="mt-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">{selectedComparison.scoreB}/10</span>
                  </div>
               </div>
           </div>
           <p className="text-center text-xs text-slate-500 mt-2">
             *In Production: This layout is converted into a physical PNG file (og-image.png) for every page.
           </p>
        </div>

        {/* SEO Header */}
        <div className="bg-black text-white p-12 md:p-20 text-center relative overflow-hidden">
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
               {/* 💰 Currency Logic */}
               <div className="text-2xl font-medium text-slate-500 mb-8">
                 {formatCurrency(productA.price, selectedComparison.language === 'TH' ? 'THB' : productA.currency)}
               </div>
               
               <div className="w-full space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl">
                 {selectedComparison.prosA.slice(0, 3).map((pro, i) => (
                   <div key={i} className="flex items-start text-sm text-slate-700 font-medium">
                     <Check size={18} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                     {pro}
                   </div>
                 ))}
               </div>

               <a href={productA.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center shadow-lg hover:shadow-blue-200">
                 Check Price
                 <ExternalLink size={18} className="ml-2" />
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
               {/* 💰 Currency Logic */}
               <div className="text-2xl font-medium text-slate-500 mb-8">
                  {formatCurrency(productB.price, selectedComparison.language === 'TH' ? 'THB' : productB.currency)}
               </div>
               
               <div className="w-full space-y-4 mb-8 text-left bg-slate-50 p-6 rounded-2xl">
                 {selectedComparison.prosB.slice(0, 3).map((pro, i) => (
                   <div key={i} className="flex items-start text-sm text-slate-700 font-medium">
                     <Check size={18} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                     {pro}
                   </div>
                 ))}
               </div>

               <a href={productB.affiliateLink} target="_blank" rel="noopener noreferrer" className="mt-auto w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center shadow-lg hover:shadow-slate-300">
                 Check Price
                 <ExternalLink size={18} className="ml-2" />
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
          
          {/* 🗣️ NEW: FAQ Section for Voice Search / AI Optimization */}
          {selectedComparison.faqs && selectedComparison.faqs.length > 0 && (
            <div className="mt-16">
                <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight flex items-center">
                    <HelpCircle className="mr-3 text-purple-600" />
                    Frequently Asked Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedComparison.faqs.map((faq, idx) => (
                        <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                            <h4 className="font-bold text-slate-800 mb-2">{faq.question}</h4>
                            <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* ⚖️ Affiliate Disclaimer Footer (Compliance) */}
          <div className="border-t border-slate-200 pt-8 mt-12 text-center text-xs text-slate-400">
             <div className="flex items-center justify-center space-x-2 mb-2">
                <Info size={14} />
                <span className="font-bold uppercase tracking-wider">Transparency Note</span>
             </div>
             <p className="max-w-2xl mx-auto">
                CompareX participates in affiliate programs (including Skimlinks and Amazon Associates). 
                We may earn a commission when you click on links to purchase products. This does not affect our editorial independence.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PublicView;
