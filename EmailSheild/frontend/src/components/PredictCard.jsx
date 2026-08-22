import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, CheckCircle, HelpCircle, Link as LinkIcon, RefreshCw, Layers } from 'lucide-react';

const API_BASE = "http://127.0.0.1:5000/api";

const PRESETS = {
  safe: {
    subject: "Project Update: Task list and timeline",
    body: "Hi team,\n\nHere is the updated timeline for our upcoming product launch. I've finished the core backend refactoring and updated the task board in the workspace.\n\nPlease review the attached sprint spreadsheet before our weekly team sync meeting tomorrow at 10:00 AM. Let me know if you have any questions or additions to the action items.\n\nBest regards,\nJohn"
  },
  spam: {
    subject: "Double your income in just 10 days! GUARANTEED",
    body: "GET RICH QUICK! Secure your financial freedom today!\n\nEarn cash fast with our revolutionary passive income system! Our special method is guaranteed to double your income in less than 2 weeks with minimal effort. Win big lottery cash prizes and claim your free trial bonus today!\n\nCall us today at +1-800-459-9023 to save up to $10,000!\nTo unsubscribe, click the link below."
  },
  phishing: {
    subject: "URGENT: Your bank account has been temporarily suspended",
    body: "Dear Customer,\n\nWe detected an unauthorized login attempt to your online banking account from a suspicious IP address. For your security, we have temporarily blocked your card and restricted withdrawals.\n\nACTION REQUIRED: To verify your identity and restore access, you must immediately confirm your billing details and update your credentials by clicking the link below:\n\nhttp://secure-bank-login-verify-update.com/signin\n\nFailure to complete identity verification within 24 hours will result in permanent account suspension.\n\nReference ID: REF-901428\nSincerely,\nSecurity Verification Department"
  }
};

function PredictCard({ onScanCompleted }) {
  const [emailText, setEmailText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePreset = (type) => {
    const preset = PRESETS[type];
    setEmailText(`Subject: ${preset.subject}\n\n${preset.body}`);
    setResult(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!emailText.trim()) {
      setError("Please paste email content first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_text: emailText })
      });
      
      if (!res.ok) {
        throw new Error("Server responded with an error.");
      }
      
      const data = await res.json();
      setResult(data);
      if (onScanCompleted) onScanCompleted();
    } catch (err) {
      setError("Threat analysis failed. Ensure backend Flask server is running on http://127.0.0.1:5000.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to highlight keywords in raw text for visual display
  const renderHighlightedText = (text, keywords) => {
    if (!keywords || keywords.length === 0) return text;
    
    // Sort keywords by length descending to match longer strings first
    const sortedKws = [...keywords].sort((a, b) => b.length - a.length);
    
    let html = text;
    // Escape standard HTML tags in raw email to prevent breaking DOM
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    sortedKws.forEach((kw) => {
      // Find case-insensitive keyword and surround with highlight tag
      const regex = new RegExp(`\\b(${kw})\\b`, "gi");
      html = html.replace(regex, `<span class="highlight-risk">$1</span>`);
    });
    
    return <div className="whitespace-pre-wrap font-sans text-[15px] md:text-base text-cyber-text leading-8 tracking-wide font-medium" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-8">
      
      {/* Input panel */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        
        {/* Preset selections */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyber-border/40">
          <span className="text-sm text-cyber-muted font-bold font-mono tracking-widest uppercase">Quick Load Simulation Presets:</span>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => handlePreset('safe')}
              className="px-4 py-2 text-sm bg-cyber-safe/10 border border-cyber-safe/30 text-cyber-safe hover:bg-cyber-safe/25 font-bold rounded-lg transition-all cursor-pointer"
            >
              Safe Sample
            </button>
            <button
              onClick={() => handlePreset('spam')}
              className="px-4 py-2 text-sm bg-cyber-spam/10 border border-cyber-spam/30 text-cyber-spam hover:bg-cyber-spam/25 font-bold rounded-lg transition-all cursor-pointer"
            >
              Spam Sample
            </button>
            <button
              onClick={() => handlePreset('phishing')}
              className="px-4 py-2 text-sm bg-cyber-phish/10 border border-cyber-phish/30 text-cyber-phish hover:bg-cyber-phish/25 font-bold rounded-lg transition-all cursor-pointer"
            >
              Phishing Sample
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-sm text-cyber-muted uppercase tracking-widest font-mono font-bold">Email Body Console:</label>
          <textarea
            value={emailText}
            onChange={(e) => { setEmailText(e.target.value); setError(null); }}
            placeholder="Paste raw email header and text body here to verify legitimacy..."
            className="w-full h-64 bg-cyber-bg border border-cyber-border focus:border-cyber-cyan/50 focus:outline-none rounded-xl p-5 text-cyber-text font-mono text-base leading-relaxed tracking-wide resize-none placeholder:text-cyber-muted/30"
          ></textarea>
        </div>

        {/* Scan Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {error ? (
            <p className="text-sm text-cyber-phish font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 animate-bounce shrink-0" />
              {error}
            </p>
          ) : (
            <p className="text-sm text-cyber-muted leading-relaxed max-w-xl">
              Classification includes Heuristics URL checks, risky keyword scans, and full Bayesian natural language vectors processing.
            </p>
          )}
          
          <button
            onClick={handleScan}
            disabled={loading}
            className="px-8 py-3.5 bg-cyber-cyan hover:bg-cyber-cyan/85 disabled:bg-cyber-border text-cyber-bg font-extrabold font-mono text-base rounded-lg transition-all shadow-neon-cyan flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                SCANNING TELEMETRY...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-cyber-bg" />
                RUN SAFETY SHIELD
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading telemetry simulation */}
      {loading && (
        <div className="glass-panel p-8 md:p-12 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="w-12 h-12 text-cyber-cyan animate-spin" />
          <div className="text-center space-y-2">
            <h4 className="text-base font-extrabold font-mono text-white tracking-widest animate-pulse">EXTRACTING WORD VECTORS...</h4>
            <p className="text-sm text-cyber-muted max-w-md leading-relaxed">
              Computing vocabulary indices, executing stemmed token calculations, and scanning links for domain mismatches.
            </p>
          </div>
        </div>
      )}

      {/* Results Deck */}
      {result && (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Classification outcome gauge header */}
          <div className={`glass-panel p-6 md:p-8 border-l-4 ${
            result.prediction?.toLowerCase() === 'safe' 
              ? 'border-l-cyber-safe border-cyber-safe/20 shadow-neon-safe/10' 
              : result.prediction?.toLowerCase() === 'spam'
                ? 'border-l-cyber-spam border-cyber-spam/20 shadow-neon-spam/10'
                : 'border-l-cyber-phish border-cyber-phish/20 shadow-neon-phish/10'
          }`}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Left text */}
              <div className="space-y-3 flex-1 text-center lg:text-left">
                <span className="text-xs text-cyber-muted uppercase tracking-widest font-mono font-bold">SCAN THREAT EVALUATION SUCCESS</span>
                <h3 className="text-2xl md:text-3xl font-extrabold flex items-center justify-center lg:justify-start gap-2.5 font-mono">
                  CLASSIFICATION: 
                  <span className={`uppercase font-black ${
                    result.prediction?.toLowerCase() === 'safe' 
                      ? 'text-cyber-safe' 
                      : result.prediction?.toLowerCase() === 'spam'
                        ? 'text-cyber-spam'
                        : 'text-cyber-phish'
                  }`}>
                    {result.prediction?.toLowerCase() === 'safe' && 'Safe / Legitimate'}
                    {result.prediction?.toLowerCase() === 'spam' && 'Spam Campaign'}
                    {result.prediction?.toLowerCase() === 'phishing' && 'Phishing Attempt'}
                  </span>
                </h3>
                <p className="text-sm md:text-base text-cyber-muted max-w-2xl leading-relaxed">
                  {result.prediction?.toLowerCase() === 'safe' && "This email shows clean professional patterns. No dangerous redirects or credential extraction keywords were detected."}
                  {result.prediction?.toLowerCase() === 'spam' && "This email contains aggressive promotional vocabulary or unsolicited offers. Model flagged high density of commercial counts."}
                  {result.prediction?.toLowerCase() === 'phishing' && "CRITICAL THREAT: This message exhibits classic credential-harvesting indicators or severe urgency keywords combined with dangerous links."}
                </p>
              </div>

              {/* Right Radial Safety Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                
                {/* SVG Radial circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className="stroke-cyber-border fill-none"
                    strokeWidth="8"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    className={`fill-none transition-all duration-1000 ${
                      result.prediction?.toLowerCase() === 'safe' 
                        ? 'stroke-cyber-safe safe-glow' 
                        : result.prediction?.toLowerCase() === 'spam'
                          ? 'stroke-cyber-spam spam-glow'
                          : 'stroke-cyber-phish phish-glow'
                    }`}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - result.confidence / 100)}`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                  <span className="text-3xl font-extrabold font-mono text-white leading-none">
                    {Math.round(result.confidence)}<span className="text-sm">%</span>
                  </span>
                  <span className="text-[10px] text-cyber-muted font-black uppercase tracking-wider font-sans">
                    Confidence
                  </span>
                </div>

              </div>

            </div>
          </div>

          {/* Double deck split for keyword highlighting and URLs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Deck: Highlighted Content */}
            <div className="glass-panel p-6 md:p-8 space-y-6">
              <h4 className="font-extrabold text-base text-white font-mono flex items-center gap-2 border-b border-cyber-border/40 pb-3">
                <Sparkles className="text-cyber-cyan w-5 h-5" />
                Interactive Keyword Highlight Pane
              </h4>
              
              <div className="p-5 bg-cyber-bg border border-cyber-border rounded-xl max-h-96 overflow-y-auto font-sans scrollbar">
                {renderHighlightedText(result.email_text, result.keywords_detected)}
              </div>
              
              <div className="space-y-3">
                <span className="text-xs text-cyber-muted uppercase font-black tracking-widest font-mono">Flagged suspicious words:</span>
                <div className="flex flex-wrap gap-2.5">
                  {result.keywords_detected.length > 0 ? (
                    result.keywords_detected.map((kw, i) => (
                      <span key={i} className="text-xs px-3.5 py-1.5 bg-cyber-phish/10 border border-cyber-phish/35 text-cyber-phish rounded uppercase font-bold font-mono tracking-wider">
                        {kw}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-cyber-safe flex items-center gap-1.5 font-bold font-mono">
                      <CheckCircle className="w-4 h-4" /> No pre-compiled suspicious terms flagged.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Deck: URL Inspection */}
            <div className="glass-panel p-6 md:p-8 space-y-6">
              <h4 className="font-extrabold text-base text-white font-mono flex items-center gap-2 border-b border-cyber-border/40 pb-3">
                <LinkIcon className="text-cyber-cyan w-5 h-5" />
                URL Redirect Scanner
              </h4>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {result.urls_detected.length > 0 ? (
                  result.urls_detected.map((urlObj, i) => (
                    <div 
                      key={i} 
                      className={`p-4 md:p-5 bg-cyber-bg border rounded-xl space-y-3 transition-all ${
                        urlObj.is_suspicious 
                          ? 'border-cyber-phish/40 hover:border-cyber-phish/60' 
                          : 'border-cyber-border hover:border-cyber-border/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm text-white font-mono break-all font-semibold select-all leading-relaxed">
                          {urlObj.url}
                        </span>
                        
                        <span className={`text-[10px] px-2.5 py-1 font-bold uppercase tracking-wider rounded font-mono shrink-0 ${
                          urlObj.is_suspicious 
                            ? 'bg-cyber-phish/10 text-cyber-phish border border-cyber-phish/30 animate-pulse' 
                            : 'bg-cyber-safe/10 text-cyber-safe border border-cyber-safe/30'
                        }`}>
                          {urlObj.is_suspicious ? 'DANGER' : 'SECURE'}
                        </span>
                      </div>
                      
                      {urlObj.is_suspicious && (
                        <div className="space-y-2 pt-2 border-t border-cyber-border/30">
                          <span className="text-[10px] text-cyber-muted font-black uppercase tracking-widest font-mono">Threat reasons:</span>
                          <ul className="list-disc pl-5 space-y-1.5">
                            {urlObj.reasons.map((r, ri) => (
                              <li key={ri} className="text-xs text-cyber-phish/95 font-sans leading-relaxed">
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-center space-y-2 bg-cyber-bg/40 border border-cyber-border border-dashed rounded-xl">
                    <LinkIcon className="text-cyber-muted/30 w-10 h-10" />
                    <span className="text-sm text-cyber-muted font-mono font-bold uppercase tracking-widest">No Hyperlinks Detected</span>
                    <p className="text-xs text-cyber-muted max-w-[250px] leading-relaxed">
                      This email contains no hyperlink anchors or raw web URLs.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* AI explainability statistics section */}
          <div className="glass-panel p-6 md:p-8 space-y-5">
            <h4 className="font-extrabold text-base text-white font-mono flex items-center gap-2 border-b border-cyber-border/40 pb-3">
              <Layers className="text-cyber-cyan w-5 h-5" />
              Bayesian Token Contribution Breakdown (Explainability)
            </h4>
            
            <div className="space-y-5">
              <p className="text-sm text-cyber-muted leading-relaxed">
                The chart below lists the preprocessed tokens (stemmed dictionary words) from this specific email that had the absolute highest impact on the Naive Bayes probability formula. A higher score means the word strongly pushed the classifier towards the predicted label.
              </p>
              
              {result.explanations.length > 0 ? (
                <div className="space-y-5 pt-2">
                  {result.explanations.map((exp, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-sans font-medium">
                        <span className="text-white font-semibold">"{exp.token}" <span className="text-xs text-cyber-muted font-normal">(stemmed)</span></span>
                        <span className="text-cyber-cyan font-bold font-mono">{exp.percentage}% contribution</span>
                      </div>
                      
                      {/* Bar tracker */}
                      <div className="h-3 bg-cyber-bg border border-cyber-border rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            result.prediction?.toLowerCase() === 'safe' 
                              ? 'bg-cyber-safe' 
                              : result.prediction?.toLowerCase() === 'spam'
                                ? 'bg-cyber-spam'
                                : 'bg-cyber-phish'
                          }`}
                          style={{ width: `${exp.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-cyber-bg/40 border border-cyber-border rounded-xl text-center text-sm text-cyber-muted font-mono">
                  No vocabulary matches. The email might contain only common NLTK stopwords.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default PredictCard;
