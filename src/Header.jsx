const Header = ({ activeModule }) => {
  return (
    <header className="mb-10 flex items-center">
      <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter flex-grow">
        {activeModule.replace('_', ' ')}
      </h1>
      <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 text-[10px] font-bold text-gray-500 uppercase">
        Sistema AgroIndustrial v1.0
      </div>
    </header>
  );
};

export default Header;