import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Clock } from 'lucide-react';

export default function ActivityLog() {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/audit-logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setLogs(data.logs);
            } catch (err) {
                console.error("Failed to fetch logs");
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [token]);

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                    <p className="text-gray-400 mt-1">A timeline of all actions taken in your account.</p>
                </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl">
                {loading ? (
                    <div className="text-gray-400 text-center">Loading activity...</div>
                ) : logs.length === 0 ? (
                    <div className="text-gray-400 text-center">No activity found.</div>
                ) : (
                    <div className="relative border-l border-white/10 ml-4 space-y-8">
                        {logs.map((log, idx) => (
                            <div key={idx} className="relative pl-6">
                                <div className="absolute -left-3 top-1 w-6 h-6 bg-surface border-4 border-background rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{log.action}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{log.details}</p>
                                    <div className="flex items-center text-xs text-gray-500 mt-2 gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
