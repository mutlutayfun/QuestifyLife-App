import { useState } from 'react';
import api from '../api/axiosConfig';

const steps = [
    {
        emoji: "👋",
        title: "Hoş Geldin Maceracı!",
        desc: "QuestifyLife'a katıldığın için çok mutluyuz. Burası hayatını oyunlaştırarak hedeflerine ulaşmanı sağlayacak yer.",
        color: "bg-blue-500"
    },
    {
        emoji: "⚔️",
        title: "Görevlerini Oluştur",
        desc: "Günlük hedeflerini 'Görev' olarak ekle. Zorluk derecesine göre XP ve Puan kazan.",
        color: "bg-red-500"
    },
    {
        emoji: "📊",
        title: "Gününü Yönet",
        desc: "Görevlerini tamamladıkça ilerlemeni gör. Gün sonunda 'Günü Bitir' diyerek serini (streak) koru!",
        color: "bg-green-500"
    },
    {
        emoji: "🏆",
        title: "Rozetleri Topla",
        desc: "İstikrarlı ol, seviye atla ve başarı rozetlerini profilinde sergile. Arkadaşlarınla yarış!",
        color: "bg-yellow-500"
    },
    {
        emoji: "🚀",
        title: "Hazırsın!",
        desc: "Artık kendi hikayeni yazma zamanı. Haydi ilk görevini ekleyerek başla!",
        color: "bg-indigo-600"
    }
];

// onComplete prop'unu ekledik
export default function TutorialModal({ onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        try {
            // Backend'e "Tutorial Görüldü" bilgisini gönder
            await api.post('/User/complete-tutorial');
            
            // YENİ: Başarıyla tamamlandığında üst bileşene haber ver
            if (onComplete) {
                onComplete();
            }
        } catch (error) {
            console.error("Tutorial update error:", error);
        } finally {
            onClose(); // Modalı kapat
        }
    };

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col min-h-[450px]">
                
                {/* Üst Kısım (Görsel Alan) */}
                <div className={`${step.color} h-48 flex items-center justify-center transition-colors duration-500 relative`}>
                    <div className="text-8xl animate-bounce-slow drop-shadow-lg">
                        {step.emoji}
                    </div>
                    {/* Sayfa Göstergesi */}
                    <div className="absolute top-4 right-4 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                        {currentStep + 1} / {steps.length}
                    </div>
                </div>

                {/* İçerik */}
                <div className="p-8 flex-1 flex flex-col text-center">
                    <h2 className="text-2xl font-black text-gray-800 mb-4">{step.title}</h2>
                    <p className="text-gray-500 leading-relaxed mb-8">
                        {step.desc}
                    </p>

                    {/* Alt Butonlar */}
                    <div className="mt-auto flex justify-between items-center">
                        {currentStep > 0 ? (
                            <button 
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="text-gray-400 font-bold hover:text-gray-600 transition"
                            >
                                Geri
                            </button>
                        ) : (
                            <div></div> 
                        )}

                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentStep ? 'bg-primary w-4' : 'bg-gray-200'}`}
                                ></div>
                            ))}
                        </div>

                        <button 
                            onClick={handleNext}
                            className={`${step.color} text-white px-6 py-2 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-gray-300 transform active:scale-95`}
                        >
                            {currentStep === steps.length - 1 ? "Başla! 🚀" : "İleri →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}