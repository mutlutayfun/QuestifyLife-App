import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Kullanıcı daha önce kabul etmiş mi kontrol et
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Biraz gecikmeli gelsin ki kullanıcı önce siteyi görsün
            const timer = setTimeout(() => setShow(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 animate-slide-up">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                    <span className="text-xl mr-2">🍪</span>
                    Sizlere daha iyi bir deneyim sunmak için çerezleri (cookies) kullanıyoruz. 
                    Devam ederek <Link to="/privacy-policy" className="text-primary font-bold hover:underline">Gizlilik Politikamızı</Link> kabul etmiş sayılırsınız.
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleAccept}
                        className="flex-1 md:flex-none bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-600 transition shadow-sm whitespace-nowrap"
                    >
                        Tamam, Kabul Et
                    </button>
                </div>
            </div>
        </div>
    );
}