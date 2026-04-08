/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AppState } from './types';
import StepWelcome from './components/StepWelcome';
import StepInput from './components/StepInput';
import StepTimeline from './components/StepTimeline';
import StepAnalysis from './components/StepAnalysis';
import StepChat from './components/StepChat';
import { Home } from 'lucide-react';

const initialState: AppState = {
  step: 0,
  apiProvider: 'gemini',
  customApiKey: '',
  inputText: '',
  utterances: [],
  speakers: [],
  analyzer: '',
  target: '',
  personaAnalysis: null,
  relationship: '',
  appliedTopic: '',
  appliedResult: null,
  simulationMode: 'new',
  simulationStartPoint: 0,
  chatHistory: []
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => updateState({ step: state.step + 1 });
  const prevStep = () => updateState({ step: Math.max(0, state.step - 1) });
  const resetState = () => setState(initialState);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-sans selection:bg-violet-500/30">
      <header className="bg-[#13131a] shadow-md border-b border-violet-900/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {state.step > 0 && (
              <button 
                onClick={resetState} 
                className="p-2 text-gray-400 hover:text-amber-400 hover:bg-violet-900/20 rounded-full transition-colors" 
                title="처음으로 (초기화)"
              >
                <Home size={20} />
              </button>
            )}
            <h1 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-violet-400">말 조각 수집가</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4">
          <div className="w-full bg-gray-800/50 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-violet-600 to-amber-400 h-full transition-all duration-500 ease-out" 
              style={{ width: `${((state.step + 1) / 5) * 100}%` }} 
            />
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6">
        {state.step === 0 && <StepWelcome state={state} updateState={updateState} onNext={nextStep} />}
        {state.step === 1 && <StepInput state={state} updateState={updateState} onNext={nextStep} onPrev={prevStep} />}
        {state.step === 2 && <StepTimeline state={state} updateState={updateState} onNext={nextStep} onPrev={prevStep} />}
        {state.step === 3 && <StepAnalysis state={state} updateState={updateState} onNext={nextStep} onPrev={prevStep} />}
        {state.step === 4 && <StepChat state={state} updateState={updateState} onPrev={prevStep} />}
      </main>
    </div>
  );
}

