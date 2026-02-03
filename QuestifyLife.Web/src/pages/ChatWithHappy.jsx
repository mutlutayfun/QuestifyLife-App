import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Layout from '../components/Layout.jsx';
// Toast importunu kaldırdık, çünkü paket sorun çıkarabiliyor.
// import { toast } from 'react-toastify';

export default function ChatWithHappy() {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: `Merhaba ${user?.username || 'Gezgin'}! Ben Happy 🦊 QuestifyLife'taki yol arkadaşınım. Bugün hangi görevleri parçalıyoruz? Ya da sadece biraz motivasyona mı ihtiyacın var?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Otomatik scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // --- API KEY YÖNETİMİ ---
        // 'import.meta.env' kullanımı için vite.config.js dosyasında target: 'es2022' ayarlandı.
        // Eğer hala sorun yaşarsan, apiKey değişkenine manuel olarak string atayabilirsin.
        let apiKey = "";
        
        try {
            apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        } catch (err) {
            console.warn("Environment variable okunamadı:", err);
        }
        
        // ------------------------

        if (!apiKey) {
            setMessages(prev => [...prev, { role: 'user', text: input }]);
            setInput('');
            
            setTimeout(() => {
                console.error("HATA: VITE_GEMINI_API_KEY bulunamadı.");
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    text: "Bağlantı hatası! (API Anahtarı eksik). Lütfen .env dosyasını kontrol et. 🦊🔌" 
                }]);
            }, 500);
            return;
        }

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const systemPrompt = `
                Sen "Happy" adında, QuestifyLife uygulamasının neşeli, bilge ve motive edici tilki maskotusun.
                Kullanıcı adı: ${user?.username || 'Kullanıcı'}.
                Görevin kullanıcıyı motive etmek ve rehberlik etmek.
                Kısa ve öz cevaplar ver (maksimum 2-3 cümle).
            `;

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: userMessage.text }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] }
                })
            });

            if (!response.ok) {
                // HATA DÜZELTME: errorData değişkenini artık kullanıyoruz.
                // Ayrıca, response.json() bazen başarısız olabilir (HTML dönebilir), bu yüzden try-catch ile sarmak daha güvenlidir.
                let errorMessage = `API Hatası: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += ` - ${errorData.error?.message || JSON.stringify(errorData)}`;
                } catch {

                    console.warn("Hata detayları JSON formatında değil.");
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, frekanslar karıştı! 🦊";

            setMessages(prev => [...prev, { role: 'model', text: replyText }]);

        } catch (error) {
            console.error("Happy Error:", error);
            // Toast kullanımını kaldırdık, kullanıcıya mesaj kutusunda bilgi veriyoruz.
            // toast.error("Happy ile bağlantı kurulamadı.");
            
            let msg = "Üzgünüm, şu an bağlantımda bir sorun var. 🦊💔";
            if (error.message.includes("400") || error.message.includes("API Key")) msg = "API Anahtarı hatalı veya eksik olabilir. 🦊🔑";
            
            setMessages(prev => [...prev, { role: 'model', text: msg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-140px)] max-w-md mx-auto relative">
                {/* Header */}
                <div className="bg-gradient-to-b from-orange-400 to-orange-500 p-4 rounded-b-[2rem] shadow-lg flex items-center gap-4 z-10 mx-2 mt-2">
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-orange-200 shadow-sm overflow-hidden flex-shrink-0">
                        <img src="/Characters/Happy_Fox_BF.png" alt="Happy" className="w-full h-full object-contain scale-110" />
                    </div>
                    <div>
                        <h1 className="text-white font-black text-xl tracking-tight">Happy</h1>
                        <p className="text-orange-100 text-xs font-medium bg-white/20 px-2 py-0.5 rounded-full inline-block">Yapay Zeka Yaşam Koçu 🦊</p>
                    </div>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex-shrink-0 mr-2 overflow-hidden self-end mb-1">
                                    <img src="/Characters/Happy_Fox_BF.png" alt="Happy" className="w-full h-full object-contain" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex-shrink-0 mr-2 overflow-hidden self-end mb-1">
                                    <img src="/Characters/Happy_Fox_BF.png" alt="Happy" className="w-full h-full object-contain" />
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                    <form onSubmit={sendMessage} className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Happy'e bir şeyler söyle..."
                            className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 text-sm rounded-full py-4 pl-5 pr-14 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all shadow-inner"
                        />
                        <button type="submit" disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            ➤
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}