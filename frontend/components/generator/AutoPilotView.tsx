import React from 'react';
import { TrendItem, CategoryDefinition } from '../../types';
import { Radar, Loader2, Rocket, CheckCircle, Zap, Terminal } from 'lucide-react';

interface AutoPilotViewProps {
  isScanning: boolean;
  trends: TrendItem[];
  categoriesToScan: CategoryDefinition[];
  onStartScan: () => void;
  onEnrich: (trend: TrendItem) => void;
}

export const AutoPilotView: React.FC<AutoPilotViewProps> = ({
  isScanning,
  trends,
  categoriesToScan,
  onStartScan,
  onEnrich
}) => {
  return (
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
          onClick={onStartScan}
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
                            onClick={() => onEnrich(trend)}
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
  );
};
