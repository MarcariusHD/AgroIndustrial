import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 group cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-emerald-600 group-hover:scale-110 transition-transform duration-500`}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 ${trend > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          <TrendingUp size={10} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">{label}</p>
    <h3 className="text-3xl font-black text-gray-900 mt-1">{value}</h3>
  </motion.div>
);

export default StatCard;