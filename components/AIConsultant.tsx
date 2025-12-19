
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { DiagnosisResult } from '../types';

const AIConsultant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await geminiService.analyzeSymptoms(query);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-8 rounded-3xl text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fas fa-robot text-9xl -rotate-12"></i>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Ameer AI Assistant</h2>
          <p className="text-teal-50 max-w-lg opacity-90">
            Intelligent diagnostic support for your practice. Describe symptoms, clinical findings, or radiological notes for instant analysis.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Patient Case / Symptoms</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Patient reports sharp pain in lower right quadrant when consuming cold liquids. Visible swelling near tooth #30..."
          className="w-full h-32 p-4 rounded-xl border-slate-200 focus:ring-teal-500 focus:border-teal-500 resize-none text-slate-700"
        ></textarea>
        <button
          onClick={handleAnalyze}
          disabled={loading || !query}
          className="mt-4 w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <i className="fas fa-circle-notch fa-spin"></i>
          ) : (
            <i className="fas fa-sparkles"></i>
          )}
          <span>{loading ? 'Analyzing Case...' : 'Analyze with Ameer AI'}</span>
        </button>
      </div>

      {result && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-teal-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Diagnostic Suggestions</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              result.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
              result.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {result.riskLevel} Risk
            </span>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Clinical Analysis</h4>
              <p className="text-slate-700 leading-relaxed">{result.analysis}</p>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommended Steps</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <i className="fas fa-check-circle text-teal-500"></i>
                    <span className="text-sm text-slate-700 font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center text-xs text-slate-400">
            <i className="fas fa-info-circle mr-2"></i>
            Disclaimer: This analysis is AI-generated for clinical support only. Always verify findings with a professional exam.
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConsultant;
