export const INTENTIONS = [
  "질문", "반박", "전환", "회피", "감정표출", "동의", "정보 제공", "사과", "공감", "기타"
];

export interface Utterance {
  id: string;
  speaker: string;
  text: string;
  intention: string;
}

export interface AppState {
  step: number;
  apiProvider: 'gemini' | 'openai' | 'groq';
  customApiKey: string;
  inputText: string;
  utterances: Utterance[];
  speakers: string[];
  analyzer: string;
  target: string;
  personaAnalysis: {
    summary: string;
    traits: { name: string; value: number }[];
  } | null;
  relationship: string;
  appliedTopic: string;
  appliedResult: {
    corePieceId: string;
    explanation: string;
  } | null;
  simulationMode: 'continue' | 'new';
  simulationStartPoint: number;
  chatHistory: { role: 'user' | 'model', text: string }[];
}
