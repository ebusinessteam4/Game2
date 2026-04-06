import { GoogleGenAI, Type } from "@google/genai";
import { Utterance } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseConversation(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `다음 대화를 분석하여 발화자, 발화 내용, 의도를 추출해줘.
의도는 다음 중 하나여야 해: ["질문", "반박", "전환", "회피", "감정표출", "동의", "정보 제공", "사과", "공감", "기타"].
또한 대화 참여자 목록을 추출하고, 이 대화를 분석하는 주체(분석가, 보통 '나' 또는 질문자)와 분석 대상(상대방)을 추측해줘.

대화 내용:
${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          utterances: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                intention: { type: Type.STRING }
              }
            }
          },
          speakers: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          analyzer: { type: Type.STRING },
          target: { type: Type.STRING }
        },
        required: ["utterances", "speakers", "analyzer", "target"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function analyzeFlow(utterances: Utterance[], analyzer: string, target: string) {
  const conversation = utterances.map(u => `${u.speaker} (${u.intention}): ${u.text}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `다음은 '${analyzer}'와 '${target}'의 대화 타임라인이야.
1. '${target}'의 페르소나(성향, 특징, 말투 등)를 분석해줘.
2. '${analyzer}'와 '${target}' 간의 관계와 현재 상황을 300자 이내로 추측해서 요약해줘.

대화 타임라인:
${conversation}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personaAnalysis: { type: Type.STRING },
          relationship: { type: Type.STRING }
        },
        required: ["personaAnalysis", "relationship"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function applyAnalysis(utterances: Utterance[], analyzer: string, target: string, topic: string) {
  const conversation = utterances.map((u, i) => `[${i}] ${u.speaker} (${u.intention}): ${u.text}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `다음 대화를 '${topic}' 관점에서 분석해줘.
가장 핵심적으로 스탠스가 바뀌었거나 중요한 역할을 한 발화의 인덱스 번호(0부터 시작)를 하나 고르고, 그 이유를 설명해줘.

대화 타임라인:
${conversation}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          corePieceIndex: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["corePieceIndex", "explanation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function chatSimulationGenerate(
  message: string,
  history: {role: 'user'|'model', text: string}[],
  persona: string,
  relationship: string,
  analyzer: string,
  target: string
) {
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: {
      systemInstruction: `당신은 '${target}'입니다. 당신의 페르소나는 다음과 같습니다:\n${persona}\n\n대화 상대방은 '${analyzer}'이며, 두 사람의 관계/상황은 다음과 같습니다:\n${relationship}\n\n반드시 '${target}'의 입장에서, 주어진 페르소나와 말투를 유지하며 대답하세요.`
    }
  });

  return response.text;
}
