import { ArrowRight, Key } from 'lucide-react';

export default function StepWelcome({ state, updateState, onNext }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-violet-400 mb-6 tracking-tight">말 조각 수집가</h2>
      <p className="text-lg text-gray-400 mb-12 max-w-2xl leading-relaxed">
        대화를 조각내어 분석하고, 상대방의 페르소나를 파악하여 시뮬레이션 채팅을 진행해보세요.
      </p>

      <div className="w-full max-w-md bg-[#13131a] border border-violet-900/30 p-6 rounded-2xl mb-10 text-left shadow-lg">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Key size={16} className="text-amber-400" /> API 설정
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
            <input 
              type="radio" 
              name="apiProvider" 
              checked={state.apiProvider === 'gemini'}
              onChange={() => updateState({ apiProvider: 'gemini', customApiKey: '' })}
              className="w-4 h-4 text-violet-500 bg-gray-900 border-gray-700"
            />
            <div>
              <div className="font-medium text-gray-200">AI Studio (기본)</div>
              <p className="text-xs text-gray-500">Gemini 3 Flash 모델을 사용합니다.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
            <input 
              type="radio" 
              name="apiProvider" 
              checked={state.apiProvider === 'openai'}
              onChange={() => updateState({ apiProvider: 'openai' })}
              className="w-4 h-4 text-violet-500 bg-gray-900 border-gray-700"
            />
            <div>
              <div className="font-medium text-gray-200">OpenAI</div>
              <p className="text-xs text-gray-500">직접 API Key를 입력하여 사용합니다.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-gray-800 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors">
            <input 
              type="radio" 
              name="apiProvider" 
              checked={state.apiProvider === 'groq'}
              onChange={() => updateState({ apiProvider: 'groq' })}
              className="w-4 h-4 text-violet-500 bg-gray-900 border-gray-700"
            />
            <div>
              <div className="font-medium text-gray-200">Groq</div>
              <p className="text-xs text-gray-500">직접 API Key를 입력하여 사용합니다.</p>
            </div>
          </label>
        </div>

        {state.apiProvider !== 'gemini' && (
          <div className="mt-4 animate-in fade-in slide-in-from-top-2">
            <input 
              type="password"
              placeholder={`${state.apiProvider === 'openai' ? 'OpenAI' : 'Groq'} API Key 입력`}
              value={state.customApiKey}
              onChange={(e) => updateState({ customApiKey: e.target.value })}
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>
        )}
      </div>

      <button 
        onClick={onNext}
        disabled={state.apiProvider !== 'gemini' && !state.customApiKey.trim()}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-500 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5"
      >
        시작하기 <ArrowRight size={20} />
      </button>
    </div>
  );
}
