import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white p-4 rounded-xl shadow-md border-l-4 ${color} flex items-center justify-between`}>
      <div>
        <p className="text-gray-500 text-sm font-semibold">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className="text-3xl opacity-80">
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;