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
        emoji: "📜",
        title: "Kendine Bir Söz Ver",
        desc: "Bu yolculuğa başlarken kendine bir motivasyon sözü yaz. Neden buradasın? Hedefin ne?",
        color: "bg-orange-500",
        isManifesto: true // Bu adımın giriş alanı olduğunu belirtir
    },
    {
        emoji: "🚀",
        title: "Hazırsın!",
        desc: "Artık kendi hikayeni yazma zamanı. Haydi ilk görevini ekleyerek başla!",
        color: "bg-indigo-600"
    }
];

export default function TutorialModal({ onClose, onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [manifesto, setManifesto] = useState(""); // Manifesto metni için state

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        try {
            // 1. Profil bilgisini manifesto ile güncelle
            if (manifesto.trim()) {
                await api.put('/User/profile', { personalManifesto: manifesto });
            }

            // 2. Backend'e "Tutorial Görüldü" bilgisini gönder
            await api.post('/User/complete-tutorial');
            
            // 3. Başarıyla tamamlandığında üst bileşene manifestoyu da gönder
            if (onComplete) {
                onComplete(manifesto);
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
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col min-h-[480px]">
                
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
                    
                    {/* Normal Açıklama veya Manifesto Girişi */}
                    {step.isManifesto ? (
                        <div className="mb-6 animate-fade-in-up">
                            <p className="text-xs text-gray-400 mb-3 uppercase font-bold tracking-widest">{step.desc}</p>
                            <textarea 
                                value={manifesto}
                                onChange={(e) => setManifesto(e.target.value)}
                                className="w-full p-4 bg-orange-50 border-2 border-orange-100 rounded-2xl text-gray-700 focus:outline-none focus:border-orange-300 font-medium italic text-sm h-28 resize-none placeholder-gray-400 shadow-inner"
                                placeholder="Örn: Her gün %1 daha iyi olacağım ve asla pes etmeyeceğim..."
                                autoFocus
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500 leading-relaxed mb-8">
                            {step.desc}
                        </p>
                    )}

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
                            disabled={step.isManifesto && manifesto.trim().length < 3}
                            className={`${step.color} text-white px-6 py-2 rounded-xl font-bold hover:opacity-90 transition shadow-lg shadow-gray-300 transform active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                        >
                            {currentStep === steps.length - 1 ? "Başla! 🚀" : "İleri →"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}