import { ArrowRight } from 'lucide-react';

export default function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">말 조각 수집가</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl leading-relaxed">
        대화를 조각내어 분석하고, 상대방의 페르소나를 파악하여 시뮬레이션 채팅을 진행해보세요.
        <br/><br/>
        <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium">
          AI API Key는 AI Studio 환경에서 자동으로 연동됩니다.
        </span>
      </p>
      <button 
        onClick={onNext}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
      >
        시작하기 <ArrowRight size={20} />
      </button>
    </div>
  );
}
