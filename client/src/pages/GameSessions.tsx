import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, CloudRain, Smile, Calendar, Trophy, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const GAME_CONFIG: any = {
  bubble: {
    title: 'Bubble Pop',
    icon: Zap,
    color: 'bg-primary text-white',
    description: 'Pop stress away with this satisfying physics game.'
  },
  memory: {
    title: 'Mind Match',
    icon: Smile,
    color: 'bg-secondary text-white',
    description: 'Sharpen your focus by finding matching pairs.'
  },
  breathing: {
    title: 'Box Breathing',
    icon: CloudRain,
    color: 'bg-accent text-black',
    description: 'Simple visual guide for deep breathing.'
  },
  journal: {
    title: 'Mood Journal',
    icon: Calendar,
    color: 'bg-slate-800 text-white',
    description: 'Deep dive into your feelings with guided prompts.'
  },
  zen: {
    title: 'Zen Garden',
    icon: Gamepad2,
    color: 'bg-destructive text-white',
    description: 'Rake sand and place stones in your digital garden.'
  }
};

// Celo Sepolia Blockscout explorer base + tx path
const CELO_SEPOLIA_EXPLORER_BASE = 'https://celo-sepolia.blockscout.com';
const TX_PATH = '/tx/';

export default function GameSessionsPage() {
  const { gameSessions, isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
          <AlertCircle className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black font-heading uppercase">Wallet Not Connected</h2>
          <p className="text-slate-500 font-bold mt-2">Connect your wallet to view your game sessions.</p>
        </div>
      </div>
    );
  }

  if (gameSessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
          <Gamepad2 className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black font-heading uppercase">No Game Sessions Yet</h2>
          <p className="text-slate-500 font-bold mt-2">Play some games to see your sessions recorded here.</p>
        </div>
        <Link href="/games">
          <Button className="btn-flat bg-black text-white font-bold px-8 py-6">
            Play Games
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalGamesPlayed = gameSessions.length;
  const highestScore = Math.max(...gameSessions.map(s => s.score), 0);
  const averageScore = Math.round(
    gameSessions.reduce((sum, s) => sum + s.score, 0) / gameSessions.length
  );

  const gameBreakdown: { [key: string]: number } = {};
  gameSessions.forEach(session => {
    gameBreakdown[session.gameId] = (gameBreakdown[session.gameId] || 0) + 1;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="border-b-2 border-black pb-6">
        <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">
          Game Sessions
        </h1>
        <p className="text-xl font-bold text-slate-500 mt-2">Your gaming history on-chain.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black text-white border-2 border-black p-6 rounded-xl shadow-flat"
        >
          <div className="text-sm font-black uppercase text-slate-300 mb-2">Total Played</div>
          <div className="text-4xl font-heading font-black">{totalGamesPlayed}</div>
          <div className="text-xs font-bold text-slate-400 mt-2">game sessions</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-accent text-black border-2 border-black p-6 rounded-xl shadow-flat"
        >
          <div className="text-sm font-black uppercase text-slate-600 mb-2">Highest Score</div>
          <div className="text-4xl font-heading font-black">{highestScore}</div>
          <div className="text-xs font-bold text-slate-600 mt-2">points earned</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-primary text-white border-2 border-black p-6 rounded-xl shadow-flat"
        >
          <div className="text-sm font-black uppercase text-blue-100 mb-2">Average Score</div>
          <div className="text-4xl font-heading font-black">{averageScore}</div>
          <div className="text-xs font-bold text-blue-100 mt-2">per session</div>
        </motion.div>
      </div>

      {/* Game Breakdown */}
      <div className="border-2 border-black p-6 rounded-xl bg-white shadow-flat">
        <h2 className="text-2xl font-heading font-black mb-4">Games Played</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(gameBreakdown).map(([gameId, count]) => {
            const config =
              GAME_CONFIG[gameId] || {
                title: gameId,
                icon: Gamepad2,
                color: 'bg-slate-200 text-black',
              };
            const Icon = config.icon;

            return (
              <motion.div
                key={gameId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${config.color} p-4 rounded-lg border-2 border-black shadow-flat-sm flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <div className="font-black text-sm">{config.title}</div>
                    <div className="text-xs font-bold opacity-75">{count} sessions</div>
                  </div>
                </div>
                <div className="text-2xl font-heading font-black">{count}x</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Sessions Timeline */}
      <div className="relative border-l-4 border-black ml-4 md:ml-8 pl-8 md:pl-12 py-4 space-y-12">
        {gameSessions.map((session, idx) => {
          const config =
            GAME_CONFIG[session.gameId] || {
              title: session.gameId,
              icon: Gamepad2,
              color: 'bg-slate-200 text-black',
            };
          const Icon = config.icon;

          // Optional: local display reward (same formula as contract: 5 + score*0.01)
          const localReward = 5 + session.score * 0.01;

          const hasTx = Boolean(session.txHash);
          const txUrl = hasTx
            ? `${CELO_SEPOLIA_EXPLORER_BASE}${TX_PATH}${session.txHash}`
            : undefined;

          return (
            <motion.div
              key={session._id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline Node */}
              <div
                className={`
                absolute -left-[3.25rem] md:-left-[4.25rem] top-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-black flex items-center justify-center z-10
                ${config.color}
              `}
              >
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>

              {/* Card */}
              <div className="bg-white border-2 border-black p-6 rounded-xl shadow-flat relative group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-md border-2 border-black text-xs font-black uppercase ${config.color}`}
                    >
                      {config.title}
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                      {format(session.timestamp, 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-black text-slate-900">
                      {format(session.timestamp, 'MMMM d, yyyy')}
                    </div>
                    {hasTx && txUrl && (
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                        title={session.txHash}
                      >
                        {session.txHash!.slice(0, 10)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Score + Reward Display */}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-3">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="text-xl font-heading font-black">
                        {session.score}
                      </span>
                      <span className="text-sm font-bold text-slate-500">points</span>
                    </div>
                    <p className="text-sm text-slate-600">{config.description}</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border-2 border-yellow-800 font-black text-center">
                    <div className="text-2xl">
                      {Math.floor(localReward)}
                    </div>
                    <div className="text-xs">FEELS</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
