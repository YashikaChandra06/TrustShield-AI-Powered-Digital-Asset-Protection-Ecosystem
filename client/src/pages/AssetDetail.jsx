import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShieldAlert, ShieldCheck, Shield, FileText, AlertTriangle, CheckCircle2, Download, Trash2 } from 'lucide-react';

export default function AssetDetail() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/assets/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (res.ok) {
                    setData(json);
                } else {
                    setError(json.error || 'Failed to load asset');
                }
            } catch (err) {
                setError('Server connection failed');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
        
        // Polling if scanning
        const interval = setInterval(() => {
            if (data?.asset?.status === 'scanning') {
                fetchDetail();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [id, token, data?.asset?.status]);

    if (loading) return <div className="text-gray-400">Loading asset details...</div>;
    if (error) return <div className="text-red-400">{error}</div>;
    if (!data || !data.asset) return <div className="text-gray-400">Asset not found.</div>;

    const { asset, report } = data;

    const getRiskColor = (score) => {
        if (score < 30) return 'text-green-400 border-green-400/20 bg-green-400/10';
        if (score < 70) return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10';
        return 'text-red-400 border-red-400/20 bg-red-400/10';
    };

    const getRiskIcon = (score) => {
        if (score < 30) return <ShieldCheck className="w-12 h-12 text-green-400" />;
        if (score < 70) return <Shield className="w-12 h-12 text-yellow-400" />;
        return <ShieldAlert className="w-12 h-12 text-red-400" />;
    };

    const handleProtect = async (action) => {
        try {
            const res = await fetch(`/api/assets/${id}/protect`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ action })
            });
            const result = await res.json();
            if (res.ok) {
                // Refresh data
                setData(prev => ({
                    ...prev,
                    asset: { ...prev.asset, protection_status: result.protection_status }
                }));
            } else {
                alert(result.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDownload = async () => {
        try {
            const res = await fetch(`/api/assets/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = asset.original_name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert('Failed to download asset');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this asset? This action cannot be undone.")) return;
        
        try {
            const res = await fetch(`/api/assets/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                navigate('/dashboard');
            } else {
                const result = await res.json();
                alert(result.error || 'Failed to delete asset');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
                <div className="flex items-center gap-6">
                    <div className="bg-white/5 p-4 rounded-xl">
                        <FileText className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{asset.original_name}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span>Uploaded: {new Date(asset.upload_date).toLocaleString()}</span>
                            <span>Size: {(asset.size / 1024).toFixed(1)} KB</span>
                            <span>Type: {asset.mime_type || 'Unknown'}</span>
                            <span className="capitalize text-primary">Status: {asset.status}</span>
                            <span className="capitalize text-secondary">Protection: {asset.protection_status || 'unprotected'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={handleDownload} className="flex items-center justify-center px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Download Asset
                    </button>
                    {asset.protection_status === 'unprotected' && (
                        <div className="flex gap-3">
                            <button onClick={() => handleProtect('encrypt')} className="px-4 py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/30 transition-colors">
                                Encrypt
                            </button>
                            <button onClick={() => handleProtect('lock')} className="px-4 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/30 transition-colors">
                                Lock
                            </button>
                        </div>
                    )}
                    <button onClick={handleDelete} className="flex items-center justify-center px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors mt-2">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Asset
                    </button>
                </div>
            </div>

            {asset.status === 'scanning' ? (
                <div className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                    <h2 className="text-xl font-bold text-white">AI Scan in Progress...</h2>
                    <p className="text-gray-400 mt-2">Analyzing the asset for vulnerabilities, copyright issues, and sensitive data.</p>
                </div>
            ) : report ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <div className={`glass-panel p-6 rounded-2xl flex flex-col items-center text-center border-t-4 ${getRiskColor(report.risk_score).split(' ')[0].replace('text-', 'border-')}`}>
                            <div className={`p-4 rounded-full mb-4 ${getRiskColor(report.risk_score)}`}>
                                {getRiskIcon(report.risk_score)}
                            </div>
                            <h3 className="text-gray-400 uppercase tracking-wider text-xs font-bold mb-1">Risk Score</h3>
                            <div className="text-5xl font-black text-white mb-2">{report.risk_score}</div>
                            <p className="text-sm text-gray-400">out of 100</p>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
                            <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">AI Modular Scan Report</h2>
                            
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-3 bg-white/5 rounded-lg text-center">
                                    <h4 className="text-xs text-gray-400 uppercase">Malware Risk</h4>
                                    <span className={`text-xl font-bold ${getRiskColor(report.malware_score).split(' ')[0]}`}>{report.malware_score}/100</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg text-center">
                                    <h4 className="text-xs text-gray-400 uppercase">Copyright Risk</h4>
                                    <span className={`text-xl font-bold ${getRiskColor(report.copyright_score).split(' ')[0]}`}>{report.copyright_score}/100</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-lg text-center">
                                    <h4 className="text-xs text-gray-400 uppercase">Privacy Risk</h4>
                                    <span className={`text-xl font-bold ${getRiskColor(report.privacy_score).split(' ')[0]}`}>{report.privacy_score}/100</span>
                                </div>
                            </div>

                            <ul className="space-y-4 flex-1 overflow-y-auto">
                                {report.flagged_issues && report.flagged_issues.map((issue, idx) => {
                                    const isClean = issue.includes('Clean');
                                    return (
                                        <li key={idx} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                                            {isClean ? 
                                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" /> : 
                                                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                            }
                                            <span className="text-gray-200 text-sm">{issue}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-panel p-8 rounded-2xl text-center text-gray-400">
                    Scan report is unavailable or failed.
                </div>
            )}
        </div>
    );
}
