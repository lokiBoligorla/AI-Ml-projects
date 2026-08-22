import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, ChevronDown, ChevronUp, Link as LinkIcon, Database } from 'lucide-react';

function HistoryList({ history }) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr + "Z"); // SQLite dates are stored as UTC, append Z
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center space-y-3 bg-cyber-bg/20 border border-cyber-border border-dashed rounded-xl">
        <Database className="text-cyber-muted/20 w-10 h-10" />
        <span className="text-sm text-cyber-muted font-mono font-bold uppercase tracking-widest">Database Registry Empty</span>
        <p className="text-xs text-cyber-muted max-w-sm leading-relaxed">
          Run your first security scan in the Threat Scanner terminal to populate these tables.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Dynamic log list */}
      <div className="space-y-4">
        {history.map((scan) => {
          const isExpanded = expandedId === scan.id;
          
          return (
            <div 
              key={scan.id} 
              className={`border transition-all duration-200 rounded-xl overflow-hidden ${
                isExpanded 
                  ? 'bg-cyber-bg/80 border-cyber-cyan/30' 
                  : 'bg-cyber-bg/30 border-cyber-border hover:border-cyber-border/80'
              }`}
            >
              
              {/* Collapsed Header grid */}
              <div 
                onClick={() => toggleExpand(scan.id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                
                {/* 1. Class type and timestamp */}
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
                    scan.prediction?.toLowerCase() === 'safe' 
                      ? 'bg-cyber-safe/10 border-cyber-safe/30 text-cyber-safe' 
                      : scan.prediction?.toLowerCase() === 'spam'
                        ? 'bg-cyber-spam/10 border-cyber-spam/30 text-cyber-spam'
                        : 'bg-cyber-phish/10 border-cyber-phish/30 text-cyber-phish'
                  }`}>
                    {scan.prediction?.toLowerCase() === 'safe' && <ShieldCheck className="w-6 h-6" />}
                    {scan.prediction?.toLowerCase() === 'spam' && <Clock className="w-6 h-6" />}
                    {scan.prediction?.toLowerCase() === 'phishing' && <AlertTriangle className="w-6 h-6" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-sm font-extrabold uppercase font-mono tracking-wider ${
                        scan.prediction?.toLowerCase() === 'safe' 
                          ? 'text-cyber-safe' 
                          : scan.prediction?.toLowerCase() === 'spam'
                            ? 'text-cyber-spam'
                            : 'text-cyber-phish'
                      }`}>
                        {scan.prediction?.toLowerCase() === 'safe' && 'SAFE / LEGIT'}
                        {scan.prediction?.toLowerCase() === 'spam' && 'SPAM'}
                        {scan.prediction?.toLowerCase() === 'phishing' && 'PHISHING'}
                      </span>
                      <span className="text-xs text-cyber-muted font-bold font-mono">({scan.confidence}% confidence)</span>
                    </div>
                    <span className="text-xs text-cyber-muted font-mono">{formatDate(scan.created_at)}</span>
                  </div>
                </div>

                {/* 2. Text Snippet */}
                <div className="flex-1 max-w-sm sm:max-w-md hidden lg:block">
                  <p className="text-sm text-cyber-muted truncate font-mono">
                    {scan.email_text.replace(/[\n\r]+/g, ' ')}
                  </p>
                </div>

                {/* 3. Indicators count & Expand button */}
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  
                  {/* Indicators */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-cyber-border text-cyber-muted border border-cyber-border/40 px-2.5 py-1 rounded font-mono" title={`${scan.keywords_detected.length} suspicious keywords detected`}>
                      {scan.keywords_detected.length} Keywords
                    </span>
                    
                    <span className="text-xs bg-cyber-border text-cyber-muted border border-cyber-border/40 px-2.5 py-1 rounded font-mono flex items-center gap-1" title={`${scan.urls_detected.length} URLs extracted`}>
                      <LinkIcon className="w-3 h-3" />
                      {scan.urls_detected.length} URLs
                    </span>
                  </div>

                  {/* Toggle arrow */}
                  <div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-cyber-cyan" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-cyber-muted" />
                    )}
                  </div>

                </div>

              </div>

              {/* Expanded details block */}
              {isExpanded && (
                <div className="p-5 border-t border-cyber-border/40 bg-cyber-card/30 space-y-5 animate-fadeIn">
                  
                  {/* Raw text */}
                  <div className="space-y-2">
                    <span className="text-xs text-cyber-muted uppercase tracking-widest font-bold font-mono">Raw Email Content:</span>
                    <pre className="p-5 bg-cyber-bg border border-cyber-border rounded-xl text-sm text-cyber-text font-mono leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap select-all">
                      {scan.email_text}
                    </pre>
                  </div>

                  {/* Risky words and links details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Detected keywords */}
                    <div className="space-y-2.5">
                      <span className="text-xs text-cyber-muted uppercase tracking-widest font-bold font-mono">Flagged Keywords:</span>
                      <div className="flex flex-wrap gap-2">
                        {scan.keywords_detected.length > 0 ? (
                          scan.keywords_detected.map((kw, i) => (
                            <span key={i} className="text-xs px-3 py-1 bg-cyber-phish/10 border border-cyber-phish/25 text-cyber-phish rounded uppercase font-semibold font-mono tracking-wider">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-cyber-safe font-mono uppercase tracking-wide">None flagged</span>
                        )}
                      </div>
                    </div>

                    {/* Extracted links */}
                    <div className="space-y-2.5">
                      <span className="text-xs text-cyber-muted uppercase tracking-widest font-bold font-mono">Extracted Links:</span>
                      <div className="space-y-2">
                        {scan.urls_detected.length > 0 ? (
                          scan.urls_detected.map((urlObj, i) => (
                            <div key={i} className="flex items-center justify-between gap-3 text-sm font-mono p-2.5 bg-cyber-bg rounded border border-cyber-border/30">
                              <span className="text-cyber-muted truncate break-all">{urlObj.url}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                                urlObj.is_suspicious 
                                  ? 'bg-cyber-phish/10 text-cyber-phish' 
                                  : 'bg-cyber-safe/10 text-cyber-safe'
                              }`}>
                                {urlObj.is_suspicious ? 'DANGER' : 'OK'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-cyber-muted font-mono">No hyperlinks found</span>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default HistoryList;
