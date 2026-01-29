import React from 'react';
import { GenerationTask, ComparisonStatus } from '../../types';
import { Play, Clock, CheckCircle, Loader2, Globe, Database, BrainCircuit, PenTool } from 'lucide-react';

interface FactoryViewProps {
  tasks: GenerationTask[];
  isProcessing: boolean;
  currentTaskIndex: number | null;
  agentStep: number;
  targetLanguage: 'TH' | 'EN';
  setTargetLanguage: (lang: 'TH' | 'EN') => void;
  onRunBatch: () => void;
}

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

export const FactoryView: React.FC<FactoryViewProps> = ({
  tasks,
  isProcessing,
  currentTaskIndex,
  agentStep,
  targetLanguage,
  setTargetLanguage,
  onRunBatch
}) => {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
      <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          
          {/* Queue Control Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 flex flex-col space-y-3">
            <div className="flex justify-between items-center">
                <span>Job Queue ({tasks.length})</span>
                <button 
                  onClick={onRunBatch}
                  disabled={isProcessing || tasks.filter(t => t.status === ComparisonStatus.PENDING).length === 0}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center transition-colors ${
                    isProcessing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? <Loader2 size={12} className="animate-spin mr-1" /> : <Play size={12} className="mr-1" />}
                  START
                </button>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200">
                <Globe size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Target Market:</span>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => setTargetLanguage('TH')}
                    disabled={isProcessing}
                    className={`px-3 py-1 text-xs rounded font-bold transition-colors ${
                        targetLanguage === 'TH' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🇹🇭 TH (Local)
                  </button>
                  <button 
                    onClick={() => setTargetLanguage('EN')}
                    disabled={isProcessing}
                    className={`px-3 py-1 text-xs rounded font-bold transition-colors ${
                        targetLanguage === 'EN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    🌍 Global (EN)
                  </button>
                </div>
            </div>
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
            {currentTaskIndex !== null && tasks[currentTaskIndex] ? (
                <div>
                    <div className="text-2xl font-bold flex items-center space-x-3 mb-2">
                      <span>{tasks[currentTaskIndex].productA.name}</span>
                      <span className="text-slate-500 text-base">VS</span>
                      <span>{tasks[currentTaskIndex].productB.name}</span>
                    </div>
                    <div className="inline-flex items-center px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-300">
                      <Globe size={12} className="mr-1" />
                      Generating in: {targetLanguage === 'TH' ? 'Thai Language' : 'English (Global)'}
                    </div>
                </div>
            ) : (
              <div className="text-2xl font-bold text-slate-500">Waiting to start...</div>
            )}
          </div>
          <BrainCircuit className="absolute right-[-20px] bottom-[-20px] text-slate-800 opacity-50" size={140} />
        </div>

        <div className="grid grid-cols-1 gap-4">
            <AgentCard step={1} activeStep={agentStep} icon={Database} title="Agent 2: The Clerk" desc="Preparing specs from Database" color="blue" />
            <AgentCard step={2} activeStep={agentStep} icon={BrainCircuit} title="Agent 3: The Analyst" desc="Comparing features & Scoring" color="purple" />
            <AgentCard step={3} activeStep={agentStep} icon={PenTool} title="Agent 4: The Editor" desc={`Drafting Final SEO Content (${targetLanguage})`} color="pink" />
        </div>
      </div>
    </div>
  );
};
