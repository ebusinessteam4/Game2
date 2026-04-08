import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { Utterance } from "../types";

const defaultAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function getClient(apiProvider: string, customApiKey: string) {
  const key = customApiKey.trim();
  if (apiProvider === 'openai') {
    return new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
  } else if (apiProvider === 'groq') {
    return new OpenAI({ apiKey: key, baseURL: "https://api.groq.com/openai/v1", dangerouslyAllowBrowser: true });
  }
  return defaultAi;
}

function parseJSON(text: string) {
  try {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match) {
      return JSON.parse(match[1]);
    }
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      return JSON.parse(text.substring(startIndex, endIndex + 1));
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON:", text);
    throw e;
  }
}

export async function parseConversation(text: string, apiProvider: string = 'gemini', customApiKey: string = '') {
  const prompt = `다음 대화를 분석하여 발화자, 발화 내용, 의도를 추출해줘.
의도는 다음 중 하나여야 해: ["질문", "반박", "전환", "회피", "감정표출", "동의", "정보 제공", "사과", "공감", "기타"].
또한 대화 참여자 목록을 추출하고, 이 대화를 분석하는 주체(분석가, 보통 '나' 또는 질문자)와 분석 대상(상대방)을 추측해줘.

대화 내용:
${text}`;

  if (apiProvider === 'gemini') {
    const ai = getClient(apiProvider, customApiKey) as GoogleGenAI;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    return parseJSON(response.text || "{}");
  } else {
    const openai = getClient(apiProvider, customApiKey) as OpenAI;
    const model = apiProvider === 'openai' ? 'gpt-4o-mini' : 'llama-3.1-8b-instant';
    const jsonPrompt = prompt + `\n\n반드시 다음 JSON 형식으로 응답해줘 (Return in JSON format):\n{"utterances": [{"speaker": "...", "text": "...", "intention": "..."}], "speakers": ["..."], "analyzer": "...", "target": "..."}`;
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: jsonPrompt }],
      response_format: { type: "json_object" }
    });
    return parseJSON(response.choices[0].message.content || "{}");
  }
}

export async function analyzeFlow(utterances: Utterance[], analyzer: string, target: string, apiProvider: string = 'gemini', customApiKey: string = '') {
  const conversation = utterances.map(u => `${u.speaker} (${u.intention}): ${u.text}`).join('\n');
  const prompt = `다음은 '${analyzer}'와 '${target}'의 대화 타임라인이야.
1. '${target}'의 페르소나(성향, 특징, 말투 등)를 분석해줘. 전반적인 요약과 함께, 이 사람의 주요 성향을 3~4가지 척도(예: 감정표현, 논리성, 공격성, 공감능력 등)로 나누어 0~100 사이의 수치로 평가해줘.
2. '${analyzer}'와 '${target}' 간의 관계와 현재 상황을 300자 이내로 추측해서 요약해줘.

대화 타임라인:
${conversation}`;

  if (apiProvider === 'gemini') {
    const ai = getClient(apiProvider, customApiKey) as GoogleGenAI;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaAnalysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                traits: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      value: { type: Type.NUMBER }
                    }
                  }
                }
              }
            },
            relationship: { type: Type.STRING }
          },
          required: ["personaAnalysis", "relationship"]
        }
      }
    });
    return parseJSON(response.text || "{}");
  } else {
    const openai = getClient(apiProvider, customApiKey) as OpenAI;
    const model = apiProvider === 'openai' ? 'gpt-4o-mini' : 'llama-3.1-8b-instant';
    const jsonPrompt = prompt + `\n\n반드시 다음 JSON 형식으로 응답해줘 (Return in JSON format):\n{"personaAnalysis": {"summary": "...", "traits": [{"name": "...", "value": 80}]}, "relationship": "..."}`;
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: jsonPrompt }],
      response_format: { type: "json_object" }
    });
    return parseJSON(response.choices[0].message.content || "{}");
  }
}

export async function applyAnalysis(utterances: Utterance[], analyzer: string, target: string, topic: string, apiProvider: string = 'gemini', customApiKey: string = '') {
  const conversation = utterances.map((u, i) => `[${i}] ${u.speaker} (${u.intention}): ${u.text}`).join('\n');
  const prompt = `다음 대화를 '${topic}' 관점에서 분석해줘.
가장 핵심적으로 스탠스가 바뀌었거나 중요한 역할을 한 발화의 인덱스 번호(0부터 시작)를 하나 고르고, 그 이유를 설명해줘.

대화 타임라인:
${conversation}`;

  if (apiProvider === 'gemini') {
    const ai = getClient(apiProvider, customApiKey) as GoogleGenAI;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    return parseJSON(response.text || "{}");
  } else {
    const openai = getClient(apiProvider, customApiKey) as OpenAI;
    const model = apiProvider === 'openai' ? 'gpt-4o-mini' : 'llama-3.1-8b-instant';
    const jsonPrompt = prompt + `\n\n반드시 다음 JSON 형식으로 응답해줘 (Return in JSON format):\n{"corePieceIndex": 0, "explanation": "..."}`;
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: jsonPrompt }],
      response_format: { type: "json_object" }
    });
    return parseJSON(response.choices[0].message.content || "{}");
  }
}

export async function chatSimulationGenerate(
  message: string,
  history: {role: 'user'|'model', text: string}[],
  persona: any,
  relationship: string,
  analyzer: string,
  target: string,
  apiProvider: string = 'gemini',
  customApiKey: string = ''
) {
  const systemInstruction = `당신은 '${target}'입니다. 당신의 페르소나는 다음과 같습니다:\n${JSON.stringify(persona)}\n\n대화 상대방은 '${analyzer}'이며, 두 사람의 관계/상황은 다음과 같습니다:\n${relationship}\n\n반드시 '${target}'의 입장에서, 주어진 페르소나와 말투를 유지하며 대답하세요.\n중요: 답변은 실제 메신저 채팅처럼 짧고 간결하게, 가능한 한 문단 이내로 작성하세요.`;

  if (apiProvider === 'gemini') {
    const ai = getClient(apiProvider, customApiKey) as GoogleGenAI;
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
        systemInstruction
      }
    });
    return response.text;
  } else {
    const openai = getClient(apiProvider, customApiKey) as OpenAI;
    const model = apiProvider === 'openai' ? 'gpt-4o-mini' : 'llama-3.1-8b-instant';
    
    const messages: any[] = [
      { role: 'system', content: systemInstruction },
      ...history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
      })),
      { role: 'user', content: message }
    ];

    const response = await openai.chat.completions.create({
      model,
      messages
    });
    return response.choices[0].message.content;
  }
}
