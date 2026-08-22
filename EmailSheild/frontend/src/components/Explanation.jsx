import React from 'react';
import { Target, ShieldCheck, Compass, Settings, BookOpen, ChefHat } from 'lucide-react';

function Explanation() {
  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      
      {/* Visual Pipeline flow */}
      <div className="glass-panel p-6 md:p-8 space-y-5">
        <h3 className="text-base font-bold font-mono text-white flex items-center gap-2.5 uppercase tracking-widest border-b border-cyber-border/40 pb-3">
          <Settings className="text-cyber-cyan w-5 h-5 animate-spin" />
          End-to-End Security Classification Pipeline
        </h3>
        
        {/* Step-by-step horizontal flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          
          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2 relative">
            <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan font-bold font-mono px-2 py-0.5 rounded">STEP 1</span>
            <h5 className="font-bold text-sm text-white font-mono mt-1">Dataset</h5>
            <p className="text-xs text-cyber-muted leading-relaxed">Corpus of 1,200+ detailed Safe, Spam & Phishing templates.</p>
          </div>

          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2 relative">
            <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan font-bold font-mono px-2 py-0.5 rounded">STEP 2</span>
            <h5 className="font-bold text-sm text-white font-mono mt-1">Preprocess</h5>
            <p className="text-xs text-cyber-muted leading-relaxed">Stopword filtering, punctuation removal, Porter Stemming.</p>
          </div>

          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2 relative">
            <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan font-bold font-mono px-2 py-0.5 rounded">STEP 3</span>
            <h5 className="font-bold text-sm text-white font-mono mt-1">TF-IDF</h5>
            <p className="text-xs text-cyber-muted leading-relaxed">Transforms tokens into numerical importance vectors.</p>
          </div>

          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2 relative">
            <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan font-bold font-mono px-2 py-0.5 rounded">STEP 4</span>
            <h5 className="font-bold text-sm text-white font-mono mt-1">Naive Bayes</h5>
            <p className="text-xs text-cyber-muted leading-relaxed">Evaluates conditional joint probability curves.</p>
          </div>

          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2 relative">
            <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan font-bold font-mono px-2 py-0.5 rounded">STEP 5</span>
            <h5 className="font-bold text-sm text-white font-mono mt-1">Prediction</h5>
            <p className="text-xs text-cyber-muted leading-relaxed">Extracts maximum probability class and confidence.</p>
          </div>

          <div className="p-4 bg-cyber-bg border border-cyber-border rounded-lg text-center space-y-2 relative">
            <span className="text-[10px] bg-cyber-cyan/15 text-cyber-cyan font-bold font-mono px-2 py-0.5 rounded">STEP 6</span>
            <h5 className="font-bold text-sm text-white font-mono mt-1">Secure UI</h5>
            <p className="text-xs text-cyber-muted leading-relaxed">Highlights alert words, checks URLs, and renders logs.</p>
          </div>

        </div>
      </div>

      {/* Non-Technical Explanation (The Chef Hat Analogy) */}
      <div className="glass-panel p-6 md:p-8 border-l-4 border-l-cyber-violet">
        <div className="flex flex-col md:flex-row items-start gap-5">
          <div className="w-14 h-14 bg-cyber-violet/10 border border-cyber-violet/30 rounded-xl flex items-center justify-center shrink-0">
            <ChefHat className="text-cyber-violet w-8 h-8" />
          </div>
          <div className="space-y-4">
            <h4 className="text-lg md:text-xl font-extrabold font-mono text-white flex items-center gap-2">
              The Non-Technical Perspective: "The Chef & The Kitchens"
            </h4>
            <p className="text-base text-cyber-muted leading-relaxed">
              To a normal user, you can explain our machine learning as a culinary puzzle:
            </p>
            <p className="text-sm md:text-base text-cyber-muted leading-relaxed">
              Imagine we have three chefs: **Chef Safe** (cooks regular office syncs), **Chef Spam** (cooks cheap promotional brochures), and **Chef Phishing** (cooks dangerous credentials traps). Every chef has their own secret bucket of vocabulary ingredients that they use most frequently.
            </p>
            <p className="text-sm md:text-base text-cyber-muted leading-relaxed">
              When a new email enters the system, our AI acts as a food inspector. It looks at the words inside the message (the ingredients) and calculates: **"Whose kitchen is most likely to have cooked this meal?"**
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm md:text-base text-cyber-muted">
              <li>If the email has ingredients like <em>"verify"</em>, <em>"bank"</em>, and <em>"blocked"</em>, it's immediately identified as a dish from Chef Phishing's kitchen.</li>
              <li>If it's stuffed with <em>"lottery"</em>, <em>"winning"</em>, and <em>"free"</em>, it is cooked by Chef Spam.</li>
              <li>If it's made of <em>"sprint"</em>, <em>"agenda"</em>, and <em>"attached"</em>, it belongs to Chef Safe.</li>
            </ul>
            <p className="text-sm md:text-base text-cyber-muted leading-relaxed italic border-t border-cyber-border/40 pt-3">
              Why "Naive"? It's called "naive" because the AI is incredibly simple—it just counts the words like individual items in a shopping bag, completely ignoring human grammar rules. Yet, this simple word count math is remarkably accurate at catching hacker footprints!
            </p>
          </div>
        </div>
      </div>

      {/* Technical concepts split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Core NLP preprocessing */}
        <div className="glass-panel p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2.5 uppercase tracking-widest border-b border-cyber-border/40 pb-3">
            <BookOpen className="text-cyber-cyan w-5 h-5" />
            1. NLP Text Preprocessing
          </h3>
          
          <div className="space-y-4 text-sm md:text-base text-cyber-muted leading-relaxed">
            <p>
              Computers do not understand raw sentences. To train mathematical classifiers, we must refine text into a standardized sequence of features. Our preprocessor executes four key steps:
            </p>
            
            <div className="space-y-3.5 pt-2">
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded-xl">
                <span className="font-bold text-white font-mono block text-sm">A. Lowercase Standardization</span>
                <span className="text-xs md:text-sm text-cyber-muted">Converts all text to lower case so "Verify", "VERIFY", and "verify" represent the exact same feature in the database.</span>
              </div>
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded-xl">
                <span className="font-bold text-white font-mono block text-sm">B. Punctuation Striping</span>
                <span className="text-xs md:text-sm text-cyber-muted">Removes commas, exclamation marks, and symbols, ensuring characters like "urgent!" are parsed purely as the clean word "urgent".</span>
              </div>
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded-xl">
                <span className="font-bold text-white font-mono block text-sm">C. NLTK Stopwords Exclusion</span>
                <span className="text-xs md:text-sm text-cyber-muted">Purges common grammatical connectors (<em>the, is, and, off, of, to, in</em>) which occur frequently but carry zero semantic value for security.</span>
              </div>
              <div className="p-4 bg-cyber-bg border border-cyber-border rounded-xl">
                <span className="font-bold text-white font-mono block text-sm">D. Porter Stemmer mapping</span>
                <span className="text-xs md:text-sm text-cyber-muted">Strips word suffixes to get the root form (e.g. <em>suspended, suspending, suspension</em> all map to <strong>"suspend"</strong>). This shrinks high vocabulary lists.</span>
              </div>
            </div>
          </div>
        </div>

        {/* TF-IDF Vectorizer math */}
        <div className="glass-panel p-6 md:p-8 space-y-5">
          <h3 className="text-base font-bold font-mono text-white flex items-center gap-2.5 uppercase tracking-widest border-b border-cyber-border/40 pb-3">
            <Target className="text-cyber-cyan w-5 h-5" />
            2. TF-IDF Representation
          </h3>
          
          <div className="space-y-4 text-sm md:text-base text-cyber-muted leading-relaxed">
            <p>
              <strong>TF-IDF</strong> stands for <em>Term Frequency-Inverse Document Frequency</em>. It is a formula that evaluates how meaningful a word is to a document in a collection.
            </p>
            
            <div className="p-5 bg-cyber-bg border border-cyber-border rounded-xl font-mono space-y-3.5 text-white">
              <div className="border-b border-cyber-border pb-3">
                <span className="text-cyber-cyan block font-bold text-sm">A. Term Frequency (TF):</span>
                <span className="text-xs md:text-sm">TF(t, d) = (Count of term t in document d) / (Total terms in d)</span>
              </div>
              <div className="pt-1.5">
                <span className="text-cyber-cyan block font-bold text-sm">B. Inverse Document Frequency (IDF):</span>
                <span className="text-xs md:text-sm">IDF(t) = log(Total documents / Documents containing term t)</span>
              </div>
            </div>

            <p>
              **The Power of IDF:** Words like "the" appear in almost every document, so their IDF weight is 0. However, words like "lottery" or "routing" appear in very few documents, so their IDF weight is highly elevated.
            </p>
            <p>
              By multiplying TF x IDF, we calculate a score that automatically suppresses noise and elevates high-information cybersecurity triggers!
            </p>
          </div>
        </div>

      </div>

      {/* Bayes theorem math */}
      <div className="glass-panel p-6 md:p-8 space-y-5">
        <h3 className="text-base font-bold font-mono text-white flex items-center gap-2.5 uppercase tracking-widest border-b border-cyber-border/40 pb-3">
          <Compass className="text-cyber-cyan w-5 h-5" />
          3. Multinomial Naive Bayes Probability
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm md:text-base text-cyber-muted leading-relaxed">
          
          <div className="space-y-4">
            <p>
              The **Naive Bayes** classifier uses **Bayes' Theorem**, which is a way of finding the probability of an event given that other events have already happened:
            </p>
            <div className="p-5 bg-cyber-bg border border-cyber-border rounded-xl font-mono text-center text-white text-base font-bold shadow-inner">
              P(Class | Text) = [ P(Text | Class) × P(Class) ] / P(Text)
            </div>
            <p>
              In our email scanner:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>P(Class | Text)</strong>: Probability that an email is Phishing, given the preprocessed words inside it.</li>
              <li><strong>P(Text | Class)</strong>: Probability of seeing these specific words in known Phishing emails.</li>
              <li><strong>P(Class)</strong>: General probability of seeing a Phishing email (prior probability).</li>
            </ul>
          </div>

          <div className="space-y-4">
            <p>
              <strong>The "Naive" Independence Assumption:</strong>
            </p>
            <p>
              To calculate the joint probability of all words appearing in an email, the model makes a simplifying assumption: **every word's presence is completely independent of every other word.**
            </p>
            <p>
              This means:
              <br />
              <span className="font-mono text-white block mt-2 text-center p-3 bg-cyber-bg border border-cyber-border rounded-lg text-sm">
                P(w1, w2 | Class) = P(w1 | Class) × P(w2 | Class)
              </span>
            </p>
            <p>
              While human language is not independent (words regularly form phrases), this mathematical simplification is incredibly robust, requires almost zero memory, and makes training and prediction finish in milliseconds!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Explanation;
