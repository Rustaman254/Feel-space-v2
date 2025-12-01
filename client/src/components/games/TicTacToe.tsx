import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/hooks/use-web3';
import { playMatch, playWrong, playSuccess, playComplete } from '@/lib/sounds';

type Player = 'X' | 'O' | null;

const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
];

export function TicTacToe() {
    const { recordGameSession, isConnected } = useWeb3();
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
    const [winner, setWinner] = useState<Player | 'draw' | null>(null);
    const [moves, setMoves] = useState(0);

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer('X');
        setWinner(null);
        setMoves(0);
    };

    const calculateWinner = (squares: Player[]): Player | null => {
        for (const [a, b, c] of WIN_LINES) {
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const handleEndGame = (finalWinner: Player | 'draw', movesCount: number) => {
        let score = 0;
        if (finalWinner === 'X' || finalWinner === 'O') {
            // Base 200 + efficiency bonus
            score = 200 + Math.max(0, 50 - movesCount * 5);
            playSuccess();
        } else {
            // Draw gives smaller score
            score = 100;
            playWrong();
        }

        setWinner(finalWinner);
        setMoves(movesCount);
        playComplete();

        if (isConnected) {
            // store session on-chain and mint FEELS
            recordGameSession('tictactoe', score);
        }
    };

    const handleClick = (index: number) => {
        if (!isConnected) return;
        if (winner) return;
        if (board[index]) return;

        const nextBoard = board.slice();
        nextBoard[index] = currentPlayer;
        const nextMoves = moves + 1;

        setBoard(nextBoard);
        setMoves(nextMoves);
        playMatch();

        const win = calculateWinner(nextBoard);
        if (win) {
            handleEndGame(win, nextMoves);
            return;
        }

        if (nextBoard.every(square => square !== null)) {
            handleEndGame('draw', nextMoves);
            return;
        }

        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    };

    const statusLabel = () => {
        if (winner === 'draw') return 'Draw!';
        if (winner === 'X' || winner === 'O') return `Winner: ${winner}`;
        return `Turn: ${currentPlayer}`;
    };

    return (
        <div className="w-full h-[600px] relative overflow-hidden rounded-lg bg-white border-2 border-black shadow-flat flex flex-col items-center justify-center p-8">
            {/* HUD */}
            <div className="absolute top-4 left-0 right-0 px-4 md:px-8 flex justify-between z-20 pointer-events-none">
                <div className="bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
                    <span className="text-black font-bold uppercase text-xs tracking-wider">Status</span>
                    <span className="ml-2 text-sm md:text-lg font-black text-black">{statusLabel()}</span>
                </div>
                <div className="bg-white px-4 md:px-6 py-2 rounded-lg border-2 border-black shadow-flat-sm">
                    <span className="text-black font-bold uppercase text-xs tracking-wider">Moves</span>
                    <span className="ml-2 text-xl md:text-2xl font-black text-black">{moves}</span>
                </div>
            </div>

            {/* Start Overlay if wallet not connected */}
            {!isConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-30 p-4 text-center">
                    <h2 className="text-3xl font-heading font-black text-black mb-4 uppercase tracking-tighter">
                        Tic-Tac-Toe
                    </h2>
                    <p className="text-slate-600 font-bold mb-6">
                        Connect your wallet to play and earn FEELS.
                    </p>
                    <p className="text-xs font-bold text-slate-400 max-w-xs">
                        Once connected, each completed game will be stored on-chain and reward FEELS tokens.
                    </p>
                </div>
            )}

            {/* Game Over Overlay */}
            {winner && isConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-30 p-4 text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    >
                        <Trophy className="w-20 h-20 text-accent mb-4 stroke-[2px] stroke-black fill-accent" />
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-heading font-black text-black mb-2 uppercase"
                    >
                        {winner === 'draw' ? 'Draw Game' : 'Game Over'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-black font-bold text-xl mb-8"
                    >
                        {winner === 'draw' ? 'Nobody wins this round.' : `Winner: ${winner}`}
                    </motion.p>
                    <Button
                        onClick={resetGame}
                        variant="outline"
                        size="lg"
                        className="btn-flat bg-white hover:bg-slate-50 text-black border-2 border-black"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Play Again
                    </Button>
                </div>
            )}

            {/* Board */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 w-full max-w-sm">
                {board.map((value, index) => (
                    <motion.button
                        key={index}
                        onClick={() => handleClick(index)}
                        disabled={!isConnected || Boolean(winner) || Boolean(board[index])}
                        whileHover={{ scale: isConnected && !winner && !board[index] ? 1.05 : 1 }}
                        whileTap={{ scale: isConnected && !winner && !board[index] ? 0.95 : 1 }}
                        className={`
              aspect-square rounded-xl border-4 border-black shadow-flat-sm flex items-center justify-center
              bg-slate-100 text-4xl md:text-5xl font-black
              ${!isConnected || winner ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
            `}
                    >
                        {value && (
                            <motion.span
                                initial={{ scale: 0, rotate: -10, opacity: 0 }}
                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                className={value === 'X' ? 'text-primary' : 'text-destructive'}
                            >
                                {value}
                            </motion.span>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
