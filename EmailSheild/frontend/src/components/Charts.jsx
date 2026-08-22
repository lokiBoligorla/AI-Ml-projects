import React from 'react';
import { BarChart, TrendingUp, ShieldAlert, Award } from 'lucide-react';

function Charts({ stats }) {
  const { safe, spam, phishing, trends } = stats;
  const total = safe + spam + phishing;

  // 1. Calculate relative bar heights/percentages for Threat Class distribution
  const safePercent = total > 0 ? (safe / total) * 100 : 0;
  const spamPercent = total > 0 ? (spam / total) * 100 : 0;
  const phishPercent = total > 0 ? (phishing / total) * 100 : 0;

  // 2. Generate smooth coordinate path for the Daily Scans Trend (Line Chart)
  // We use standard 500 x 200 coordinate viewport
  const viewWidth = 500;
  const viewHeight = 160;
  const padding = 20;

  let linePath = "";
  let areaPath = "";
  let dataPoints = [];

  // Use trend trends or load pre-populated default values if empty
  const activeTrends = trends && trends.length > 0 ? trends : [
    { date: "Node Startup", total: 0, safe: 0, spam: 0, phishing: 0 }
  ];

  if (activeTrends.length > 0) {
    const maxVal = Math.max(...activeTrends.map(t => t.total), 5); // at least 5 for scale
    const count = activeTrends.length;
    
    // Compute screen coordinates for each point
    dataPoints = activeTrends.map((t, idx) => {
      const x = padding + (idx / Math.max(count - 1, 1)) * (viewWidth - 2 * padding);
      const y = viewHeight - padding - (t.total / maxVal) * (viewHeight - 2 * padding);
      return { x, y, date: t.date, total: t.total };
    });

    // Create SVGA line path string
    if (dataPoints.length > 1) {
      linePath = `M ${dataPoints[0].x} ${dataPoints[0].y} ` + dataPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
      // Close the path at the bottom to create a filled area
      areaPath = `${linePath} L ${dataPoints[dataPoints.length - 1].x} ${viewHeight - padding} L ${dataPoints[0].x} ${viewHeight - padding} Z`;
    } else if (dataPoints.length === 1) {
      linePath = `M ${padding} ${dataPoints[0].y} L ${viewWidth - padding} ${dataPoints[0].y}`;
      areaPath = `M ${padding} ${dataPoints[0].y} L ${viewWidth - padding} ${dataPoints[0].y} L ${viewWidth - padding} ${viewHeight - padding} L ${padding} ${viewHeight - padding} Z`;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Chart 1: Threat Distribution */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2 uppercase tracking-widest border-b border-cyber-border/40 pb-2">
          <BarChart className="text-cyber-cyan w-4.5 h-4.5" />
          Threat Categorization Breakdown
        </h3>

        <div className="space-y-5 py-2">
          {total === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center space-y-2 font-mono text-xs text-cyber-muted">
              <Award className="w-8 h-8 opacity-20" />
              <span>NO SCANS LOGGED ON NODE</span>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Stacked Percentage bar */}
              <div className="h-4 bg-cyber-bg border border-cyber-border rounded-full overflow-hidden flex">
                <div style={{ width: `${safePercent}%` }} className="h-full bg-cyber-safe transition-all duration-500" title={`Safe: ${safePercent.toFixed(1)}%`}></div>
                <div style={{ width: `${spamPercent}%` }} className="h-full bg-cyber-spam transition-all duration-500" title={`Spam: ${spamPercent.toFixed(1)}%`}></div>
                <div style={{ width: `${phishPercent}%` }} className="h-full bg-cyber-phish transition-all duration-500" title={`Phishing: ${phishPercent.toFixed(1)}%`}></div>
              </div>

              {/* Individual Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyber-safe rounded-sm"></div>
                    <span className="text-white font-bold">Safe / Legitimate</span>
                  </div>
                  <span className="text-cyber-muted">{safe} email scans ({safePercent.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyber-spam rounded-sm"></div>
                    <span className="text-white font-bold">Spam Campaigns</span>
                  </div>
                  <span className="text-cyber-muted">{spam} email scans ({spamPercent.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyber-phish rounded-sm"></div>
                    <span className="text-white font-bold">Phishing Attempts</span>
                  </div>
                  <span className="text-cyber-muted">{phishing} email scans ({phishPercent.toFixed(1)}%)</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Scanning activity line graph */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2 uppercase tracking-widest border-b border-cyber-border/40 pb-2">
          <TrendingUp className="text-cyber-cyan w-4.5 h-4.5" />
          Chronological Scanning Activity
        </h3>

        <div className="relative py-2 flex flex-col justify-center items-center">
          {total === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-center space-y-2 font-mono text-xs text-cyber-muted">
              <ShieldAlert className="w-8 h-8 opacity-20" />
              <span>AWAITING LOG METRICS</span>
            </div>
          ) : (
            <div className="w-full">
              {/* Responsive SVG wrapper */}
              <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} className="w-full h-auto overflow-visible">
                <defs>
                  {/* Glowing background gradient for line area */}
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1={padding} y1={padding} x2={viewWidth - padding} y2={padding} stroke="#1e293b" strokeDasharray="3" strokeWidth="0.5" />
                <line x1={padding} y1={viewHeight / 2} x2={viewWidth - padding} y2={viewHeight / 2} stroke="#1e293b" strokeDasharray="3" strokeWidth="0.5" />
                <line x1={padding} y1={viewHeight - padding} x2={viewWidth - padding} y2={viewHeight - padding} stroke="#27354a" strokeWidth="1" />

                {/* Filled Area path */}
                {areaPath && <path d={areaPath} fill="url(#areaGlow)" className="transition-all duration-1000" />}

                {/* Line path */}
                {linePath && <path d={linePath} fill="none" stroke="#06b6d4" strokeWidth="2.5" className="transition-all duration-1000" />}

                {/* Dots at each data coordinate */}
                {dataPoints.map((pt, i) => (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="fill-cyber-bg stroke-cyber-cyan hover:r-6 hover:fill-cyber-cyan transition-all duration-150"
                      strokeWidth="2"
                    />
                    {/* SVG Tooltip showing total scans */}
                    <title>{`Date: ${pt.date}\nScans: ${pt.total}`}</title>
                  </g>
                ))}
              </svg>

              {/* Dates labels below chart */}
              <div className="flex justify-between px-2.5 mt-2 font-mono text-[9px] text-cyber-muted">
                <span>{activeTrends[0].date}</span>
                <span>Timeline Log (Recent)</span>
                <span>{activeTrends[activeTrends.length - 1].date}</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default Charts;
