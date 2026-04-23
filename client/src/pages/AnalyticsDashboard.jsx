import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Shield, FileWarning, ShieldCheck } from 'lucide-react';

export default function AnalyticsDashboard() {
    const { token } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setAnalytics(data);
            } catch (err) {
                console.error("Failed to fetch analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    if (loading) return <div className="text-gray-400">Loading analytics...</div>;
    if (!analytics) return <div className="text-red-400">Failed to load analytics.</div>;

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];
    
    // Format pie chart data
    const protectionData = Object.keys(analytics.protectionDistribution).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: analytics.protectionDistribution[key]
    }));

    const statusData = Object.keys(analytics.statusDistribution).map(key => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: analytics.statusDistribution[key]
    }));

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Analytics</h1>
                    <p className="text-gray-400 mt-1">Overview of your digital asset ecosystem.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-primary/20 rounded-full text-primary"><Shield className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm text-gray-400">Total Assets</p>
                        <p className="text-2xl font-bold text-white">{analytics.totalAssets}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className={`p-4 rounded-full ${analytics.avgRiskScore > 70 ? 'bg-red-400/20 text-red-400' : 'bg-yellow-400/20 text-yellow-400'}`}><FileWarning className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm text-gray-400">Avg Risk Score</p>
                        <p className="text-2xl font-bold text-white">{analytics.avgRiskScore}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-green-400/20 rounded-full text-green-400"><ShieldCheck className="w-8 h-8" /></div>
                    <div>
                        <p className="text-sm text-gray-400">Protected</p>
                        <p className="text-2xl font-bold text-white">{analytics.protectionDistribution['encrypted'] || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-2xl h-80">
                    <h3 className="text-lg font-medium text-white mb-4">Protection Status Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={protectionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {protectionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1A233A', borderColor: '#3B82F6', color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-panel p-6 rounded-2xl h-80">
                    <h3 className="text-lg font-medium text-white mb-4">Asset Processing Status</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData}>
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" allowDecimals={false} />
                            <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1A233A', borderColor: '#3B82F6', color: '#fff' }} />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
