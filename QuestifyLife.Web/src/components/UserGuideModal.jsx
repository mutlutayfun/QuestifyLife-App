import { useState } from 'react';

export default function UserGuideModal({ isOpen, onClose }) {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const steps = [
        {
            title: "Macera Başlasın! 🚀",
            image: "/Happy_Fox2_BF.png", // Mutlu tilki
            content: (
                <div className="text-center space-y-4">
                    <p className="text-gray-600 text-base leading-relaxed">
                        Hayatındaki sorumlulukları birer <strong>RPG görevine</strong> dönüştür! 
                        Sıkıcı listeler yerine; XP kazan, seviye atla ve kendi efsaneni yaz.
                    </p>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 text-blue-800 font-medium text-sm shadow-sm">
                        ✨ <span className="font-bold">Ana Hedef:</span> Her gün görevlerini tamamla, karakterini güçlendir ve en iyi versiyonuna ulaş.
                    </div>
                </div>
            )
        },
        {
            title: "Görevler ve XP Sistemi ⚡",
            image: "/Run_Fox_BF.png", // Koşan tilki
            content: (
                <div className="space-y-4">
                    <p className="text-gray-600 text-center text-sm mb-2">
                        Yeni bir görev eklerken zorluk derecesini seç. 
                        Daha zor görevler, daha fazla XP demektir!
                    </p>
                    
                    {/* XP Tablosu - 5 erli sistem */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-green-50 p-2.5 rounded-xl border border-green-100 flex flex-col items-center justify-center hover:scale-105 transition-transform">
                            <span className="text-xl mb-1">🌱</span>
                            <span className="font-bold text-green-700">Çok Kolay</span>
                            <span className="font-black text-green-500 text-lg">5 XP</span>
                        </div>
                        <div className="bg-teal-50 p-2.5 rounded-xl border border-teal-100 flex flex-col items-center justify-center hover:scale-105 transition-transform">
                            <span className="text-xl mb-1">🍏</span>
                            <span className="font-bold text-teal-700">Kolay</span>
                            <span className="font-black text-teal-500 text-lg">10 XP</span>
                        </div>
                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex flex-col items-center justify-center hover:scale-105 transition-transform">
                            <span className="text-xl mb-1">💧</span>
                            <span className="font-bold text-blue-700">Orta</span>
                            <span className="font-black text-blue-500 text-lg">15 XP</span>
                        </div>
                        <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 flex flex-col items-center justify-center hover:scale-105 transition-transform">
                            <span className="text-xl mb-1">⚔️</span>
                            <span className="font-bold text-indigo-700">Zor</span>
                            <span className="font-black text-indigo-500 text-lg">20 XP</span>
                        </div>
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex flex-col items-center justify-center hover:scale-105 transition-transform">
                            <span className="text-xl mb-1">🔮</span>
                            <span className="font-bold text-purple-700">Çok Zor</span>
                            <span className="font-black text-purple-500 text-lg">25 XP</span>
                        </div>
                        <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 flex flex-col items-center justify-center hover:scale-105 transition-transform">
                            <span className="text-xl mb-1">🔥</span>
                            <span className="font-bold text-red-700">Epik</span>
                            <span className="font-black text-red-500 text-lg">30 XP</span>
                        </div>
                    </div>
                </div>
            )
        },
        // --- YENİ EKLENEN ADIM: ZİNCİR KURALI ---
        {
            title: "Zincir Kuralı (3 Hak) 🛡️",
            image: "/Sad_Fox_BF.png", // Üzgün tilki (uyarıyı temsil etmesi için)
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Serini (streak) korumak için her gün hedefini tutturmalısın. 
                        Ama hayat bu, bazen aksilikler olabilir.
                    </p>
                    
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-left text-xs space-y-3 shadow-sm">
                        <h4 className="font-bold text-orange-800 border-b border-orange-200 pb-1 mb-2">Nasıl Çalışır?</h4>
                        <div className="flex items-start gap-2">
                            <span className="text-lg leading-none">⚠️</span>
                            <span className="text-gray-700">Hedefi kaçırdığın <strong>ilk gün</strong> sadece uyarı alırsın. Serin bozulmaz.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-lg leading-none">🛑</span>
                            <span className="text-gray-700"><strong>İkinci gün</strong> de kaçırırsan durum kritikleşir.</span>
                        </div>
                        <div className="flex items-start gap-2 font-bold text-red-600 bg-red-50 p-2 rounded-lg">
                            <span className="text-lg leading-none">☠️</span>
                            <span><strong>3 gün üst üste</strong> hedefini tutturamazsan serin sıfırlanır!</span>
                        </div>
                    </div>
                </div>
            )
        },
        // ----------------------------------------
        {
            title: "Günü Bitir & Ayarlar 🌙",
            image: "/Happy_Fox_BF.png", // Standart mutlu tilki
            content: (
                <div className="space-y-5 text-center">
                    <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100 shadow-sm">
                        <h4 className="font-bold text-orange-800 mb-1 flex items-center justify-center gap-2">
                             <span>🔥</span> Günü Bitir
                        </h4>
                        <p className="text-orange-700 text-xs leading-relaxed">
                            Günün sonunda mutlaka <span className="font-bold">"Bitir"</span> butonuna basmalısın! 
                            Bu işlem serini (streak) devam ettirir ve puanlarını kaydeder.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
                        <h4 className="font-bold text-gray-800 mb-1 flex items-center justify-center gap-2 relative z-10">
                             <span>⚙️</span> Hedefini Ayarla
                        </h4>
                        <p className="text-gray-600 text-xs relative z-10">
                            Günlük XP hedefini kendine göre özelleştirebilirsin. 
                            Bunun için <strong>Profil {'>'} Ayarlar</strong> menüsünü kullanman yeterli!
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Zirveye Oyna! 🏆",
            image: "/Logo_Fox_BF.png", // Logo tilki
            content: (
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">⭐</div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Seviye Atla</h4>
                                <p className="text-xs text-gray-500">XP kazandıkça seviye çubuğun dolar ve level atlarsın.</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">🏅</div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Rozetler Kazan</h4>
                                <p className="text-xs text-gray-500">7 gün seri yap, 50 görev tamamla... Başarılarını sergile!</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">👑</div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm">Liderlik Tablosu</h4>
                                <p className="text-xs text-gray-500">Arkadaşlarınla yarış ve haftanın şampiyonu ol.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose(); // Son adımda kapat
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative flex flex-col max-h-[85vh]">
                
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-white -z-0"></div>

                {/* Kapat Butonu */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-red-500 transition-all shadow-sm z-20 backdrop-blur-md"
                >
                    ✕
                </button>

                {/* İlerleme Çubuğu */}
                <div className="flex gap-1.5 p-6 pb-0 relative z-10 justify-center">
                    {steps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                idx === currentStep 
                                    ? 'w-8 bg-primary shadow-sm' 
                                    : idx < currentStep 
                                        ? 'w-2 bg-blue-200' 
                                        : 'w-2 bg-gray-200'
                            }`}
                        />
                    ))}
                </div>

                {/* İçerik Alanı */}
                <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col items-center relative z-10 scrollbar-hide">
                    {/* Görsel */}
                    <div className="my-4 relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 to-indigo-100/40 rounded-full animate-pulse-slow blur-xl"></div>
                        <img 
                            src={steps[currentStep].image} 
                            alt="Guide Step" 
                            className="w-36 h-36 object-contain drop-shadow-lg relative z-10 hover:scale-105 transition-transform duration-500 ease-out" 
                        />
                    </div>

                    {/* Başlık */}
                    <h2 className="text-xl font-black text-gray-800 mb-4 text-center tracking-tight">
                        {steps[currentStep].title}
                    </h2>

                    {/* Metin İçeriği */}
                    <div className="w-full">
                        {steps[currentStep].content}
                    </div>
                </div>

                {/* Alt Kontroller */}
                <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-between mt-auto">
                    <button 
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`text-sm font-bold px-3 py-2 rounded-lg transition-colors ${
                            currentStep === 0 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                        }`}
                    >
                        Geri
                    </button>

                    <button 
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200/50 transition-all hover:scale-105 active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? (
                            <>
                                Başla 🚀
                            </>
                        ) : (
                            <>
                                Devam Et ➡️
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}