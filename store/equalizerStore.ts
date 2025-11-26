import { create } from 'zustand';

interface EqualizerBand {
  frequency: string;
  gain: number;
}

interface EqualizerState {
  bands: EqualizerBand[];
  presets: { [key: string]: number[] };
  currentPreset: string;
  setBandGain: (index: number, gain: number) => void;
  applyPreset: (presetName: string) => void;
  resetEqualizer: () => void;
}

const defaultBands: EqualizerBand[] = [
  { frequency: '60Hz', gain: 0 },
  { frequency: '170Hz', gain: 0 },
  { frequency: '310Hz', gain: 0 },
  { frequency: '600Hz', gain: 0 },
  { frequency: '1kHz', gain: 0 },
  { frequency: '3kHz', gain: 0 },
  { frequency: '6kHz', gain: 0 },
  { frequency: '12kHz', gain: 0 },
  { frequency: '14kHz', gain: 0 },
  { frequency: '16kHz', gain: 0 },
];

const presets = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Rock: [5, 4, -1, -2, 1, 3, 4, 4, 4, 4],
  Pop: [-1, 3, 5, 5, 3, -1, -2, -2, -1, -1],
  Jazz: [4, 3, 1, 2, -2, -2, 0, 2, 3, 4],
  Classical: [4, 3, -2, -2, -2, 0, 2, 3, 4, 5],
  Electronic: [4, 3, 1, 0, -2, 2, 1, 2, 4, 5],
  'Hip Hop': [5, 4, 1, 3, -1, -1, 1, -1, 3, 4],
  Acoustic: [4, 3, 3, 1, 2, 2, 3, 3, 3, 2],
};

export const useEqualizerStore = create<EqualizerState>((set) => ({
  bands: defaultBands,
  presets,
  currentPreset: 'Flat',

  setBandGain: (index, gain) =>
    set((state) => ({
      bands: state.bands.map((band, i) => (i === index ? { ...band, gain } : band)),
      currentPreset: 'Custom',
    })),

  applyPreset: (presetName) =>
    set((state) => ({
      bands: state.bands.map((band, i) => ({
        ...band,
        gain: state.presets[presetName][i],
      })),
      currentPreset: presetName,
    })),

  resetEqualizer: () =>
    set({
      bands: defaultBands,
      currentPreset: 'Flat',
    }),
}));
