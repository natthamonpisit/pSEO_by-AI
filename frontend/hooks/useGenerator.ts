import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { generateComparisonContent, discoverCompetitors, getDailyTrends, enrichProductSpecs } from '../services/geminiService';
import { Product, GenerationTask, ComparisonStatus, TrendItem, CategoryDefinition } from '../types';

/**
 * 🧠 Custom Hook: useGenerator
 * 
 * Separates the "Business Logic" from the "UI Rendering".
 * This hook handles:
 * 1. Factory Mode: Task Queue, Batch Processing Loop.
 * 2. Research Mode: Competitor Discovery.
 * 3. Auto-Pilot Mode: Trend Scanning & Data Enrichment.
 */
export const useGenerator = () => {
  // --- Global Config ---
  const [targetLanguage, setTargetLanguage] = useState<'TH' | 'EN'>('TH');

  // --- Factory State ---
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);
  const [agentStep, setAgentStep] = useState<0 | 1 | 2 | 3>(0); // 0=Idle, 1=Clerk, 2=Analyst, 3=Editor

  // --- Research State ---
  const [isResearching, setIsResearching] = useState(false);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<{name: string, reason: string}[]>([]);

  // --- Auto-Pilot State ---
  const [isScanning, setIsScanning] = useState(false);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [categoriesToScan, setCategoriesToScan] = useState<CategoryDefinition[]>([]);

  /**
   * 🏗️ INIT: Build the Comparison Matrix
   */
  useEffect(() => {
    // 1. Load Categories
    const dbCategories = dataService.getCategories();
    setCategoriesToScan(dbCategories);

    // 2. Build Tasks
    const products = dataService.getProducts();
    const existingComparisons = dataService.getComparisons();
    const newTasks: GenerationTask[] = [];

    // N * (N-1) / 2 Logic
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const p1 = products[i];
        const p2 = products[j];
        
        // Constraint: Same Category Only
        if (p1.category !== p2.category) continue;

        const exists = existingComparisons.some(c => 
          (c.productAId === p1.id && c.productBId === p2.id) ||
          (c.productAId === p2.id && c.productBId === p1.id)
        );

        if (!exists) {
          newTasks.push({
            productA: p1,
            productB: p2,
            status: ComparisonStatus.PENDING,
            targetLanguage: 'TH' // Init default
          });
        }
      }
    }
    setTasks(newTasks);
  }, []);

  /**
   * 🏭 FACTORY: Run Batch Process
   */
  const runBatch = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const pendingTasks = tasks.filter(t => t.status === ComparisonStatus.PENDING);
    
    for (let i = 0; i < pendingTasks.length; i++) {
      const task = pendingTasks[i];
      const realIndex = tasks.findIndex(t => t.productA.id === task.productA.id && t.productB.id === task.productB.id);
      
      setCurrentTaskIndex(realIndex);
      
      // Update Status: Generating
      const updatedTasks = [...tasks];
      updatedTasks[realIndex].status = ComparisonStatus.GENERATING;
      updatedTasks[realIndex].targetLanguage = targetLanguage;
      setTasks([...updatedTasks]);

      // Simulate Agents Visualization
      setAgentStep(1); await new Promise(r => setTimeout(r, 800)); 
      setAgentStep(2); await new Promise(r => setTimeout(r, 1200));
      setAgentStep(3);
      
      try {
        const categoryDef = dataService.getCategoryByName(task.productA.category);
        const focusFields = categoryDef?.comparisonFields || [];
        const tone = categoryDef?.contentTone || "Professional";

        const result = await generateComparisonContent(
            task.productA, 
            task.productB, 
            focusFields, 
            tone,
            targetLanguage
        );
        
        dataService.saveComparison(result);
        updatedTasks[realIndex].status = ComparisonStatus.COMPLETED;
      } catch (error) {
        console.error(error);
        updatedTasks[realIndex].status = ComparisonStatus.FAILED;
      }
      
      setTasks([...updatedTasks]);
      setAgentStep(0);
      setCurrentTaskIndex(null);
      await new Promise(r => setTimeout(r, 500));
    }
    setIsProcessing(false);
  };

  /**
   * 🔎 RESEARCH: Find Competitors
   */
  const handleResearch = async (query: string) => {
    if(!query) return;
    setIsResearching(true);
    setSuggestedCompetitors([]);
    try {
      const results = await discoverCompetitors(query);
      setSuggestedCompetitors(results);
    } catch (e) {
      console.error(e);
    }
    setIsResearching(false);
  };

  /**
   * 🚀 AUTO-PILOT: Scan Trends
   */
  const startAutoPilot = async () => {
    setIsScanning(true);
    setTrends([]);
    
    // Scan top 4 categories to save API quota
    const selectedCategories = categoriesToScan.slice(0, 4); 

    for (const cat of selectedCategories) {
      const catTrends = await getDailyTrends(cat.name);
      setTrends(prev => [...prev, ...catTrends]);
    }
    setIsScanning(false);
  };

  /**
   * 🤖 AUTO-PILOT: Enrich & Add to DB
   */
  const enrichAndAddToDB = async (trend: TrendItem) => {
    // 1. UI Update: Enriching
    const setStatus = (s: TrendItem['status']) => {
      setTrends(prev => prev.map(t => t.id === trend.id ? { ...t, status: s } : t));
    };
    setStatus('ENRICHING');

    // 2. Logic: Get Specs
    const categoryDef = dataService.getCategoryByName(trend.category);
    const targetSpecs = categoryDef?.comparisonFields || ['Price', 'Features'];

    try {
      const enrichedData = await enrichProductSpecs(
        trend.productName, 
        trend.category, 
        targetSpecs,
        targetLanguage
      );
      
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name: enrichedData.name || trend.productName,
        price: enrichedData.price || 0,
        currency: 'USD',
        brand: enrichedData.brand || 'Generic',
        category: trend.category,
        tags: enrichedData.tags || ['Trending'],
        specs: enrichedData.specs as Record<string, string>, 
        imageUrl: enrichedData.imageUrl || 'https://via.placeholder.com/300',
        affiliateLink: enrichedData.affiliateLink || '#'
      };

      dataService.saveProduct(newProduct);
      setStatus('ADDED');
    } catch (e) {
      console.error(e);
      setStatus('NEW');
    }
  };

  return {
    // Factory Data
    tasks,
    isProcessing,
    currentTaskIndex,
    agentStep,
    targetLanguage,
    setTargetLanguage,
    runBatch,
    
    // Research Data
    isResearching,
    suggestedCompetitors,
    handleResearch,

    // Auto-Pilot Data
    isScanning,
    trends,
    categoriesToScan,
    startAutoPilot,
    enrichAndAddToDB
  };
};
