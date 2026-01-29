import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { generateComparisonContent, discoverCompetitors, getDailyTrends, enrichProductSpecs } from '../services/geminiService';
import { Product, GenerationTask, ComparisonStatus, TrendItem, CategoryDefinition } from '../types';
import { Play, CheckCircle, Clock, AlertTriangle, Loader2, Search, BrainCircuit, PenTool, Save, PlusCircle, Sparkles, TrendingUp, Radar, Rocket, Zap, Database, Terminal, FileText, UserCheck } from 'lucide-react';

const Generator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'factory' | 'research' | 'autopilot'>('factory');

  // --- Factory State ---
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [agentStep, setAgentStep] = useState<0 | 1 | 2 | 3>(0); 
  
  // --- Research State ---
  const [researchQuery, setResearchQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<{name: string, reason: string}[]>([]);

  // --- Auto-Pilot State (Agent -1) ---
  const [isScanning, setIsScanning] = useState(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  
  // 🦅 Hunter Agent will scan Dynamic Categories from Database
  const [categoriesToScan, setCategoriesToScan] = useState<CategoryDefinition[]>([]);

  useEffect(() => {
    // Load Categories Dynamically
    const dbCategories = dataService.getCategories();
    setCategoriesToScan(dbCategories);

    // Factory Init
    const products = dataService.getProducts();
    const existingComparisons = dataService.getComparisons();
    const newTasks: GenerationTask[] = [];

    // 🧠 Logic Update: Only compare products within the SAME Category
    // เราไม่ควรเปรียบเทียบ ตู้เย็น vs มือถือ
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const p1 = products[i];
        const p2 = products[j];
        
        // Check Category Matching (String Comparison)
        if (p1.category !== p2.category) continue;

        const exists = existingComparisons.some(c => 
          (c.productAId === p1.id && c.productBId === p2.id) ||
          (c.productAId === p2.id && c.productBId === p1.id)
        );

        if (!exists) {
          newTasks.push({
            productA: p1,
            productB: p2,
            status: ComparisonStatus.PENDING
          });
        }
      }
    }
    setTasks(newTasks);
  }, []);

  const runBatch = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const pendingTasks = tasks.filter(t => t.status === ComparisonStatus.PENDING);
    
    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      const realIndex = tasks.findIndex(t => t.productA.id === task.productA.id && t.productB.id === task.productB.id);
      
      setCurrentTaskIndex(realIndex);
      
      const updatedTasks = [...tasks];
      updatedTasks[realIndex].status = ComparisonStatus.GENERATING;
      setTasks([...updatedTasks]);

      // --- Visualize Agents Working ---
      setAgentStep(1);
      await new Promise(r => setTimeout(r, 800)); 
      setAgentStep(2);
      await new Promise(r => setTimeout(r, 1200));
      setAgentStep(3);
      
      try {
        // ✨ DYNAMIC SPEC INJECTION:
        // Find the category definition to get its unique comparison fields (e.g. Drone -> Flight Time)
        // Also inject the TONE
        const categoryDef = dataService.getCategoryByName(task.productA.category);
        const focusFields = categoryDef?.comparisonFields || [];
        const tone = categoryDef?.contentTone || "Professional";

        const result = await generateComparisonContent(task.productA, task.productB, focusFields, tone);
        dataService.saveComparison(result);
        updatedTasks[realIndex].status = ComparisonStatus.COMPLETED;
        setTasks([...updatedTasks]);
      } catch (error) {
        console.error(error);
        updatedTasks[realIndex].status = ComparisonStatus.FAILED;
        setTasks([...updatedTasks]);
      }

      setAgentStep(0);
      setCurrentTaskIndex(null);
      await new Promise(r => setTimeout(r, 500));
    }
    setIsProcessing(false);
  };

  const handleResearch = async () => {
    if(!researchQuery) return;
    setIsResearching(true);
    setSuggestedCompetitors([]);
    try {
      const results = await discoverCompetitors(researchQuery);
      setSuggestedCompetitors(results);
    } catch (e) {
      console.error(e);
    }
    setIsResearching(false);
  };

  const startAutoPilot = async () => {
    setIsScanning(true);
    setTrends([]);
    
    // Scan dynamic categories
    // Note: In Production, limit this to prevent API limits
    // For now, scan top 4 from the user-defined list
    const selectedCategories = categoriesToScan.slice(0, 4); 

    for (const cat of selectedCategories) {
      const catTrends = await getDailyTrends(cat.name);
      setTrends(prev => [...prev, ...catTrends]);
    }
    setIsScanning(false);
  };

  // 🤖 AGENT 2 INTEGRATION (Data Enrichment)
  const enrichAndAddToDB = async (trend: TrendItem) => {
    // 1. Update UI to show enriching state
    const setStatus = (s: TrendItem['status']) => {
      setTrends(prev => prev.map(t => t.id === trend.id ? { ...t, status: s } : t));
    };
    setStatus('ENRICHING');

    // 2. Fetch Category Definition to know what specs to look for
    const categoryDef = dataService.getCategoryByName(trend.category);
    const targetSpecs = categoryDef?.comparisonFields || ['Price', 'Features'];

    // 3. Call Agent 2 (The Clerk)
    try {
      const enrichedData = await enrichProductSpecs(trend.productName, trend.category, targetSpecs);
      
      // 4. Create full Product object
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: enrichedData.name || trend.productName,
        price: enrichedData.price || 0,
        currency: 'USD',
        brand: enrichedData.brand || 'Generic',
        category: trend.category,
        tags: enrichedData.tags || ['Trending'],
        specs: enrichedData.specs as Record<string, string>, // Type cast for safety
        imageUrl: enrichedData.imageUrl || 'https://via.placeholder.com/300',
        affiliateLink: enrichedData.affiliateLink || '#'
      };

      // 5. Save to DB
      dataService.saveProduct(newProduct);
      setStatus('ADDED');

    } catch (e) {
      console.error(e);
      setStatus('NEW'); // Revert on fail
    }
  };

  const AgentCard = ({ step, activeStep, icon: Icon, title, desc, color }: any) => {
    const isActive = activeStep === step;
    return (
      <div className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-start space-x-3 ${
        isActive 
          ? `bg-white border-${color}-500 shadow-lg scale-105 opacity-100` 
          : 'bg-slate-50 border-slate-100 opacity-50 grayscale'
      }`}>
        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
          <Icon size={24} className={isActive ? 'animate-pulse' : ''} />
        </div>
        <div>
          <h4 className={`font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{title}</h4>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        {isActive && <div className="ml-auto"><Loader2 size={16} className="animate-spin text-slate-400"/></div>}
      </div>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header & Tabs */}
      <div className="flex justify-between items-center flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Content Factory</h2>
          <p className="text-slate-500">Manage your AI workforce.</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-lg space-x-1">
          <button 
            onClick={() => setActiveTab('factory')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'factory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Production Line
          </button>
          <button 
            onClick={() => setActiveTab('research')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
              activeTab === 'research' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp size={16} className="mr-2" />
            Trend Research
          </button>
          <button 
            onClick={() => setActiveTab('autopilot')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
              activeTab === 'autopilot' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Radar size={16} className="mr-2" />
            Auto-Pilot Radar
          </button>
        </div>
      </div>

      {activeTab === 'factory' && (
        // --- FACTORY UI (Production Line) ---
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex justify-between items-center">
                <span>Job Queue ({tasks.length})</span>
                <button 
                  onClick={runBatch}
                  disabled={isProcessing || tasks.filter(t => t.status === ComparisonStatus.PENDING).length === 0}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center ${
                     isProcessing 
                     ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                     : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? <Loader2 size={12} className="animate-spin mr-1" /> : <Play size={12} className="mr-1" />}
                  START
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {tasks.length === 0 && (
                 <div className="text-center p-6 text-slate-400">
                    <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No compatible pairs found.</p>
                    <p className="text-xs">Add more products in the same category.</p>
                 </div>
               )}
               {tasks.map((task, idx) => {
                 const isActive = idx === currentTaskIndex;
                 return (
                   <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                     isActive ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-white border-slate-100 hover:bg-slate-50'
                   }`}>
                     <div className="flex items-center space-x-3">
                       <span className="text-xs font-mono text-slate-400 w-6">#{idx+1}</span>
                       <span className="font-medium text-slate-700 text-sm">
                         {task.productA.name} <span className="text-slate-400 text-xs">vs</span> {task.productB.name}
                       </span>
                     </div>
                     <div>
                       {task.status === ComparisonStatus.PENDING && !isActive && <Clock size={16} className="text-slate-300"/>}
                       {isActive && <Loader2 size={16} className="text-blue-500 animate-spin"/>}
                       {task.status === ComparisonStatus.COMPLETED && <CheckCircle size={16} className="text-green-500"/>}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Current Job</h3>
                {currentTaskIndex !== null ? (
                   <div className="text-2xl font-bold flex items-center space-x-3">
                      <span>{tasks[currentTaskIndex].productA.name}</span>
                      <span className="text-slate-500 text-base">VS</span>
                      <span>{tasks[currentTaskIndex].productB.name}</span>
                   </div>
                ) : (
                  <div className="text-2xl font-bold text-slate-500">Waiting to start...</div>
                )}
              </div>
              <BrainCircuit className="absolute right-[-20px] bottom-[-20px] text-slate-800 opacity-50" size={140} />
            </div>

            <div className="grid grid-cols-1 gap-4">
               {/* Note: In Factory Mode, we assume Agent 1 has already done the job. Start from Agent 2. */}
               <AgentCard step={1} activeStep={agentStep} icon={Database} title="Agent 2: The Clerk" desc="Preparing specs from Database" color="blue" />
               <AgentCard step={2} activeStep={agentStep} icon={BrainCircuit} title="Agent 3: The Analyst" desc="Comparing features & Scoring" color="purple" />
               <AgentCard step={3} activeStep={agentStep} icon={PenTool} title="Agent 4: The Editor" desc="Drafting Final SEO Content" color="pink" />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'research' && (
        // --- RESEARCH UI (Agent 1 Mode) ---
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50 text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Agent 1: The Hunter (Competitor Mode)</h3>
            <p className="text-slate-600 max-w-lg mx-auto mb-6">
              Don't know what to compare? Enter a product name, and Agent 1 will search for the best competitors.
            </p>
            <div className="max-w-xl mx-auto flex gap-2 relative">
               <input 
                 type="text" 
                 placeholder="e.g. iPhone 16 Pro Max, Sony A7IV, Dyson V15" 
                 className="flex-1 px-5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-lg"
                 value={researchQuery}
                 onChange={(e) => setResearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
               />
               <button 
                 onClick={handleResearch}
                 disabled={isResearching}
                 className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 flex items-center disabled:opacity-50"
               >
                 {isResearching ? <Loader2 className="animate-spin" /> : <Sparkles />}
               </button>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
             {suggestedCompetitors.length > 0 && (
               <div className="max-w-4xl mx-auto">
                 <h4 className="font-bold text-slate-700 mb-4 flex items-center">
                   <UserCheck size={20} className="mr-2 text-green-600" />
                   Agent 1's Suggestions for "{researchQuery}"
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {suggestedCompetitors.map((item, idx) => (
                     <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                       <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <PlusCircle className="text-blue-500 cursor-pointer" />
                       </div>
                       <div className="font-bold text-lg text-slate-800 mb-2">{item.name}</div>
                       <p className="text-slate-500 text-sm leading-relaxed">{item.reason}</p>
                       <div className="mt-4 pt-4 border-t border-slate-100">
                          <button className="text-xs font-bold text-blue-600 uppercase tracking-wider hover:underline">
                            + Send to Agent 2 (DB)
                          </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'autopilot' && (
        // --- AUTO-PILOT RADAR UI (Agent 1 Mode) ---
        <div className="flex-1 bg-slate-50 flex flex-col min-h-0">
          <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg mb-6 flex justify-between items-center flex-shrink-0">
            <div>
               <h3 className="text-2xl font-bold mb-2 flex items-center">
                 <Radar className="mr-3 text-green-400" size={32} />
                 Agent 1: Daily Trend Radar
               </h3>
               <p className="text-slate-400">
                  Agent "Hunter" will scan the web for today's hottest launches in your selected categories.
               </p>
            </div>
            <button 
              onClick={startAutoPilot}
              disabled={isScanning}
              className="px-6 py-4 bg-green-500 text-slate-900 font-bold rounded-xl shadow-lg hover:bg-green-400 flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isScanning ? (
                 <>
                   <Loader2 className="animate-spin mr-2" />
                   Scanning Global News...
                 </>
               ) : (
                 <>
                   <Rocket className="mr-2" />
                   Scan Markets Now
                 </>
               )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-1">
             {categoriesToScan.slice(0, 4).map(category => {
               const categoryTrends = trends.filter(t => t.category === category.name);
               return (
                 <div key={category.id} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-3 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
                       {category.name}
                       <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{categoryTrends.length}</span>
                    </div>
                    <div className="p-3 space-y-3 flex-1 overflow-y-auto min-h-[200px]">
                      {categoryTrends.length === 0 && !isScanning && (
                         <div className="text-center text-slate-400 text-xs mt-10">No scan data</div>
                      )}
                      {categoryTrends.map(trend => (
                        <div key={trend.id} className="p-3 rounded-lg border border-slate-100 hover:shadow-md transition-all bg-slate-50/50">
                           <div className="flex justify-between items-start mb-1">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded uppercase tracking-wide">
                                {trend.launchDate || 'Today'}
                              </span>
                              {trend.status === 'ADDED' ? (
                                <CheckCircle size={14} className="text-green-500" />
                              ) : trend.status === 'ENRICHING' ? (
                                <Loader2 size={14} className="text-blue-500 animate-spin" />
                              ) : (
                                <Zap size={14} className="text-yellow-500" />
                              )}
                           </div>
                           <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{trend.productName}</h4>
                           <p className="text-xs text-slate-500 leading-snug mb-2 line-clamp-2">
                             "{trend.newsHeadline}" - {trend.reason}
                           </p>
                           
                           {/* STATUS ACTIONS */}
                           {trend.status === 'NEW' && (
                             <button 
                               onClick={() => enrichAndAddToDB(trend)}
                               className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 flex items-center justify-center shadow-sm"
                             >
                               <Terminal size={12} className="mr-1" />
                               Python Scrape (Free)
                             </button>
                           )}
                           {trend.status === 'ENRICHING' && (
                             <div className="w-full py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded flex items-center justify-center">
                               <Loader2 size={12} className="animate-spin mr-1" /> Agent 2 Working...
                             </div>
                           )}
                           {trend.status === 'ADDED' && (
                             <div className="w-full py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded flex items-center justify-center border border-green-100">
                               Ready for Agent 3
                             </div>
                           )}
                        </div>
                      ))}
                      {isScanning && (
                        <div className="animate-pulse space-y-3">
                          <div className="h-24 bg-slate-100 rounded-lg"></div>
                          <div className="h-24 bg-slate-100 rounded-lg"></div>
                        </div>
                      )}
                    </div>
                 </div>
               );
             })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
