import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Layout from '../components/Layout';

// Hazır Avatar Listesi (Dosya isimleri backend ile uyumlu olmalı)
// Bu resimleri public/avatars klasörüne koyman gerekecek, yoksa kırık görünür.
// Şimdilik sadece isimlerini simüle ediyoruz.
const AVATARS = [
    "avatar_1", "avatar_2", "avatar_3", "avatar_4", "avatar_5"
];

export default function Profile() {
    const { logout } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Düzenleme form verileri
    const [formData, setFormData] = useState({
        personalManifesto: "",
        dailyTargetPoints: 100,
        avatarId: "avatar_1"
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/User/profile');
            setProfile(response.data);
            setFormData({
                personalManifesto: response.data.personalManifesto || "",
                dailyTargetPoints: response.data.dailyTargetPoints,
                avatarId: response.data.avatarId || "avatar_1"
            });
        } catch (error) {
            console.error("Profil yüklenemedi", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/User/profile', formData);
            setIsEditing(false);
            fetchProfile(); // Güncel veriyi çek
            alert("Profil güncellendi!");
        } catch (error) {
            console.error("Tamamlama hatası:", error);
            alert("Profil güncellenirken hata oluştu!");
        }
    };

    if (loading) return <div className="p-10 text-center">Yükleniyor...</div>;

    return (
        <Layout>
            <div className="max-w-md mx-auto p-4">
                {/* Üst Başlık */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Profilim</h1>
                    <button onClick={logout} className="text-danger text-sm font-semibold">Çıkış Yap</button>
                </div>

                {/* Avatar ve İsim */}
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6 text-center border border-gray-100">
                    <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl overflow-hidden">
                        {/* Eğer gerçek resim dosyaların varsa: <img src={`/avatars/${profile.avatarId}.png`} /> */}
                        {/* Şimdilik emoji ile simüle edelim: */}
                        <span>
                            {profile.avatarId === 'avatar_1' ? '👨‍💻' : 
                             profile.avatarId === 'avatar_2' ? '🦸‍♀️' : 
                             profile.avatarId === 'avatar_3' ? '🥷' : '🧑‍🚀'}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-dark">{profile.username}</h2>
                    <p className="text-gray-500 text-sm">{profile.email}</p>
                    
                    <div className="flex justify-center gap-4 mt-4">
                        <div className="text-center">
                            <span className="block font-bold text-lg text-primary">{profile.totalXp}</span>
                            <span className="text-xs text-gray-400">Toplam XP</span>
                        </div>
                        <div className="text-center">
                            <span className="block font-bold text-lg text-secondary">{profile.currentStreak} 🔥</span>
                            <span className="text-xs text-gray-400">Seri</span>
                        </div>
                    </div>
                </div>

                {/* Rozetler (Badges) */}
                <div className="mb-6">
                    <h3 className="font-bold text-gray-700 mb-3">Rozet Koleksiyonum</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {profile.badges && profile.badges.map((badge, index) => (
                            <div key={index} className={`flex flex-col items-center p-2 rounded-lg ${badge.isEarned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-100 opacity-50 grayscale'}`}>
                                <span className="text-2xl mb-1">
                                    {/* Backend'den gelen ikon ismine göre emoji */}
                                    {badge.iconName === 'star' ? '⭐' : 
                                     badge.iconName === 'crown' ? '👑' :
                                     badge.iconName === 'fire' ? '🔥' : '🏅'}
                                </span>
                                <span className="text-[10px] text-center font-medium leading-tight">{badge.name}</span>
                            </div>
                        ))}
                        {(!profile.badges || profile.badges.length === 0) && (
                            <p className="text-xs text-gray-400 col-span-4 text-center">Henüz rozet sistemi aktif değil veya hiç rozetin yok.</p>
                        )}
                    </div>
                </div>

                {/* Ayarlar Formu */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-700">Hedefler & Manifesto</h3>
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`text-sm px-4 py-1 rounded-full ${isEditing ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {isEditing ? 'Kaydet' : 'Düzenle'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Günlük Hedef */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Günlük Puan Hedefi</label>
                            {isEditing ? (
                                <input 
                                    type="number" 
                                    className="w-full p-2 border rounded bg-gray-50"
                                    value={formData.dailyTargetPoints}
                                    onChange={(e) => setFormData({...formData, dailyTargetPoints: parseInt(e.target.value)})}
                                />
                            ) : (
                                <p className="text-gray-800 font-medium">{profile.dailyTargetPoints} Puan</p>
                            )}
                        </div>

                        {/* Manifesto */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kendime Sözüm (Manifesto)</label>
                            {isEditing ? (
                                <textarea 
                                    className="w-full p-2 border rounded bg-gray-50 text-sm h-24"
                                    value={formData.personalManifesto}
                                    onChange={(e) => setFormData({...formData, personalManifesto: e.target.value})}
                                    placeholder="Her gün daha iyiye..."
                                />
                            ) : (
                                <p className="text-gray-800 italic text-sm border-l-2 border-primary pl-3 py-1 bg-blue-50 rounded-r">
                                    "{profile.personalManifesto || 'Henüz bir söz vermedin...'}"
                                </p>
                            )}
                        </div>

                        {/* Avatar Seçimi (Sadece Edit modunda görünür) */}
                        {isEditing && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Avatarını Seç</label>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {AVATARS.map(avatar => (
                                        <button
                                            key={avatar}
                                            onClick={() => setFormData({...formData, avatarId: avatar})}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all flex-shrink-0
                                                ${formData.avatarId === avatar ? 'border-primary bg-blue-50 scale-110' : 'border-gray-200 bg-white'}`}
                                        >
                                            {avatar === 'avatar_1' ? '👨‍💻' : 
                                             avatar === 'avatar_2' ? '🦸‍♀️' : 
                                             avatar === 'avatar_3' ? '🥷' : '🧑‍🚀'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
