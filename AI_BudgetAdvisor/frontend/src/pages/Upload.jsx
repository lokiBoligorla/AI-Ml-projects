import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sliders, 
  Wallet, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  Sparkles, 
  AlertTriangle,
  HelpCircle,
  PiggyBank,
  Check,
  Bot
} from 'lucide-react';

import GlassCard from '../components/GlassCard';

const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', desc: 'Canteens, Swiggy, grocery delivery', defaultVal: 5000 },
  { id: 'Hostel', label: 'Hostel & Rent', desc: 'Monthly stay, mess bills, utilities', defaultVal: 6000 },
  { id: 'Bills', label: 'Wifi & Phone Bills', desc: 'Fiber broadband, cellular recharges', defaultVal: 1500 },
  { id: 'Shopping', label: 'Shopping', desc: 'Amazon, Myntra, apparel & clothing', defaultVal: 3000 },
  { id: 'Transport', label: 'Transport & Travel', desc: 'Uber auto, Ola rides, fuel, tickets', defaultVal: 2000 },
  { id: 'Education', label: 'Education', desc: 'Textbooks, online courses, stationery', defaultVal: 1500 },
  { id: 'Entertainment', label: 'Entertainment', desc: 'Netflix, cinema tickets, weekend outings', defaultVal: 1500 },
  { id: 'Healthcare', label: 'Healthcare', desc: 'Pharmacies, medical checks, vitamins', defaultVal: 1000 },
  { id: 'Travel', label: 'Vacations & Trips', desc: 'Outstation flights, train tickets', defaultVal: 1500 },
  { id: 'Miscellaneous', label: 'Miscellaneous', desc: 'Kirana shop, room transfers, laundry', defaultVal: 1000 }
];

// Bulletproof Safe Currency Formatter to prevent any toLocaleString crashes
const safeFormat = (val) => {
  const num = Number(val);
  if (isNaN(num)) return "0";
  try {
    return num.toLocaleString('en-IN');
  } catch (e) {
    return num.toString();
  }
};

// React Error Boundary to catch and display any unexpected runtime errors on screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught a runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-neonRed/10 border border-neonRed/30 text-white space-y-4 shadow-neon-glow">
          <h3 className="text-xl font-bold text-neonRed flex items-center gap-2">
            <AlertTriangle size={24} />
            Profile Planner Render Error
          </h3>
          <p className="text-sm text-gray-300">
            An unexpected runtime crash occurred. Please share this technical stack trace to help resolve the issue:
          </p>
          <pre className="p-4 bg-black/40 rounded-xl font-mono text-xs text-neonRed overflow-x-auto select-all leading-relaxed border border-neonRed/20 max-h-60 overflow-y-auto">
            {this.state.error?.stack || this.state.error?.toString()}
          </pre>
          <div className="pt-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-neonBlue hover:shadow-neon-glow rounded-xl font-bold transition-all text-sm text-white"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const UploadContent = () => {
  const navigate = useNavigate();
  
  // Form state
  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState(30000);
  const [savingsGoal, setSavingsGoal] = useState(6000);
  const [categoryExpenses, setCategoryExpenses] = useState(
    CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.defaultVal }), {})
  );
  
  // Simulation and UI state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [error, setError] = useState('');
  
  const simulationSteps = [
    "Clearing out previous mock records & caches...",
    "Building fresh budgets for past & current months...",
    "Synthesizing high-fidelity 45-day transaction ledger...",
    "Injecting realistic risk anomalies in Shopping & Entertainment...",
    "Calculating live category spent variables...",
    "Fitting local Isolation Forest anomaly scoring model...",
    "Re-training ARIMA time-series forecasting curves...",
    "Calling Gemini AI model to synthesize smart recommendations...",
    "Finishing up database sync...",
    "Profile generated successfully!"
  ];

  // Dynamic calculations
  const remainingBudget = monthlyIncome - savingsGoal;
  const totalAllocated = Object.values(categoryExpenses).reduce((a, b) => a + Number(b), 0);
  const unallocated = remainingBudget - totalAllocated;
  const savingsPercent = monthlyIncome > 0 ? ((savingsGoal / monthlyIncome) * 100).toFixed(1) : 0;
  
  const handleCategoryChange = (catId, val) => {
    setCategoryExpenses(prev => ({
      ...prev,
      [catId]: Math.max(0, Number(val))
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (savingsGoal > monthlyIncome) {
        setError("Your savings target cannot exceed your monthly income!");
        return;
      }
      if (savingsGoal <= 0) {
        setError("Please set a positive target savings goal.");
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (unallocated < 0) {
        setError("Allocated categories exceed your remaining budget! Please reduce some allocations.");
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmitProfile = async () => {
    setIsSimulating(true);
    setError('');
    
    // Automatically balance unallocated budget if any remaining into Miscellaneous category
    let finalAllocations = { ...categoryExpenses };
    if (unallocated > 0) {
      finalAllocations['Miscellaneous'] = (finalAllocations['Miscellaneous'] || 0) + unallocated;
    }

    // Step through the loading indicators nicely (every 700ms) while API loads
    const timer = setInterval(() => {
      setSimulationIndex(prev => {
        if (prev < simulationSteps.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 700);

    try {
      await axios.post('/setup-financial-profile', {
        monthly_income: Number(monthlyIncome),
        savings_goal: Number(savingsGoal),
        category_expenses: finalAllocations
      });

      // Show completion state, wait a brief second, and redirect
      setSimulationIndex(simulationSteps.length - 1);
      clearInterval(timer);
      
      setTimeout(() => {
        setIsSimulating(false);
        navigate('/dashboard');
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      clearInterval(timer);
      setIsSimulating(false);
      setError(err.response?.data?.detail || "An unexpected error occurred while compiling your profile. Please try again.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title block */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Financial Profile Planner
        </h2>
        <p className="text-gray-300 text-sm mt-1">
          Customize your income details and variable expenses. We will automatically generate a dynamic ledger, fit our ML models, and curate custom AI recommendations.
        </p>
      </div>

      {/* Progress timeline bar */}
      <div className="flex items-center justify-between px-2 py-4">
        {[
          { num: 1, label: "Core Profile" },
          { num: 2, label: "Variable Expenses" },
          { num: 3, label: "Review & Build" }
        ].map((s) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold border text-sm transition-all
                ${step === s.num 
                  ? 'bg-neonBlue border-neonBlue text-white shadow-neon-glow' 
                  : step > s.num
                  ? 'bg-neonGreen border-neonGreen text-white'
                  : 'bg-black/40 border-glassBorder text-gray-400'
                }
              `}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-sm font-semibold tracking-wide hidden sm:inline ${step >= s.num ? 'text-white' : 'text-gray-300'}`}>
                {s.label}
              </span>
            </div>
            {s.num < 3 && (
              <div className={`
                h-0.5 mx-4 flex-1 transition-all rounded-full
                ${step > s.num ? 'bg-neonGreen' : 'bg-glassBorder'}
              `} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isSimulating ? (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Step 1: Core Financial Parameters */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-8">
                  <GlassCard title="Let's build your financial profile core" hoverEffect={false}>
                    <div className="space-y-6 py-2">
                      {/* Income Slider & Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-white flex items-center gap-2">
                            <Wallet size={16} className="text-neonBlue" />
                            Monthly Net Income
                          </label>
                          <span className="text-neonBlue font-black text-lg">
                            ₹{safeFormat(monthlyIncome)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">Enter your core monthly disposable income or stipend details.</p>
                        <div className="flex gap-4 items-center">
                          <input 
                            type="range"
                            min="10000"
                            max="200000"
                            step="5000"
                            value={monthlyIncome}
                            onChange={(e) => {
                              setMonthlyIncome(Number(e.target.value));
                              setError('');
                            }}
                            className="flex-1 accent-neonBlue h-1.5 bg-black/40 rounded-lg cursor-pointer"
                          />
                          <input 
                            type="number"
                            value={monthlyIncome}
                            onChange={(e) => {
                              setMonthlyIncome(Math.max(0, Number(e.target.value)));
                              setError('');
                            }}
                            className="w-28 px-3 py-1.5 text-right font-mono font-bold bg-black/40 border border-glassBorder rounded-xl text-white focus:border-neonBlue focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Savings Slider & Input */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-bold text-white flex items-center gap-2">
                            <PiggyBank size={16} className="text-neonPurple" />
                            Target Monthly Savings Goal
                          </label>
                          <span className="text-neonPurple font-black text-lg">
                            ₹{safeFormat(savingsGoal)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">Specify your ideal savings target. A standard rule of thumb is 20% of your net income.</p>
                        <div className="flex gap-4 items-center">
                          <input 
                            type="range"
                            min="1000"
                            max={Math.min(monthlyIncome, 100000)}
                            step="1000"
                            value={savingsGoal}
                            onChange={(e) => {
                              setSavingsGoal(Number(e.target.value));
                              setError('');
                            }}
                            className="flex-1 accent-neonPurple h-1.5 bg-black/40 rounded-lg cursor-pointer"
                          />
                          <input 
                            type="number"
                            value={savingsGoal}
                            onChange={(e) => {
                              setSavingsGoal(Math.max(0, Number(e.target.value)));
                              setError('');
                            }}
                            className="w-28 px-3 py-1.5 text-right font-mono font-bold bg-black/40 border border-glassBorder rounded-xl text-white focus:border-neonPurple focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Dashboard Summary Panel Side */}
                <div className="md:col-span-4">
                  <GlassCard title="Simulated Allocations Map" className="h-full" hoverEffect={false}>
                    <div className="space-y-6 py-1">
                      <div className="bg-black/20 p-4 rounded-xl border border-glassBorder space-y-4">
                        <div>
                          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Remaining for Expenses</span>
                          <span className={`text-2xl font-black block mt-1 ${remainingBudget > 0 ? 'text-neonGreen' : 'text-neonRed font-black'}`}>
                            ₹{safeFormat(remainingBudget)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Savings Ratio Target</span>
                          <span className="text-lg font-black text-neonPurple block mt-0.5">
                            {savingsPercent}% <span className="text-xs text-gray-300 font-normal">of total net income</span>
                          </span>
                        </div>
                      </div>

                      {/* Small visual recommendation alert */}
                      <div className="flex gap-2 p-3 text-xs rounded-xl bg-neonBlue/10 border border-neonBlue/30 text-gray-300">
                        <Sparkles size={16} className="text-neonBlue shrink-0" />
                        <span>Based on your ₹{safeFormat(monthlyIncome)} income, targeting ₹{safeFormat(savingsGoal)} leaves ₹{safeFormat(remainingBudget)} to divide among variable categories.</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* Step 2: Category sliders */}
            {step === 2 && (
              <div className="space-y-6">
                <GlassCard hoverEffect={false}>
                  {/* Category allocation live banner */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl bg-black/20 border border-glassBorder mb-6 gap-4">
                    <div>
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-widest block">Allocated Expenses Budget</span>
                      <span className="text-xl font-black text-white mt-1 block">
                        ₹{safeFormat(totalAllocated)} / ₹{safeFormat(remainingBudget)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-300 uppercase tracking-widest block">Unallocated Left</span>
                      <span className={`text-xl font-black block mt-1 ${unallocated >= 0 ? 'text-neonGreen shadow-neon-glow' : 'text-neonRed font-black'}`}>
                        ₹{safeFormat(unallocated)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 mb-6">
                    Adjust allocations for each categories to fit your lifestyle. Unallocated funds will be credited to Miscellaneous naturally.
                  </p>

                  {/* Grid of categories with nice controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-bold text-white block">{cat.label}</span>
                            <span className="text-[10px] text-gray-300 block">{cat.desc}</span>
                          </div>
                          <span className="text-neonBlue font-mono font-bold text-sm">
                            ₹{safeFormat(categoryExpenses[cat.id] || 0)}
                          </span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <input 
                            type="range"
                            min="0"
                            max={Math.max(10000, remainingBudget)}
                            step="500"
                            value={categoryExpenses[cat.id] || 0}
                            onChange={(e) => {
                              handleCategoryChange(cat.id, e.target.value);
                              setError('');
                            }}
                            className="flex-1 accent-neonBlue h-1 bg-black/40 rounded-lg cursor-pointer"
                          />
                          <input 
                            type="number"
                            value={categoryExpenses[cat.id] || 0}
                            onChange={(e) => {
                              handleCategoryChange(cat.id, e.target.value);
                              setError('');
                            }}
                            className="w-20 px-2 py-1 text-right font-mono text-xs bg-black/40 border border-glassBorder rounded-lg text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {/* Step 3: Final confirmation review */}
            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-7">
                  <GlassCard title="Verify Your Settings Agenda" hoverEffect={false}>
                    <div className="space-y-4 py-2">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-glassBorder">
                          <span className="text-sm text-gray-300 font-semibold">Monthly Income</span>
                          <span className="text-white font-mono font-black">₹{safeFormat(monthlyIncome)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-glassBorder">
                          <span className="text-sm text-gray-300 font-semibold">Target Savings</span>
                          <span className="text-neonPurple font-mono font-black">₹{safeFormat(savingsGoal)} ({savingsPercent}%)</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-glassBorder">
                          <span className="text-sm text-gray-300 font-semibold">Allocated Expenses</span>
                          <span className="text-neonBlue font-mono font-black">₹{safeFormat(totalAllocated)}</span>
                        </div>

                        {unallocated > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-glassBorder text-neonGreen">
                            <span className="text-sm font-semibold">Assigned to Misc</span>
                            <span className="font-mono font-black">₹{safeFormat(unallocated)}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center py-2 border-b border-glassBorder">
                          <span className="text-sm text-gray-300 font-semibold">Simulated Transaction Depth</span>
                          <span className="text-white font-bold">~100 Transactions (45 Days)</span>
                        </div>
                      </div>

                      <div className="flex gap-3 p-4 rounded-xl bg-neonPurple/5 border border-neonPurple/20 text-xs text-gray-300 leading-normal">
                        <Bot size={20} className="text-neonPurple shrink-0 mt-0.5" />
                        <span><strong>TaskFlow AI Engine Notice:</strong> Clicking Apply will automatically rebuild your financial charts, seed anomalies, feed the isolation forest model, and update recommendations tailored exactly to these parameters.</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                <div className="md:col-span-5 flex flex-col justify-between">
                  <GlassCard title="Dynamic Synthesis Overview" className="h-full flex flex-col justify-between" hoverEffect={false}>
                    <div className="space-y-4 py-1">
                      <p className="text-xs text-gray-300">
                        Our model seeds realistic expenditures over a 45-day history. This includes custom descriptions, payment channels, variable dates, and category margins.
                      </p>

                      <div className="bg-black/30 p-3 rounded-xl border border-glassBorder space-y-2">
                        <span className="text-xs font-bold text-gray-300 block uppercase tracking-wider">Seeded Warning Monitors</span>
                        <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                          <li>Severe Outlier Shopping Overrun</li>
                          <li>Luxury Weekend Entertainment Surcharge</li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        onClick={handleSubmitProfile}
                        className="w-full py-4 bg-gradient-to-r from-neonBlue to-neonPurple hover:shadow-neon-glow hover:brightness-110 active:scale-[0.99] text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm tracking-widest uppercase"
                      >
                        <Sparkles size={16} />
                        <span>Apply & Generate Profile</span>
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            )}

            {/* Error notifications */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-neonRed/10 border border-neonRed/30 text-neonRed text-sm flex items-start gap-2 max-w-4xl mx-auto"
              >
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Navigational controls */}
            <div className="flex justify-between items-center pt-4 border-t border-glassBorder">
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="px-5 py-3 border border-glassBorder hover:border-white/20 bg-white/5 text-gray-300 font-bold rounded-xl hover:text-white transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <ChevronLeft size={18} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-neonBlue hover:shadow-neon-glow text-white font-bold rounded-xl transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </button>
              ) : (
                <div />
              )}
            </div>
          </motion.div>
        ) : (
          /* State-of-the-art interactive animated simulation screen! */
          <motion.div
            key="simulation-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto"
          >
            <GlassCard className="py-12 px-8 text-center space-y-8" hoverEffect={false}>
              {/* Spinner */}
              <div className="relative w-24 h-24 mx-auto">
                <Loader2 size={96} className="text-neonBlue animate-spin opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={32} className="text-neonPurple animate-pulse" />
                </div>
              </div>

              {/* Progress Steps Info */}
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight text-white animate-pulse">
                  Synthesizing Profile...
                </h3>
                <p className="text-sm font-semibold text-neonBlue h-6 tracking-wide">
                  {simulationSteps[simulationIndex]}
                </p>
              </div>

              {/* Simulated progress checklist */}
              <div className="text-left bg-black/30 rounded-2xl p-6 border border-glassBorder space-y-2 max-w-sm mx-auto">
                {simulationSteps.slice(0, 8).map((simLabel, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <div className={`
                      w-4 h-4 rounded-full flex items-center justify-center shrink-0 border
                      ${simulationIndex > idx 
                        ? 'bg-neonGreen border-neonGreen text-white' 
                        : simulationIndex === idx 
                        ? 'border-neonBlue animate-pulse bg-neonBlue/10'
                        : 'border-glassBorder text-gray-500 bg-black/10'
                      }
                    `}>
                      {simulationIndex > idx && <Check size={10} />}
                    </div>
                    <span className={`
                      truncate transition-all duration-200
                      ${simulationIndex > idx 
                        ? 'text-gray-300 line-through' 
                        : simulationIndex === idx 
                        ? 'text-white font-bold'
                        : 'text-gray-500'
                      }
                    `}>
                      {simLabel.replace("...", "")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action notice */}
              <p className="text-[10px] text-gray-300">
                Please stand by. We are generating natural simulated UPI logs and training ML weights.
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Upload = () => {
  return (
    <ErrorBoundary>
      <UploadContent />
    </ErrorBoundary>
  );
};

export default Upload;
