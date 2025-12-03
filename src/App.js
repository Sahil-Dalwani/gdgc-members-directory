import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Users, MapPin, Loader2, AlertCircle } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'https://backend-8u5mz2smy-sahil-dalwanis-projects.vercel.app';

// API Functions
const fetchMembers = async () => {
  const response = await fetch(`${API_BASE_URL}/members`);
  if (!response.ok) {
    throw new Error('Failed to fetch members');
  }
  const data = await response.json();
  return data.data;
};


const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div 
            className="w-32 h-32 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center transform transition-transform duration-500"
            style={{
              animation: 'bounce 2s infinite, rotate 3s ease-in-out infinite'
            }}
          >
            <Users className="w-16 h-16 text-purple-600" />
          </div>
        </div>
        <h1 
          className="text-5xl font-bold text-white mb-4 tracking-tight"
          style={{ animation: 'fadeIn 1s ease-in' }}
        >
          GDGC
        </h1>
        <p className="text-xl text-white/90 mb-8">Members Directory</p>
        <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden mx-auto">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotate {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

// Member Card Component
const MemberCard = ({ member, isDark }) => {
  return (
    <div 
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } shadow-lg`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        <div className="flex items-start gap-4 mb-4">
          <img 
            src={member.photo} 
            alt={member.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all"
          />
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {member.name}
            </h3>
            <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
              {member.role}
            </p>
          </div>
        </div>

        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {member.bio}
        </p>

        <div className="flex items-center gap-2 mb-3 text-sm">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {member.location}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {member.skills.slice(0, 3).map((skill, idx) => (
            <span 
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }, [isDark]);

  useEffect(() => {
    if (!showSplash) {
      loadMembers();
    }
  }, [showSplash]);

  useEffect(() => {
  filterMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [members, searchQuery, roleFilter, locationFilter]);

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (err) {
      setError('Failed to load members. Please make sure the backend server is running on http://localhost:5000');
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.bio.toLowerCase().includes(query) ||
        m.skills.some(s => s.toLowerCase().includes(query))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(m => m.role === roleFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(m => m.location === locationFilter);
    }

    setFilteredMembers(filtered);
  };

  const roles = ['all', ...new Set(members.map(m => m.role))];
  const locations = ['all', ...new Set(members.map(m => m.location))];

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}
    >
      {/* Header */}
      <header 
        className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
          isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                } shadow-lg`}
              >
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  GDGC Members
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filteredMembers.length} members
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-xl transition-all ${
                isDark 
                  ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search 
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} 
              />
              <input
                type="text"
                placeholder="Search by name, bio, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl transition-all ${
                  isDark 
                    ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500' 
                    : 'bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 shadow-sm'
                } outline-none`}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl transition-all outline-none ${
                isDark 
                  ? 'bg-gray-700 text-white focus:ring-2 focus:ring-blue-500' 
                  : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-sm'
              }`}
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl transition-all outline-none ${
                isDark 
                  ? 'bg-gray-700 text-white focus:ring-2 focus:ring-blue-500' 
                  : 'bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-sm'
              }`}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc === 'all' ? 'All Locations' : loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Loading members...
            </p>
          </div>
        )}

        {error && (
          <div 
            className={`p-6 rounded-2xl flex items-start gap-4 ${
              isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'
            }`}
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <p className={`font-semibold mb-1 ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                Error Loading Members
              </p>
              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                {error}
              </p>
              <button
                onClick={loadMembers}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filteredMembers.length === 0 && (
          <div className="text-center py-20">
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No members found
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {!loading && !error && filteredMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map(member => (
              <MemberCard key={member.id} member={member} isDark={isDark} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}