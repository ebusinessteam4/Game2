import { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { chatSimulationGenerate } from '../services/ai';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';

export default function StepChat({ state, updateState, onPrev }: any) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newHistory = [...state.chatHistory, { role: 'user', text: userMessage }];
    updateState({ chatHistory: newHistory });
    setLoading(true);

    try {
      const responseText = await chatSimulationGenerate(
        userMessage,
        state.chatHistory,
        state.personaAnalysis,
        state.relationship,
        state.analyzer,
        state.target
      );

      updateState({ 
        chatHistory: [...newHistory, { role: 'model', text: responseText }] 
      });
    } catch (error) {
      console.error(error);
      alert("채팅 중 오류가 발생했습니다.");
      // Revert user message on error
      updateState({ chatHistory: state.chatHistory });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">시뮬레이션 채팅</h2>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-indigo-600">{state.target}</span> 페르소나와 대화 중입니다.
          </p>
        </div>
        <button onClick={onPrev} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={16} /> 분석으로 돌아가기
        </button>
      </div>

      <div className="flex-grow bg-white rounded-t-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {state.chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <Bot size={48} className="text-gray-300" />
              <p>먼저 말을 걸어 대화를 시작해보세요.</p>
            </div>
          )}
          
          {state.chatHistory.map((msg: any, i: number) => {
            const isUser = msg.role === 'user';
            return (
              <div key={i} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {isUser ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[75%] p-4 rounded-2xl ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`${state.target}에게 메시지 보내기...`}
              className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
