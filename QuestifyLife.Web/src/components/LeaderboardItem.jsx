import React from 'react';

const LeaderboardItem = ({ rank, user, isMe }) => {
    // Avatar ID'ye göre emoji (Profil sayfasındakiyle aynı mantık)
    const getAvatarEmoji = (id) => {
        if (id === 'avatar_1') return '👨‍💻';
        if (id === 'avatar_2') return '🦸‍♀️';
        if (id === 'avatar_3') return '🥷';
        if (id === 'avatar_4') return '🧑‍🚀';
        return '👤';
    };

    return (
        <div className={`flex items-center justify-between p-3 mb-2 rounded-xl border ${isMe ? 'bg-blue-50 border-primary shadow-sm' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-3">
                {/* Sıralama Numarası */}
                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${rank <= 3 ? 'text-white' : 'text-gray-500 bg-gray-100'}`}
                     style={{ backgroundColor: rank === 1 ? '#f1c40f' : rank === 2 ? '#95a5a6' : rank === 3 ? '#cd7f32' : '' }}>
                    {rank}
                </div>

                {/* Avatar */}
                <div className="text-2xl">
                    {getAvatarEmoji(user.avatarId || 'avatar_1')}
                </div>

                {/* İsim ve Durum */}
                <div>
                    <p className={`font-bold text-sm ${isMe ? 'text-primary' : 'text-gray-800'}`}>
                        {user.username} {isMe && "(Sen)"}
                    </p>
                    {/* Backend'den gelen 'isOnlineToday' verisi varsa burada gösterebiliriz */}
                    {/* <p className="text-[10px] text-gray-400">🔥 {user.dailyStreak} Günlük Seri</p> */}
                </div>
            </div>

            {/* Puan */}
            <div className="text-right">
                <span className="block font-bold text-primary">{user.totalXp} XP</span>
            </div>
        </div>
    );
};

export default LeaderboardItem;
