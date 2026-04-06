import { useState } from 'react';
import { AppState } from '../types';
import { applyAnalysis } from '../services/ai';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, MessageSquare } from 'lucide-react';

const TOPICS = ["승패 판세", "기여도 분석", "갈등 원인", "감정 변화", "주도권 분석"];

export default function StepAnalysis({ state, updateState, onNext, onPrev }: any) {
  const [loading, setLoading] = useState(false);

  const handleTopicSelect = async (topic: string) => {
    updateState({ appliedTopic: topic });
    setLoading(true);
    try {
      const result = await applyAnalysis(state.utterances, state.analyzer, state.target, topic);
      updateState({ 
        appliedResult: {
          corePieceId: state.utterances[result.corePieceIndex]?.id,
          explanation: result.explanation
        }
      });
    } catch (error) {
      console.error(error);
      alert("응용 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSimulation = () => {
    if (state.simulationMode === 'continue') {
      const history = state.utterances.slice(0, state.simulationStartPoint + 1).map((u: any) => ({
        role: u.speaker === state.analyzer ? 'user' : 'model',
        text: u.text
      }));
      updateState({ chatHistory: history });
    } else {
      updateState({ chatHistory: [] });
    }
    onNext();
  };

  const targetUtterances = state.utterances.filter((u: any) => u.speaker === state.target);
  const intentionCounts = targetUtterances.reduce((acc: any, u: any) => {
    acc[u.intention] = (acc[u.intention] || 0) + 1;
    return acc;
  }, {});
  const topIntentions = Object.entries(intentionCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">분석 결과</h2>
        <p className="text-gray-600">페르소나와 관계를 확인하고, 원하는 주제로 심층 분석을 진행하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" /> 
            {state.target}의 페르소나
          </h3>
          
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">주요 말 구조 (Top 3)</h4>
            <div className="flex flex-wrap gap-2">
              {topIntentions.map(([intention, count]: any, idx) => (
                <div key={intention} className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm font-medium border border-amber-100">
                  <span className="text-amber-600 font-bold">{idx + 1}위</span>
                  <span>{intention}</span>
                  <span className="text-amber-600/70 text-xs">({count}회)</span>
                </div>
              ))}
              {topIntentions.length === 0 && <span className="text-sm text-gray-400">데이터 없음</span>}
            </div>
          </div>

          {state.personaAnalysis && (
            <>
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">성향 척도</h4>
                {state.personaAnalysis.traits.map((trait: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{trait.name}</span>
                      <span className="text-gray-500">{trait.value}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${trait.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-2">
                <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">종합 요약</h4>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                  {state.personaAnalysis.summary}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-500" /> 
            관계 및 상황 추측
          </h3>
          <textarea 
            value={state.relationship}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                updateState({ relationship: e.target.value });
              }
            }}
            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            placeholder="상황을 수정하거나 추가 디테일을 제공하세요 (최대 300자)"
          />
          <div className="text-right text-xs text-gray-400">{state.relationship.length} / 300</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="font-bold text-gray-900">응용 분석 주제 선택</h3>
        <div className="flex flex-wrap gap-3">
          {TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => handleTopicSelect(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                state.appliedTopic === topic 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8 text-indigo-600">
            <Loader2 className="animate-spin" size={32} />
          </div>
        )}

        {state.appliedResult && !loading && (
          <div className="mt-6 p-5 bg-indigo-50 rounded-lg border border-indigo-100 space-y-4">
            <h4 className="font-bold text-indigo-900">핵심 말 조각 분석 결과</h4>
            <p className="text-sm text-indigo-800 leading-relaxed">{state.appliedResult.explanation}</p>
            
            <div className="mt-4 max-h-64 overflow-y-auto space-y-2 pr-2">
              {state.utterances.map((u: any, i: number) => {
                const isCore = u.id === state.appliedResult.corePieceId;
                return (
                  <div 
                    key={u.id} 
                    className={`p-3 rounded-lg text-sm ${
                      isCore ? 'bg-white border-2 border-indigo-400 shadow-sm' : 'bg-white/50 border border-transparent opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{u.speaker}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isCore ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                        {u.intention}
                      </span>
                      {isCore && <span className="text-xs font-bold text-rose-500 ml-auto">핵심 조각</span>}
                    </div>
                    <p className="text-gray-800">{u.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="font-bold text-gray-900">시뮬레이션 채팅 준비 완료</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input 
              type="radio" 
              name="simMode" 
              checked={state.simulationMode === 'continue'}
              onChange={() => updateState({ simulationMode: 'continue' })}
              className="w-5 h-5 text-indigo-600"
            />
            <div>
              <div className="font-semibold text-gray-900">입력된 데이터 타임라인 중간 지점부터 이어 평행세계 탐험</div>
              <p className="text-sm text-gray-500">선택한 지점까지의 대화가 입력된 상태로 시작합니다.</p>
            </div>
          </label>
          
          {state.simulationMode === 'continue' && (
            <div className="ml-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">시작 지점 선택</label>
              <select 
                value={state.simulationStartPoint}
                onChange={(e) => updateState({ simulationStartPoint: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                {state.utterances.map((u: any, i: number) => (
                  <option key={u.id} value={i}>
                    [{i+1}] {u.speaker}: {u.text.substring(0, 30)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input 
              type="radio" 
              name="simMode" 
              checked={state.simulationMode === 'new'}
              onChange={() => updateState({ simulationMode: 'new' })}
              className="w-5 h-5 text-indigo-600"
            />
            <div>
              <div className="font-semibold text-gray-900">새로운 주제로 대화하기</div>
              <p className="text-sm text-gray-500">분석된 페르소나를 바탕으로 처음부터 새롭게 대화를 시작합니다.</p>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button onClick={onPrev} className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} /> 이전
        </button>
        <button 
          onClick={handleStartSimulation}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          시뮬레이션 시작 <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
