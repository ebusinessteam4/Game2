import { useState } from 'react';
import { AppState, INTENTIONS } from '../types';
import { analyzeFlow } from '../services/ai';
import { ArrowLeft, ArrowRight, Loader2, User, Target } from 'lucide-react';

export default function StepTimeline({ state, updateState, onNext, onPrev }: any) {
  const [loading, setLoading] = useState(false);

  const handleIntentionChange = (id: string, intention: string) => {
    const newUtterances = state.utterances.map((u: any) => 
      u.id === id ? { ...u, intention } : u
    );
    updateState({ utterances: newUtterances });
  };

  const handleAnalyzeFlow = async () => {
    setLoading(true);
    try {
      const result = await analyzeFlow(state.utterances, state.analyzer, state.target);
      updateState({
        personaAnalysis: result.personaAnalysis,
        relationship: result.relationship
      });
      onNext();
    } catch (error) {
      console.error(error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">말 조각 분석</h2>
        <p className="text-gray-600">AI가 분석한 대화 타임라인입니다. 의도를 수정하거나 분석 대상을 지정하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <User size={16} className="text-indigo-500" /> 분석가 (나)
          </label>
          <select 
            value={state.analyzer}
            onChange={(e) => updateState({ analyzer: e.target.value })}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">선택하세요</option>
            {state.speakers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Target size={16} className="text-rose-500" /> 분석 대상 (상대방)
          </label>
          <select 
            value={state.target}
            onChange={(e) => updateState({ target: e.target.value })}
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">선택하세요</option>
            {state.speakers.map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto p-6 space-y-4">
          {state.utterances.map((u: any, index: number) => (
            <div key={u.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                {u.speaker.slice(0, 2)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-900">{u.speaker}</span>
                  <select 
                    value={u.intention}
                    onChange={(e) => handleIntentionChange(u.id, e.target.value)}
                    className="text-xs p-1.5 bg-white border border-gray-300 rounded text-gray-700 outline-none focus:border-indigo-500"
                  >
                    {INTENTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{u.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} /> 이전
        </button>
        <button 
          onClick={handleAnalyzeFlow}
          disabled={!state.analyzer || !state.target || loading}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : '흐름 분석하기'}
          {!loading && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
