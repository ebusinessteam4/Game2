import { useState, useRef } from 'react';
import { AppState } from '../types';
import { parseConversation } from '../services/ai';
import { FileText, X, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function StepInput({ state, updateState, onNext, onPrev }: any) {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 5000) {
      updateState({ inputText: text });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      updateState({ inputText: text.slice(0, 5000) });
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    updateState({ inputText: '' });
  };

  const handleAnalyze = async () => {
    if (!state.inputText.trim()) return;
    setLoading(true);
    try {
      const result = await parseConversation(state.inputText);
      const utterances = result.utterances.map((u: any, i: number) => ({
        id: `u-${i}`,
        ...u
      }));
      updateState({
        utterances,
        speakers: result.speakers || [],
        analyzer: result.analyzer || '',
        target: result.target || ''
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">말 조각 수집</h2>
        <span className="text-sm text-gray-500">{state.inputText.length} / 5,000 자</span>
      </div>
      
      <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <textarea
          className="w-full h-64 p-4 outline-none resize-none bg-transparent"
          placeholder="대화 내용을 직접 입력하거나 텍스트 파일을 업로드하세요..."
          value={state.inputText}
          onChange={handleTextChange}
        />
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept=".txt" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <FileText size={16} />
            .txt 파일 업로드
          </button>
          {fileName && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md">
              <span className="truncate max-w-[200px]">{fileName}</span>
              <button onClick={clearFile} className="hover:text-indigo-800"><X size={14} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onPrev} className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} /> 이전
        </button>
        <button 
          onClick={handleAnalyze}
          disabled={!state.inputText.trim() || loading}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : '말 조각으로 분해하기'}
          {!loading && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
