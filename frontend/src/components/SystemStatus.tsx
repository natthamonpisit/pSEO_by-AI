import { useEffect, useState, useRef } from 'react';
import { Terminal, Play, RefreshCw, Activity, Server } from 'lucide-react';
import { API_URL } from '../config';

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
}

export default function SystemStatus() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/api/system/logs`);
            const data = await res.json();
            setLogs(data);
        } catch (err) {
            console.error(err);
        }
    };

    const triggerJob = async (job: string) => {
        setLoading(true);
        try {
            await fetch(`${API_URL}/api/system/trigger/${job}`, { method: 'POST' });
            // Fetch logs immediately to show the "Triggered" message
            setTimeout(fetchLogs, 500);
        } catch (err) {
            alert('Trigger Failed');
        } finally {
            setLoading(false);
        }
    };

    // Poll logs every 3 seconds
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Control Panel */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Activity className="text-indigo-600" size={20} />
                        Control Room
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <h4 className="font-medium text-slate-700">Hunter Agent</h4>
                                <p className="text-xs text-slate-500">Scans RSS feeds & search trends</p>
                            </div>
                            <button
                                onClick={() => triggerJob('hunter')}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                Run Now
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                                <h4 className="font-medium text-slate-700">Processing Loop</h4>
                                <p className="text-xs text-slate-500">Specs -> Match -> Generate -> Save</p>
                            </div>
                            <button
                                onClick={() => triggerJob('loop')}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                <Play size={16} />
                                Force Run
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Server className="text-slate-600" size={20} />
                        System Health
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 bg-emerald-50 text-emerald-700 rounded-lg text-center border border-emerald-100">
                            <div className="text-2xl font-bold">Online</div>
                            <div className="text-xs opacity-75">Backend Status</div>
                        </div>
                        <div className="flex-1 p-4 bg-blue-50 text-blue-700 rounded-lg text-center border border-blue-100">
                            <div className="text-2xl font-bold">v1.2.0</div>
                            <div className="text-xs opacity-75">Brain Version</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Logs */}
            <div className="bg-slate-900 rounded-xl overflow-hidden flex flex-col h-[500px] border border-slate-700 shadow-2xl">
                <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-mono">
                        <Terminal size={14} />
                        system.log
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2">
                    {logs.length === 0 && (
                        <div className="text-slate-500 italic text-center mt-20">Waiting for logs...</div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-3">
                            <span className="text-slate-500 shrink-0">{log.timestamp.split('T')[1].split('.')[0]}</span>
                            <span className={`shrink-0 font-bold ${log.level === 'ERROR' ? 'text-red-400' :
                                    log.level === 'WARNING' ? 'text-amber-400' :
                                        log.level === 'SUCCESS' ? 'text-emerald-400' :
                                            'text-blue-400'
                                }`}>
                                [{log.level}]
                            </span>
                            <span className="text-slate-300 break-all">{log.message}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
}
