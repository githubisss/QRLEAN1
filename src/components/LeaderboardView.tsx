import React, { useState } from 'react';
import { Trophy, Award, Flame, Filter, Heart, Sparkles, Medal, User } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardViewProps {
  users: LeaderboardUser[];
  activeLanguage: 'EN' | 'TA';
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ users, activeLanguage }) => {
  const isTa = activeLanguage === 'TA';

  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'citizen' | 'household_donor'>('all');
  const [cityFilter, setCityFilter] = useState<string>('All');

  const filteredUsers = users.filter((u) => {
    if (userTypeFilter !== 'all' && u.userType !== userTypeFilter) return false;
    if (cityFilter !== 'All' && u.city !== cityFilter) return false;
    return true;
  });

  const getRankBadgeStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-300/50';
    if (rank === 2) return 'bg-slate-300 text-slate-900 border-slate-200';
    if (rank === 3) return 'bg-amber-700 text-white border-amber-800';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 rounded-2xl shadow-md text-center relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 flex items-center justify-center mx-auto mb-2 border border-white/20">
          <Trophy className="w-7 h-7" />
        </div>
        <h2 className="font-extrabold text-xl font-sans">
          {isTa ? 'தூய்மை தரவரிசை (Swachh Rankings)' : 'Community Eco Leaderboard'}
        </h2>
        <p className="text-xs text-emerald-200 mt-0.5">
          {isTa ? 'முன்னணி குடிமக்கள் மற்றும் நன்கொடையாளர்களைக் கௌரவித்தல்' : 'Honoring India’s top waste reporters and household donors'}
        </p>

        {/* Timeframe selector */}
        <div className="mt-3 inline-flex bg-emerald-950/60 p-1 rounded-xl border border-emerald-700/50 text-xs font-bold">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-1 rounded-lg transition-all ${
              timeframe === 'weekly' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-300 hover:text-white'
            }`}
          >
            {isTa ? 'வாராந்திர' : 'Weekly Top'}
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-1 rounded-lg transition-all ${
              timeframe === 'monthly' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-300 hover:text-white'
            }`}
          >
            {isTa ? 'மாதாந்திர' : 'Monthly All-Time'}
          </button>
        </div>
      </div>

      {/* Filters: Category & City */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* User Type Filter */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 font-semibold flex-1">
          <button
            onClick={() => setUserTypeFilter('all')}
            className={`flex-1 py-1 rounded-lg text-[11px] transition-all ${
              userTypeFilter === 'all' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUserTypeFilter('citizen')}
            className={`flex-1 py-1 rounded-lg text-[11px] transition-all ${
              userTypeFilter === 'citizen' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Citizens
          </button>
          <button
            onClick={() => setUserTypeFilter('household_donor')}
            className={`flex-1 py-1 rounded-lg text-[11px] transition-all ${
              userTypeFilter === 'household_donor' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Donors 🎁
          </button>
        </div>

        {/* City Filter dropdown */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-emerald-500"
        >
          <option value="All">All Cities</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Delhi NCR">Delhi NCR</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Hyderabad">Hyderabad</option>
          <option value="Pune">Pune</option>
        </select>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {filteredUsers.map((user, idx) => {
          const rank = idx + 1;

          return (
            <div
              key={user.id}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-2xs transition-all ${
                rank === 1
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50/50 border-amber-300'
                  : 'bg-white border-slate-200 hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs ${getRankBadgeStyle(
                    rank
                  )}`}
                >
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                </div>

                {/* Avatar */}
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs">{user.name}</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                      {user.badge}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{user.city}</span>
                    <span>•</span>
                    <span>{user.reportsCount} Reports</span>
                    {user.donationsCount ? <span>• {user.donationsCount} Donations</span> : null}
                  </div>
                </div>
              </div>

              {/* Eco Points counter */}
              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1 font-extrabold text-amber-600 text-sm">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{user.points}</span>
                </div>
                <div className="text-[9px] text-slate-400 font-medium uppercase">Eco-Pts</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
