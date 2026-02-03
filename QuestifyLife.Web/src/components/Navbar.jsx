import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, image, label, activeColor, activeBg, glowColor, isSpecial }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    // Özel "Happy" Butonu Tasarımı
    if (isSpecial) {
        return (
            <div className="relative -top-8 group">
                 <Link to={to} className="relative flex flex-col items-center justify-center transition-all duration-300 transform group-hover:scale-105 active:scale-95">
                    {/* Dış Halka ve Glow Efekti */}
                    <div className={`absolute w-20 h-20 rounded-full blur-xl bg-orange-400 opacity-40 animate-pulse ${isActive ? 'bg-orange-500 opacity-60' : ''}`}></div>
                    
                    {/* Ana Daire */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 border-[4px] border-white shadow-xl flex items-center justify-center relative z-10">
                        <img 
                            src={image} 
                            alt={label}
                            className="w-12 h-12 object-contain filter drop-shadow-md"
                        />
                    </div>

                    {/* Label (Happy) */}
                    <span className="absolute -bottom-6 text-[11px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 shadow-sm">
                        {label}
                    </span>
                 </Link>
            </div>
        );
    }

    // Standart NavItem Tasarımı
    return (
        <Link to={to} className="relative group flex-1 flex flex-col items-center justify-center h-full transition-all duration-300">
             {/* Arka Plan Parlaması (Büyü Efekti) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full blur-xl transition-all duration-500 
                ${isActive ? `${glowColor} opacity-40 scale-125` : 'opacity-0 scale-0 group-hover:opacity-20 group-hover:scale-100 group-hover:bg-gray-300'}`} 
            />
            
            {/* Aktif Buton Arka Planı (Yuvarlak) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl transition-all duration-300 
                ${isActive ? `${activeBg} scale-100` : 'bg-transparent scale-75 group-hover:bg-gray-50'}`} 
            />
            
            {/* İkon (Görsel) ve Metin */}
            <div className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? '-translate-y-1' : 'translate-y-0'}`}>
                {/* Görsel İkon - Büyütüldü (w-9 h-9) */}
                <img 
                    src={image} 
                    alt={label}
                    className={`w-9 h-9 object-contain filter drop-shadow-sm transition-transform duration-300 
                        ${isActive ? 'scale-110 animate-bounce-slight' : 'grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-105'}`}
                />
                
                {/* Label - Sürekli Görünür */}
                <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 
                    ${isActive ? `opacity-100 ${activeColor}` : 'opacity-60 text-gray-400'}`}>
                    {label}
                </span>
            </div>

             {/* Aktiflik Noktası */}
             <div className={`absolute bottom-1.5 w-1 h-1 rounded-full transition-all duration-500 
                ${isActive ? `bg-current opacity-100 scale-150 ${activeColor}` : 'opacity-0 scale-0'}`} 
            />
        </Link>
    );
};

const Navbar = () => {
    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 pb-safe">
            <div className="max-w-md mx-auto flex justify-between items-end h-[85px] px-2 pb-2">
                {/* 🦊 ORTA TUŞ: HAPPY */}
                <div className="w-20 flex justify-center z-50">
                     <NavItem 
                        to="/happy" 
                        image="/Characters/Happy_Fox_BF.png" 
                        label="HAPPY" 
                        isSpecial={true}
                    />
                </div>
                <NavItem 
                    to="/" 
                    image="/Castle.png" 
                    label="KALE" 
                    activeColor="text-blue-600" 
                    activeBg="bg-blue-50"
                    glowColor="bg-blue-500"
                />
                <NavItem 
                    to="/history" 
                    image="/History.png" 
                    label="GEÇMİŞ" 
                    activeColor="text-violet-600" 
                    activeBg="bg-violet-50"
                    glowColor="bg-violet-500"
                />
                
            

                <NavItem 
                    to="/leaderboard" 
                    image="/Arena.png" 
                    label="ARENA" 
                    activeColor="text-orange-600" 
                    activeBg="bg-orange-50"
                    glowColor="bg-orange-500"
                />
                <NavItem 
                    to="/friends" 
                    image="/HappyAndEce_BF.png" 
                    label="LONCA" 
                    activeColor="text-green-600" 
                    activeBg="bg-green-50"
                    glowColor="bg-green-500"
                />
                <NavItem 
                    to="/profile" 
                    image="/HappyProfile.png" 
                    label="KAHRAMAN" 
                    activeColor="text-pink-600" 
                    activeBg="bg-pink-100"
                    glowColor="bg-pink-500"
                />
            </div>
        </nav>
    );
};

export default Navbar;