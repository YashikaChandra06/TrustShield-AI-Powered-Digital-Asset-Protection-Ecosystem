import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, File, FileText, Image as ImageIcon, Code, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AssetDashboard() {
    const { token } = useAuth();
    const [assets, setAssets] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setAssets(data.assets);
        } catch (err) {
            console.error("Failed to fetch assets");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('asset', file);

        try {
            const res = await fetch('/api/assets/upload', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                // Refresh list
                fetchAssets();
            } else {
                const data = await res.json();
                setError(data.error || "Upload failed");
            }
        } catch (err) {
            setError("Server connection failed during upload.");
        } finally {
            setUploading(false);
            // reset file input
            e.target.value = null;
        }
    };

    const getIconForMimeType = (mimeType) => {
        if (!mimeType) return <File className="w-6 h-6 text-gray-400" />;
        if (mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-400" />;
        if (mimeType.includes('image')) return <ImageIcon className="w-6 h-6 text-blue-400" />;
        if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('text/plain')) return <Code className="w-6 h-6 text-yellow-400" />;
        return <File className="w-6 h-6 text-gray-400" />;
    };

    const getStatusBadge = (status) => {
        if (status === 'scanning') return <span className="flex items-center text-yellow-400 text-xs px-2 py-1 bg-yellow-400/10 rounded-full border border-yellow-400/20"><Clock className="w-3 h-3 mr-1" /> Scanning...</span>;
        if (status === 'scanned') return <span className="flex items-center text-green-400 text-xs px-2 py-1 bg-green-400/10 rounded-full border border-green-400/20"><CheckCircle className="w-3 h-3 mr-1" /> Scanned</span>;
        if (status === 'failed') return <span className="flex items-center text-red-400 text-xs px-2 py-1 bg-red-400/10 rounded-full border border-red-400/20"><AlertTriangle className="w-3 h-3 mr-1" /> Failed</span>;
        return null;
    };

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Digital Assets</h1>
                    <p className="text-gray-400 mt-1">Upload and scan files to ensure they are secure.</p>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Zone */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-primary/40 hover:border-primary transition-colors text-center cursor-pointer relative overflow-hidden group h-64">
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <div className="bg-primary/20 p-4 rounded-full mb-4 group-hover:bg-primary/30 transition-colors">
                            <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-1">
                            {uploading ? 'Uploading...' : 'Click or Drag to Upload'}
                        </h3>
                        <p className="text-sm text-gray-400 px-4">
                            PDFs, Images, Code files up to 50MB
                        </p>
                    </div>
                </div>

                {/* Asset List */}
                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <h2 className="font-semibold text-white">Recent Assets</h2>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                            {assets.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No assets uploaded yet.
                                </div>
                            ) : (
                                assets.map(asset => (
                                    <Link 
                                        key={asset.id} 
                                        to={`/assets/${asset.id}`}
                                        className="flex items-center p-4 hover:bg-white/5 transition-colors cursor-pointer group"
                                    >
                                        <div className="p-2 bg-white/5 rounded-lg mr-4">
                                            {getIconForMimeType(asset.mime_type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium truncate group-hover:text-primary transition-colors">{asset.original_name}</h4>
                                            <div className="flex text-xs text-gray-500 mt-1 gap-3">
                                                <span>{(asset.size / 1024).toFixed(1)} KB</span>
                                                <span>{new Date(asset.upload_date).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            {getStatusBadge(asset.status)}
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
