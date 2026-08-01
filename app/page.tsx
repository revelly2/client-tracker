import Link from 'next/link';
import { FolderKanban, ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col justify-center selection:bg-blue-500/30">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-float"></div>
      <div className="absolute bottom-0 -right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-float" style={{ animationDelay: '-3s' }}></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 animate-entrance">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400 uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.15)] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            System Online v2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Tracker</span> Matrix.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            Deploy secure project portals. Monitor real-time status. Establish gated repositories with absolute precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              href="/admin"
              className="w-full sm:w-auto btn-primary group px-8 py-4 text-base"
            >
              Initialize Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full animate-entrance" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Live Telemetry</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Track project progression in real-time. Clients get instant visual feedback on their milestones.
            </p>
          </div>

          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition-colors">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Secure Handoffs</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Gated GitHub repositories ensure deliverables are locked until final payment authorization.
            </p>
          </div>

          <div className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 transition-colors">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Rapid Deploy</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-light">
              Generate unguessable client sharing tokens instantly. No logins required for your clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
