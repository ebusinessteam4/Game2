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

const initialState: AppState = {
  step: 0,
  inputText: '',
  utterances: [],
  speakers: [],
  analyzer: '',
  target: '',
  personaAnalysis: '',
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600">말 조각 수집가</h1>
        <div className="text-sm text-gray-500">Step {state.step + 1} / 5</div>
      </header>
      
      <main className="max-w-4xl mx-auto p-6">
        {state.step === 0 && <StepWelcome onNext={nextStep} />}
        {state.step === 1 && <StepInput state={state} updateState={updateState} onNext={nextStep} onPrev={prevStep} />}
        {state.step === 2 && <StepTimeline state={state} updateState={updateState} onNext={nextStep} onPrev={prevStep} />}
        {state.step === 3 && <StepAnalysis state={state} updateState={updateState} onNext={nextStep} onPrev={prevStep} />}
        {state.step === 4 && <StepChat state={state} updateState={updateState} onPrev={prevStep} />}
      </main>
    </div>
  );
}

