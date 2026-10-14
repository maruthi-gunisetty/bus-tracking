import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Navigation } from 'lucide-react';
import { demoSimulator, type SimulatorState } from '../../services/demoSimulator';

interface DemoSimulatorControlsProps {
  isDemo: boolean;
}

export const DemoSimulatorControls: React.FC<DemoSimulatorControlsProps> = ({ isDemo }) => {
  const [simState, setSimState] = useState<SimulatorState>(demoSimulator.getState());

  useEffect(() => {
    if (!isDemo) return;
    const unsub = demoSimulator.subscribe((state) => {
      setSimState(state);
    });
    return unsub;
  }, [isDemo]);

  if (!isDemo) return null;

  const handleTogglePlay = () => {
    if (simState.isRunning) {
      demoSimulator.pause();
    } else {
      demoSimulator.start();
    }
  };

  const handleSpeedCycle = () => {
    const speeds = [1, 2, 5, 10];
    const nextIdx = (speeds.indexOf(simState.speedMultiplier) + 1) % speeds.length;
    demoSimulator.setSpeed(speeds[nextIdx]);
  };

  return (
    <div className="bg-navy-900/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 shadow-2xl max-w-2xl mx-auto my-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-navy-800">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="font-extrabold text-amber-300 text-sm">Interactive GPS Simulator</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
            Route 7 Waypoint {simState.currentIndex + 1} / {simState.totalWaypoints}
          </span>
        </div>

        {/* Speed multiplier & Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSpeedCycle}
            className="px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-navy-750 text-amber-300 font-bold border border-navy-700 flex items-center space-x-1 transition"
            title="Cycle Simulation Speed"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{simState.speedMultiplier}x Speed</span>
          </button>

          <button
            onClick={() => demoSimulator.reset()}
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition"
            title="Reset to Start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Quick Jump */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
        {/* Play / Pause button */}
        <button
          onClick={handleTogglePlay}
          className={`px-4 py-2 rounded-xl font-bold flex items-center space-x-2 transition shadow-md ${
            simState.isRunning
              ? 'bg-amber-500 hover:bg-amber-400 text-navy-950'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {simState.isRunning ? <Pause className="w-4 h-4 fill-navy-950" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{simState.isRunning ? 'Pause Sim' : 'Play Bus Sim'}</span>
        </button>

        {/* Quick jump to stops */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <span className="text-[11px] text-slate-400 hidden sm:inline mr-1">Jump to:</span>
          {[
            { label: 'Stop 1', seq: 1 },
            { label: 'Stop 2', seq: 2 },
            { label: 'Stop 3', seq: 3 },
            { label: 'Stop 4', seq: 4 },
          ].map((s) => (
            <button
              key={s.seq}
              onClick={() => demoSimulator.jumpToStop(s.seq)}
              className="px-2 py-1 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-300 hover:text-sky-400 text-[11px] font-semibold transition"
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => demoSimulator.jumpToStop(4)}
            className="px-2 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-semibold transition flex items-center space-x-1"
          >
            <Navigation className="w-3 h-3" />
            <span>Campus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
