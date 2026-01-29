import React, { useState } from 'react';
import { Loader2, Sparkles, UserCheck, PlusCircle } from 'lucide-react';

interface ResearchViewProps {
  isResearching: boolean;
  suggestedCompetitors: {name: string, reason: string}[];
  onResearch: (query: string) => void;
}

export const ResearchView: React.FC<ResearchViewProps> = ({
  isResearching,
  suggestedCompetitors,
  onResearch
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = () => {
    onResearch(query);
  };

  return (
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button 
              onClick={handleSubmit}
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
                Agent 1's Suggestions for "{query}"
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
  );
};
