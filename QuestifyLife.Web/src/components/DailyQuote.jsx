import { useState } from 'react';

// --- VERİ HAVUZU ---

const quotes = [
    // --- Klasik Motivasyon & Disiplin ---
    { text: "Başlamak için mükemmel olmak zorunda değilsin, ama mükemmel olmak için başlamak zorundasın.", author: "Zig Ziglar" },
    { text: "Bugün yapacağın küçük bir adım, yarın büyük bir fark yaratabilir.", author: "Anonim" },
    { text: "Disiplin, hedefler ile başarı arasındaki köprüdür.", author: "Jim Rohn" },
    { text: "Zorluklar seni yıldırmasın, onlar sadece başarının merdivenleridir.", author: "Anonim" },
    { text: "Geçmişi değiştiremezsin ama bugünü yöneterek geleceği inşa edebilirsin.", author: "Anonim" },
    { text: "Erteleme, hayallerin en büyük düşmanıdır. Şimdi başla!", author: "Anonim" },
    { text: "Büyük başarılar, zamanla biriken küçük çabaların sonucudur.", author: "Robert Collier" },
    { text: "Yorgun olduğunda durma, işin bittiğinde dur.", author: "Anonim" },
    { text: "Başarı tesadüf değildir, sıkı çalışmanın ve azmin ürünüdür.", author: "Pele" },
    { text: "Bugün ektiğin tohumlar, yarının ormanları olacak.", author: "Anonim" },
    { text: "Sınırlarını zorla, çünkü gerçek potansiyelin orada saklı.", author: "Anonim" },
    { text: "Yapamazsın diyenlere inat, yapabildiğini göster.", author: "Anonim" },
    { text: "Hedefin yoksa, hangi rüzgarın estiği fark etmez.", author: "Seneca" },
    { text: "Bekleme, zaman asla 'tam doğru' olmayacak.", author: "Napoleon Hill" },
    { text: "Sabır ve azimle aşılamayacak dağ yoktur.", author: "Anonim" },
    { text: "Karanlığa küfretmektense bir mum yak.", author: "Konfüçyüs" },
    { text: "Yarınki sen, bugünkü sana teşekkür edecek mi?", author: "Anonim" },
    { text: "Bir saatlik çalışma, bir günlük hayal kurmaktan daha değerlidir.", author: "Anonim" },
    { text: "Mazeretler, başarının önündeki en büyük engellerdir.", author: "Anonim" },
    { text: "Kendi ışığına güvenen, başkasının parlamasından rahatsız olmaz.", author: "Victor Hugo" },
    
    // --- Oyunlaştırma (Gamification) & QuestifyLife Ruhu ---
    { text: "En zorlu görevler (Boss), en büyük ödülleri (Loot) getirir.", author: "QuestifyLife" },
    { text: "Seviye atlamak için önce tecrübe puanı (XP) kazanmalısın.", author: "Gamer Atasözü" },
    { text: "Oyun bittiğinde değil, kazandığında dur.", author: "Anonim" },
    { text: "Bugün kazandığın 1 XP bile seni dünden daha güçlü yapar.", author: "QuestifyLife" },
    { text: "Hata yapmaktan korkma, her 'Game Over' yeni bir tecrübedir.", author: "Anonim" },
    { text: "Ana göreve odaklan, yan görevler seni yavaşlatmasın.", author: "Anonim" },
    { text: "Yetenek ağacını geliştirmek senin elinde.", author: "RPG Mantığı" },
    { text: "Zorluk seviyesi arttıysa, seviye atlamışsın demektir.", author: "Anonim" },
    { text: "Envanterini (zihnini) gereksiz eşyalarla doldurma.", author: "Anonim" },
    { text: "Can barın (enerjin) azaldığında dinlenmeyi unutma.", author: "QuestifyLife" },
    { text: "Gerçek hayatta 'Quick Save' yoktur, kararlarını dikkatli ver.", author: "Gamer Felsefesi" },
    { text: "Her yeni gün, haritada açılan yeni bir bölgedir.", author: "QuestifyLife" },
    { text: "Grind (çabalama) yapmadan, Efsanevi (Legendary) olamazsın.", author: "MMORPG Kuralı" },
    { text: "Tek kişilik bir oyun değil bu; liderlik tablosunda yerini al.", author: "QuestifyLife" },
    { text: "Kendi karakterinin istatistiklerini (Stats) sen belirlersin.", author: "Anonim" }
];

const rules = [
    // --- Temel Prensipler ---
    { title: "Kural #1: Dürüstlük", desc: "Kendini kandırma. Görev yapmadığında 'yaptım' işaretleme. Gerçek gelişim dürüstlükle başlar." },
    { title: "Kural #2: Süreklilik (Streak)", desc: "Seri (Streak) ateşini söndürme! Her gün en az 1 basit görev bile olsa tamamla ve zinciri kırma." },
    { title: "Kural #3: Odaklanma", desc: "Aynı anda 10 göreve (Multitasking) saldırma. Tek tek, sindirerek bitir." },
    { title: "Kural #4: Planlama", desc: "Günün görevlerini bir gece önceden veya sabah erkenden planla. Haritasız yola çıkma." },
    { title: "Kural #5: Dinlenme (Cooldown)", desc: "Tükenmişlik sendromuna (Burnout) girme. Arada mola verip 'Mana'nı doldur." },
    
    // --- QuestifyLife Sistemi İpuçları ---
    { title: "İpucu: XP Kazanımı", desc: "Zor görevler daha çok XP verir. Kolaya kaçmak seni yerinde saydırır, zorluk seni geliştirir." },
    { title: "İpucu: Kategoriler", desc: "Görevlerini 'Yazılım', 'Spor', 'Sanat' gibi etiketle. Hangi alanda (Class) geliştiğini takip et." },
    { title: "İpucu: Rozet Avcısı", desc: "Profilindeki boş rozet yuvalarına bak. Onları doldurmak için ekstra çaba göster." },
    { title: "İpucu: Sosyallik", desc: "Arkadaşlarınla rekabet et. Liderlik tablosundaki yerin, senin disiplininin aynasıdır." },
    { title: "İpucu: Geçmişe Bakış", desc: "'Geçmiş' sekmesi senin seyir defterindir. Neleri başardığını gör ve motive ol." },
    
    // --- Zihniyet (Mindset) ---
    { title: "Hatırlatma: Rakip Sensin", desc: "Liderlik tablosu önemlidir ama en büyük rakibin dünkü sensin. Dünden daha iyi ol." },
    { title: "Questify Felsefesi", desc: "Hayat bir RPG oyunudur. Kontrolcü (Controller) senin elinde, senaryoyu sen yazıyorsun." },
    { title: "Motivasyon: Başlangıç", desc: "En zor kısım 'Başla' butonuna basmaktır. Gerisi çorap söküğü gibi gelir." },
    { title: "Uyarı: Erteleme Canavarı", desc: "'Sonra yaparım' demek, XP kaybetmenin en garantili yoludur. Şimdi yap." },
    { title: "Strateji: Küçük Adımlar", desc: "Büyük Boss'ları (büyük projeleri) küçük parçalara bölerek yen." }
];

export default function DailyQuote() {
    // Lazy Initialization ile State'i başlatıyoruz.
    // Hem sözü (quote) hem de kuralı (rule) aynı anda saklıyoruz.
    const [dailyContent] = useState(() => {
        const today = new Date().toDateString(); // Örn: "Fri Jan 16 2026"
        const storedDate = localStorage.getItem("qLife_date");
        const storedData = localStorage.getItem("qLife_content");

        // Eğer tarih bugüne eşitse ve veri varsa, saklanan veriyi kullan
        if (storedDate === today && storedData) {
            try {
                return JSON.parse(storedData);
            } catch {
                // JSON hatası olursa aşağıdan devam et
            }
        }

        // Yeni gün veya ilk giriş: Rastgele seç
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const randomRule = rules[Math.floor(Math.random() * rules.length)];
        
        const newContent = {
            quote: randomQuote,
            rule: randomRule
        };

        // LocalStorage'a kaydet
        localStorage.setItem("qLife_date", today);
        localStorage.setItem("qLife_content", JSON.stringify(newContent));
        
        return newContent;
    });

    if (!dailyContent) return null;

    return (
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8 animate-fade-in group hover:shadow-xl transition-all duration-300">
            {/* ÜST KISIM: GÜNÜN SÖZÜ */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white relative overflow-hidden">
                {/* Arka plan dekoratif ikon */}
                <div className="absolute -right-6 -top-6 text-9xl opacity-10 rotate-12 select-none pointer-events-none">
                    ❞
                </div>

                <div className="flex gap-4 items-start relative z-10">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl shrink-0 border border-white/30 hidden sm:block">
                        <span className="text-3xl">💡</span>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white/30 px-2 py-0.5 rounded-full">Günün İlhamı</span>
                        </div>
                        <p className="text-lg md:text-xl font-medium leading-relaxed italic mb-3 text-shadow-sm">
                            "{dailyContent.quote.text}"
                        </p>
                        <div className="flex items-center gap-2 opacity-90">
                            <div className="h-px w-6 bg-white/60"></div>
                            <p className="text-sm font-bold tracking-wide">
                                {dailyContent.quote.author}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ALT KISIM: GÜNÜN KURALI / İPUCU */}
            <div className="bg-indigo-50/50 p-4 border-t border-indigo-100 flex items-center gap-4">
                <div className="shrink-0">
                    <img 
                        src="/Happy_Fox2_BF.png" 
                        alt="Mascot" 
                        className="w-12 h-14 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                    />
                </div>
                
                <div className="flex-1 border-l-2 border-indigo-200 pl-4">
                    <h4 className="text-xs font-black text-indigo-500 uppercase tracking-wide mb-0.5">
                        {dailyContent.rule.title}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                        {dailyContent.rule.desc}
                    </p>
                </div>
            </div>
        </div>
    );
}