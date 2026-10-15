import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Navigation, Compass } from 'lucide-react';
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
    <div className="saas-card p-4 my-4 text-xs border border-border shadow-card bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
          <span className="font-bold text-primary-navy text-sm flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-accent-teal" />
            Interactive GPS Simulation Engine
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-btn bg-bg-main text-text-secondary font-semibold border border-border">
            Waypoint {simState.currentIndex + 1} / {simState.totalWaypoints}
          </span>
        </div>

        {/* Speed multiplier & Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSpeedCycle}
            className="btn-secondary !py-1 !px-2.5 text-xs font-semibold"
            title="Cycle Simulation Speed"
          >
            <FastForward className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{simState.speedMultiplier}x Speed</span>
          </button>

          <button
            onClick={() => demoSimulator.reset()}
            className="btn-icon !w-7 !h-7"
            title="Reset to Start"
            aria-label="Reset simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Progress & Quick Jump */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
        {/* Play / Pause button */}
        <button
          onClick={handleTogglePlay}
          className={`btn-primary !py-1.5 !px-4 text-xs font-semibold flex items-center space-x-2 ${
            simState.isRunning ? '!bg-secondary-navy hover:!bg-primary-navy' : ''
          }`}
        >
          {simState.isRunning ? (
            <Pause className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
          )}
          <span>{simState.isRunning ? 'Pause Simulation' : 'Start Simulation'}</span>
        </button>

        {/* Quick jump to stops */}
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <span className="text-[11px] text-text-muted hidden sm:inline mr-1 font-medium">Jump to:</span>
          {[
            { label: 'Stop 1', seq: 1 },
            { label: 'Stop 2', seq: 2 },
            { label: 'Stop 3', seq: 3 },
            { label: 'Stop 4', seq: 4 },
          ].map((s) => (
            <button
              key={s.seq}
              onClick={() => demoSimulator.jumpToStop(s.seq)}
              className="px-2.5 py-1 rounded-btn bg-bg-main hover:bg-slate-200 text-text-primary text-[11px] font-medium border border-border transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={() => demoSimulator.jumpToStop(4)}
            className="px-2.5 py-1 rounded-btn bg-status-success/15 text-status-success border border-status-success/30 font-semibold text-[11px] flex items-center space-x-1 cursor-pointer"
          >
            <Navigation className="w-3 h-3" strokeWidth={2} />
            <span>Campus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
