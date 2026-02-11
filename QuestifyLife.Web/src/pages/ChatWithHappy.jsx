import { useState, useRef, useEffect, useContext } from 'react';
// Derleme hatalarını gidermek için dosya uzantıları kaldırıldı
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';
// Resmi Google Generative AI kütüphanesi
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function ChatWithHappy() {
    const { user } = useContext(AuthContext);
    
    /**
     * API anahtarını gizli karakterlerden, tırnaklardan ve satır sonlarından arındıran yardımcı fonksiyon.
     * "Failed to execute 'append' on 'Headers'" hatasını önlemek için kritiktir.
     */
    const sanitizeKey = (key) => {
        if (!key) return "";
        return key
            .trim()
            .replace(/^["']|["']$/g, '') // Baş ve sondaki tırnakları sil
            .replace(/[^\x20-\x7E]/g, ""); // ASCII dışı tüm gizli/hatalı karakterleri temizle
    };

    // --- 🔑 API KEY & SDK AYARLARI ---
    const [apiKey, setApiKey] = useState(() => {
        let envKey = "";
        try {
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                envKey = import.meta.env.VITE_GEMINI_API_KEY || "";
            }
        } catch (e) {
            console.warn("Ortam değişkenleri okunurken bir kısıtlamayla karşılaşıldı.",e);
        }
        return sanitizeKey(envKey || localStorage.getItem("QUESTIFY_GEMINI_KEY") || "");
    });
    
    const [showKeyInput, setShowKeyInput] = useState(!apiKey);
    const [tempKey, setTempKey] = useState("");

    // Sohbet Durumu
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: `Selam ${user?.username || 'Gezgin'}! 🦊 Ben Happy. Bugün QuestifyLife'ta hangi seviyeye atlıyoruz? Yeni bir görev için hazır mısın?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Otomatik Kaydırma
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, showKeyInput]);

    // Anahtarı Kaydet (Manuel giriş için)
    const handleSaveKey = (e) => {
        e.preventDefault();
        const cleanKey = sanitizeKey(tempKey);
        if (!cleanKey) return;
        localStorage.setItem("QUESTIFY_GEMINI_KEY", cleanKey);
        setApiKey(cleanKey);
        setShowKeyInput(false);
        setMessages(prev => [...prev, { role: 'model', text: "Bağlantı başarılı! Enerjim %100! 🦊✨" }]);
    };

    // Mesaj Gönderme (SDK Kullanımı)
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setIsLoading(true);

        try {
            // Anahtarın temiz olduğundan emin oluyoruz (Headers hatasını önlemek için)
            const activeKey = sanitizeKey(apiKey);
            if (!activeKey) throw new Error("API_KEY_MISSING");

            // 1. SDK'yı başlat
            const genAI = new GoogleGenerativeAI(activeKey);
            
            // 2. Modeli sistem talimatıyla yapılandır
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: {
                    role: "system",
                    parts: [{ text: `
                        Sen QuestifyLife uygulamasının maskotu "Happy" isimli neşeli, bilge ve motive edici tilkisin.
                        Kullanıcı Adı: ${user?.username || 'Gezgin'}.
                        Kişilik Özelliklerin:
                        - Çok enerjik, samimi ve destekleyicisin.
                        - Kullanıcıyı her zaman "Quest" (Görev) yapmaya ve seviye atlamaya teşvik edersin.
                        - Oyunlaştırma terimlerini (XP, Level, Arena, Lonca) doğal bir şekilde kullanırsın.
                        - Cevapların kısa, öz ve etkili olmalı (maks 3 cümle).
                        - Bolca emoji kullan (özellikle 🦊, ✨, 🚀).
                        - Asla bir yapay zeka olduğunu vurgulama, sen yaşayan bir karaktersin.
                    `}]
                },
            });

            // 3. Sohbeti başlat ve cevabı al
            const result = await model.generateContent(userText);
            const response = await result.response;
            const text = response.text();

            if (!text) throw new Error("API boş bir cevap döndürdü.");

            setMessages(prev => [...prev, { role: 'model', text: text }]);

        } catch (error) {
            console.error("Gemini SDK Detaylı Hata:", error);
            
            let errorMsg = "Frekanslarda bir parazit var dostum! 🦊💔";
            const rawError = error.toString();
            
            if (rawError.includes("API_KEY_INVALID") || rawError.includes("403") || rawError.includes("400")) {
                errorMsg = "🔑 API anahtarın geçersiz veya yetkisiz. Lütfen anahtarı kontrol et.";
                setShowKeyInput(true);
            } else if (rawError.includes("429")) {
                errorMsg = "⏳ Kota sınırına takıldık. Bir dakika dinlenip tekrar deneyelim mi? 🦊";
            } else if (rawError.includes("fetch") || rawError.includes("NetworkError") || rawError.includes("Headers")) {
                errorMsg = "🌐 Bağlantı hatası! API anahtarında hatalı karakterler olabilir veya internet erişimi kısıtlı. 🦊📡";
                // Headers hatası genellikle anahtar kaynaklıdır, girişi tekrar açalım
                if (rawError.includes("Headers")) setShowKeyInput(true);
            } else if (rawError.includes("API_KEY_MISSING")) {
                errorMsg = "🔑 Konuşabilmem için bir API anahtarı girmelisin.";
                setShowKeyInput(true);
            } else {
                errorMsg = `🚫 Bir sorun oluştu: ${error.message?.substring(0, 60)}...`;
            }

            setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-140px)] max-w-md mx-auto relative">
                {/* Header */}
                <div className="bg-gradient-to-b from-orange-400 to-orange-500 p-4 rounded-b-[2rem] shadow-lg flex items-center justify-between z-10 mx-2 mt-2 border-b border-orange-300">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white rounded-full border-4 border-orange-200 shadow-sm flex items-center justify-center text-3xl">
                            🦊
                        </div>
                        <div>
                            <h1 className="text-white font-black text-lg tracking-tight">Happy</h1>
                            <p className="text-orange-100 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">Motive Edici Rehber</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowKeyInput(true)} 
                        className="text-white/80 hover:text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 transition-all active:scale-95"
                    >
                        ⚙️ Ayarlar
                    </button>
                </div>

                {/* Chat Alanı */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4 bg-gray-50/50">
                    {showKeyInput && (
                        <div className="bg-white border-2 border-orange-200 rounded-2xl p-4 animate-fade-in-up shadow-sm mb-4 border-dashed">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <span className="text-lg">🔑</span> Gemini API Anahtarı Gerekli
                            </h3>
                            <p className="text-[10px] text-gray-500 mt-1 mb-3">
                                Geçersiz karakter hatasını önlemek için anahtarı buraya temiz bir şekilde girin.
                            </p>
                            <form onSubmit={handleSaveKey} className="flex flex-col gap-2">
                                <input 
                                    type="password" 
                                    placeholder="AIzaSy..."
                                    className="text-xs p-3 rounded-lg border border-gray-200 focus:border-orange-500 bg-gray-50 outline-none transition-all"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                />
                                <button type="submit" className="bg-orange-500 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-all shadow-md active:shadow-inner">
                                    Happy'yi Uyandır 🚀
                                </button>
                            </form>
                        </div>
                    )}

                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm 
                                ${msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Alanı */}
                <div className="p-4 bg-white border-t border-gray-100 pb-safe">
                    <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={apiKey ? "Happy ile konuş..." : "Önce anahtarı girin..."}
                            disabled={!apiKey || isLoading}
                            className="w-full bg-gray-50 text-gray-800 placeholder-gray-400 text-sm rounded-full py-4 pl-5 pr-14 focus:ring-2 focus:ring-orange-300 outline-none transition-all disabled:opacity-50 border border-gray-100 shadow-inner"
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim() || !apiKey} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all disabled:grayscale disabled:opacity-50"
                        >
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}