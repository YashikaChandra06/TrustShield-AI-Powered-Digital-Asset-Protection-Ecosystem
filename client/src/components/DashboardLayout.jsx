import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LayoutDashboard, LogOut, Settings, ActivitySquare, BarChart3 } from 'lucide-react';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background text-white flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20 hidden md:flex">
                <div className="p-6 flex items-center gap-3 border-b border-white/5">
                    <Shield className="w-8 h-8 text-primary" />
                    <span className="font-bold tracking-tight text-xl">TrustShield</span>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    <Link 
                        to="/dashboard" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/dashboard' || location.pathname.startsWith('/assets') ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Assets Dashboard
                    </Link>
                    <Link 
                        to="/analytics" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/analytics' ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <BarChart3 className="w-5 h-5" />
                        Analytics
                    </Link>
                    <Link 
                        to="/activity" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/activity' ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                        <ActivitySquare className="w-5 h-5" />
                        Activity Log
                    </Link>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user?.email?.[0].toUpperCase() || 'U'}
                        </div>
                        <div className="truncate flex-1">{user?.email}</div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors text-left"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto">
                <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="p-8 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
