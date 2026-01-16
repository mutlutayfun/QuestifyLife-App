import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
                <div className="mb-8">
                    <Link to="/" className="text-primary font-bold hover:underline flex items-center gap-2">
                        <span>←</span> Ana Sayfaya Dön
                    </Link>
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 mb-2">Kullanım Koşulları</h1>
                <p className="text-gray-500 text-sm mb-10 border-b pb-6">Son Güncelleme: {new Date().toLocaleDateString()}</p>
                
                <div className="space-y-8 text-gray-700 leading-relaxed text-lg">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">1.</span> Kabul ve Kapsam
                        </h2>
                        <p>QuestifyLife uygulamasını ("Hizmet") kullanarak, bu Kullanım Koşullarını ("Koşullar") okuduğunuzu, anladığınızı ve bunlara bağlı kalmayı kabul ettiğinizi beyan edersiniz. Eğer bu koşulları kabul etmiyorsanız, lütfen Hizmeti kullanmayınız.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">2.</span> Hesap Güvenliği ve Sorumluluk
                        </h2>
                        <p>Hizmeti kullanmak için oluşturduğunuz hesabın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmamalısınız. Hesabınız altında gerçekleşen tüm işlemlerden siz sorumlu tutulursunuz. Şüpheli bir durum fark ettiğinizde derhal bize bildirmelisiniz.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">3.</span> Hizmetin Kullanımı ve Yasaklar
                        </h2>
                        <p className="mb-2">Hizmeti kullanırken aşağıdakileri yapmayacağınızı kabul edersiniz:</p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                            <li>Yasalara aykırı, zararlı, tehditkar veya rahatsız edici içerik paylaşmak.</li>
                            <li>Uygulamanın güvenliğini ihlal etmeye veya sisteme zarar vermeye çalışmak.</li>
                            <li>Otomatik botlar veya yazılımlar kullanarak sisteme erişmek.</li>
                            <li>Diğer kullanıcıların gizliliğini ihlal etmek.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">4.</span> Fikri Mülkiyet
                        </h2>
                        <p>QuestifyLife uygulaması, tasarımı, logosu, kodları ve tüm içeriği Şirket'in mülkiyetindedir ve telif hakkı yasalarıyla korunmaktadır. İzinsiz kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">5.</span> Hizmet Değişiklikleri ve Fesih
                        </h2>
                        <p>Şirket, herhangi bir zamanda Hizmeti değiştirme, durdurma veya sonlandırma hakkını saklı tutar. Kurallara uymayan kullanıcıların hesapları önceden bildirim yapılmaksızın askıya alınabilir veya silinebilir.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-primary">6.</span> Sorumluluk Reddi
                        </h2>
                        <p>Hizmet "olduğu gibi" sunulmaktadır. Şirket, uygulamanın kesintisiz veya hatasız çalışacağını garanti etmez. Veri kaybı veya hizmet kesintilerinden doğabilecek zararlardan sorumlu tutulamaz.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}