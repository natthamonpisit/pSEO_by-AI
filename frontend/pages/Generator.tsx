import React, { useState } from 'react';
import { useGenerator } from '../hooks/useGenerator';
import { TrendingUp, Radar } from 'lucide-react';
import { FactoryView } from '../components/generator/FactoryView';
import { ResearchView } from '../components/generator/ResearchView';
import { AutoPilotView } from '../components/generator/AutoPilotView';

/**
 * 🧱 GENERATOR PAGE (Controller)
 * 
 * J's Note: I've refactored this using the Container/Presentation pattern.
 * - Logic is now in `hooks/useGenerator.ts`
 * - UI is split into `components/generator/*`
 * 
 * This file acts as the "Controller" that wires everything together.
 */
const Generator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'factory' | 'research' | 'autopilot'>('factory');
  const generator = useGenerator();

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

      {/* View Controller */}
      {activeTab === 'factory' && (
        <FactoryView 
          tasks={generator.tasks}
          isProcessing={generator.isProcessing}
          currentTaskIndex={generator.currentTaskIndex}
          agentStep={generator.agentStep}
          targetLanguage={generator.targetLanguage}
          setTargetLanguage={generator.setTargetLanguage}
          onRunBatch={generator.runBatch}
        />
      )}

      {activeTab === 'research' && (
        <ResearchView 
          isResearching={generator.isResearching}
          suggestedCompetitors={generator.suggestedCompetitors}
          onResearch={generator.handleResearch}
        />
      )}

      {activeTab === 'autopilot' && (
        <AutoPilotView 
          isScanning={generator.isScanning}
          trends={generator.trends}
          categoriesToScan={generator.categoriesToScan}
          onStartScan={generator.startAutoPilot}
          onEnrich={generator.enrichAndAddToDB}
        />
      )}
    </div>
  );
};

export default Generator;
