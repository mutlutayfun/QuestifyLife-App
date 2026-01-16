import { useState} from 'react';

const quotes = [
    "Başlamak için mükemmel olmak zorunda değilsin, ama mükemmel olmak için başlamak zorundasın.",
    "Bugün yapacağın küçük bir adım, yarın büyük bir fark yaratabilir.",
    "Disiplin, hedefler ile başarı arasındaki köprüdür.",
    "Hayallerine giden yol, her gün attığın küçük adımlardan geçer.",
    "Zorluklar seni yıldırmasın, onlar sadece başarının merdivenleridir.",
    "Geçmişi değiştiremezsin ama bugünü yöneterek geleceği inşa edebilirsin.",
    "Erteleme, hayallerin en büyük düşmanıdır. Şimdi başla!",
    "Büyük başarılar, zamanla biriken küçük çabaların sonucudur.",
    "Kendine inanmak, başarının ilk sırrıdır.",
    "Yorgun olduğunda durma, işin bittiğinde dur.",
    "Her gün, kendini geliştirmek için yeni bir fırsattır.",
    "Başarı tesadüf değildir, sıkı çalışmanın ve azmin ürünüdür.",
    "Vazgeçmek için değil, başarmak için buradasın.",
    "Bugün ektiğin tohumlar, yarının ormanları olacak.",
    "En uzun yolculuklar bile tek bir adımla başlar.",
    "Sınırlarını zorla, çünkü gerçek potansiyelin orada saklı.",
    "Dün düştüysen, bugün ayağa kalk.",
    "Yapamazsın diyenlere inat, yapabildiğini göster.",
    "Zaman en değerli sermayendir, onu akıllıca kullan.",
    "Hedefin yoksa, hangi rüzgarın estiği fark etmez.",
    "Engeller, hedefe odaklandığında görmediğin korkutucu şeylerdir.",
    "Başarı bir varış noktası değil, bir yolculuktur.",
    "Kendi hikayenin kahramanı sensin, kalemi eline al.",
    "Bekleme, zaman asla 'tam doğru' olmayacak.",
    "Bugün kendine bir iyilik yap ve hedeflerine bir adım daha yaklaş.",
    "Sadece istemek yetmez, harekete geçmek gerekir.",
    "Sabır ve azimle aşılamayacak dağ yoktur.",
    "Fırsatlar gelmez, onları sen yaratırsın.",
    "Karanlığa küfretmektense bir mum yak.",
    "Gelecek, bugünden hazırlananlara aittir."
];

export default function DailyQuote() {
    // State başlangıç değerini bir fonksiyonla belirliyoruz (Lazy Initialization)
    // Bu sayede useEffect kullanmadan, bileşen ilk oluştuğunda bu mantık çalışır.
    const [quote] = useState(() => {
        const today = new Date().toDateString(); // "Fri Jan 16 2026"
        const storedDate = localStorage.getItem("quoteDate");
        const storedQuote = localStorage.getItem("dailyQuote");

        if (storedDate === today && storedQuote) {
            // Bugün zaten bir söz seçilmiş, onu döndür
            return storedQuote;
        } else {
            // Yeni gün veya ilk kez, rastgele yeni bir söz seç
            const randomIndex = Math.floor(Math.random() * quotes.length);
            const newQuote = quotes[randomIndex];
            
            // LocalStorage'a kaydet
            localStorage.setItem("quoteDate", today);
            localStorage.setItem("dailyQuote", newQuote);
            
            return newQuote;
        }
    });

    if (!quote) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl shadow-sm mb-6 flex items-start gap-3 animate-fade-in">
            <span className="text-4xl">💡</span>
            <div>
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">Günün Sözü</h4>
                <p className="text-gray-700 italic font-medium">"{quote}"</p>
            </div>
        </div>
    );
}