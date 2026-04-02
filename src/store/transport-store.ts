import { create } from 'zustand';
import { ScheduleBlock } from '@/types/app';

type TransportState = {
  startAutomation: () => void;
  stopAutomation: () => void;
  togglePause: () => void;
  skipTrack: () => void;
  forceBlock: (block: ScheduleBlock) => void;
  registerControls: (controls: Omit<TransportState, 'registerControls'>) => void;
};

export const useTransportStore = create<TransportState>((set) => ({
  startAutomation: () => undefined,
  stopAutomation: () => undefined,
  togglePause: () => undefined,
  skipTrack: () => undefined,
  forceBlock: () => undefined,
  registerControls: (controls) => set(controls)
}));
