import { useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

const emojis = ['😡', '🙁', '😐', '🙂', '😍'];

export default function FeedbackModal({ onClose }) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(5); // 1-5
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/Feedback', {
                subject,
                message,
                rating
            });
            toast.success("Geri bildirimin için teşekkürler! 🚀");
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Gönderilemedi, lütfen tekrar dene.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>

                <div className="text-center mb-6">
                    <span className="text-4xl block mb-2">📣</span>
                    <h2 className="text-xl font-bold text-gray-800">Fikrin Bizim İçin Önemli</h2>
                    <p className="text-sm text-gray-500">Uygulamayı geliştirmemize yardımcı ol.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating */}
                    <div className="flex justify-center gap-4 mb-4">
                        {emojis.map((emoji, index) => {
                            const score = index + 1;
                            return (
                                <button
                                    key={score}
                                    type="button"
                                    onClick={() => setRating(score)}
                                    className={`text-3xl transition transform hover:scale-125 ${rating === score ? 'scale-125 drop-shadow-md grayscale-0' : 'grayscale opacity-50'}`}
                                >
                                    {emoji}
                                </button>
                            );
                        })}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Konu</label>
                        <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border rounded-lg p-2 bg-gray-50 focus:outline-primary"
                            required
                        >
                            <option value="" disabled>Seçiniz...</option>
                            <option value="Hata Bildirimi">🐞 Hata Bildirimi</option>
                            <option value="Öneri">💡 Öneri / İstek</option>
                            <option value="Teşekkür">❤️ Teşekkür</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Mesajın</label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded-lg p-3 bg-gray-50 focus:outline-primary min-h-[100px]"
                            placeholder="Bize ne söylemek istersin?"
                            required
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Gönderiliyor...' : 'Gönder 🚀'}
                    </button>
                </form>
            </div>
        </div>
    );
}