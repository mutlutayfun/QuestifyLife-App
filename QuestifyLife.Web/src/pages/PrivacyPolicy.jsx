import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
                <div className="mb-8">
                    <Link to="/" className="text-primary font-bold hover:underline flex items-center gap-2">
                        <span>←</span> Ana Sayfaya Dön
                    </Link>
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 mb-2">Gizlilik Politikası</h1>
                <p className="text-gray-500 text-sm mb-10 border-b pb-6">Son Güncelleme: {new Date().toLocaleDateString()}</p>

                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">1.</span> Veri Sorumlusu ve Kapsam
                        </h2>
                        <p>QuestifyLife ("Şirket" veya "Biz"), kullanıcılarının ("Siz") gizliliğine büyük önem vermektedir. Bu politika, uygulamamızı kullanırken toplanan kişisel verilerinizi nasıl işlediğimizi, sakladığımızı ve koruduğumuzu açıklar. Hizmetlerimizi kullanarak bu politikayı kabul etmiş sayılırsınız.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">2.</span> Toplanan Veriler
                        </h2>
                        <p className="mb-2">Hizmet kalitesini artırmak ve yasal yükümlülükleri yerine getirmek amacıyla aşağıdaki verileri toplayabiliriz:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li><strong>Kimlik Bilgileri:</strong> Kullanıcı adı, e-posta adresi.</li>
                            <li><strong>İşlem Güvenliği:</strong> Şifre bilgileri (güvenli bir şekilde hashlenmiş olarak), giriş/çıkış kayıtları (loglar).</li>
                            <li><strong>Kullanım Verileri:</strong> Oluşturulan görevler, kazanılan puanlar, seviye bilgileri ve uygulama içi etkileşimler.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">3.</span> Verilerin Kullanım Amacı
                        </h2>
                        <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2 marker:text-primary">
                            <li>Kullanıcı hesabı oluşturmak ve yetkilendirmek.</li>
                            <li>Oyunlaştırma mekaniklerini (liderlik tablosu, rozetler) işletmek.</li>
                            <li>Teknik sorunları gidermek ve uygulama güvenliğini sağlamak.</li>
                            <li>Yasal yükümlülükleri yerine getirmek.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">4.</span> Çerezler ve İzleme Teknolojileri
                        </h2>
                        <p>Oturumunuzun sürekliliğini sağlamak ve tercihlerinizi hatırlamak amacıyla zorunlu çerezler kullanmaktayız. Reklam veya pazarlama amaçlı üçüncü taraf çerezleri kullanılmamaktadır.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">5.</span> Veri Güvenliği
                        </h2>
                        <p>Kişisel verileriniz, yetkisiz erişime, kaybolmaya veya değiştirilmeye karşı endüstri standardı güvenlik önlemleri (şifreleme, güvenlik duvarları) ile korunmaktadır.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">6.</span> İletişim ve Geliştirici
                        </h2>
                        <p>QuestifyLife, <strong>Mutlu Tayfun</strong> tarafından tasarlanmış ve geliştirilmiştir. Gizlilik politikamız, verileriniz veya uygulama hakkında herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.</p>
                        <strong>İletişim:</strong> mutlu.tayfunn@gmail.com
                    </section>
                </div>
            </div>
        </div>
    );
}