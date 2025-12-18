import { RoundConfig, StageGroup } from './types';

export const WHEEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52B788', '#F06292', '#64B5F6',
  '#FFD93D', '#6BCF7F', '#FF8A80', '#80DEEA',
  '#FFAB91', '#A5D6A7', '#CE93D8', '#90CAF9',
  '#FFF59D', '#80CBC4', '#FFCC80', '#81C784'
];

export const ROUND_BACKGROUNDS = [
  'linear-gradient(180deg, #001a33 0%, #003d66 30%, #005580 50%, #0077b3 70%, #4d9fcc 85%, #b3d9f2 100%)',
  'linear-gradient(180deg, #1a0a0a 0%, #4d1414 30%, #801f1f 50%, #b32e2e 70%, #cc5c5c 85%, #f2b3b3 100%)',
  'linear-gradient(180deg, #0a1a0a 0%, #1f4d1f 30%, #2e802e 50%, #3db33d 70%, #70cc70 85%, #b3f2b3 100%)',
  'linear-gradient(180deg, #1a0f00 0%, #4d3300 30%, #805500 50%, #b37700 70%, #cc9933 85%, #f2d699 100%)',
  'linear-gradient(180deg, #1a001a 0%, #4d0f4d 30%, #801f80 50%, #b32eb3 70%, #cc5ccc 85%, #f2b3f2 100%)',
  'linear-gradient(180deg, #001a1a 0%, #004d4d 30%, #008080 50%, #00b3b3 70%, #33cccc 85%, #99f2f2 100%)',
  'linear-gradient(180deg, #1a1100 0%, #4d3d1f 30%, #806633 50%, #b39147 70%, #ccad70 85%, #f2ddb3 100%)',
  'linear-gradient(180deg, #1a0033 0%, #330066 30%, #4d0099 50%, #6600cc 70%, #9933ff 85%, #cc99ff 100%)',
  'linear-gradient(180deg, #0a1a1a 0%, #1f4747 30%, #2e7070 50%, #47a3a3 70%, #70cccc 85%, #b3f2f2 100%)',
  'linear-gradient(180deg, #1a0a00 0%, #4d2200 30%, #803300 50%, #b34700 70%, #cc7033 85%, #f2b399 100%)',
  'linear-gradient(180deg, #001a0a 0%, #00331f 30%, #005533 50%, #007747 70%, #33a370 85%, #99d6b8 100%)',
  'linear-gradient(180deg, #330000 0%, #660000 30%, #990000 50%, #cc3333 70%, #ff6666 85%, #ffcccc 100%)',
  'linear-gradient(180deg, #2d1b69 0%, #5a3399 30%, #8b5ac7 50%, #b088d6 70%, #d4b3e8 85%, #ede0f7 100%)',
  'linear-gradient(180deg, #1a4d2e 0%, #2d8659 30%, #4db380 50%, #7fd1a8 70%, #a8e4c7 85%, #d4f5e6 100%)',
  'linear-gradient(180deg, #4d1f1a 0%, #804433 30%, #b36b55 50%, #d49985 70%, #ecc4b3 85%, #f7e5de 100%)',
  'linear-gradient(180deg, #1f1a4d 0%, #3d3380 30%, #5e55b3 50%, #8a7fd1 70%, #b8a8e4 85%, #ded4f5 100%)',
  'linear-gradient(180deg, #4d2d1a 0%, #805533 30%, #b37d4d 50%, #d1a980 70%, #e4ccad 85%, #f5e8d9 100%)'
];

export const ROUNDS: RoundConfig[] = [
  { id: 1, title: '初小 A: 🎁 X3', className: '初小 A', winnerCount: 3, background: ROUND_BACKGROUNDS[0], group: 'Primary' },
  { id: 2, title: '初小 B: 🎁 X2', className: '初小 B', winnerCount: 2, background: ROUND_BACKGROUNDS[1], group: 'Primary' },
  { id: 3, title: '初小 C: 🎁 X4', className: '初小 C', winnerCount: 4, background: ROUND_BACKGROUNDS[2], group: 'Primary' },
  { id: 4, title: '初小 D: 🎁 X4', className: '初小 D', winnerCount: 4, background: ROUND_BACKGROUNDS[3], group: 'Primary' },
  { id: 5, title: '高小 A: 🎁 X3', className: '高小 A', winnerCount: 3, background: ROUND_BACKGROUNDS[4], group: 'Primary' },
  { id: 6, title: '高小 B: 🎁 X3', className: '高小 B', winnerCount: 3, background: ROUND_BACKGROUNDS[5], group: 'Primary' },
  { id: 7, title: '高小 C: 🎁 X3', className: '高小 C', winnerCount: 3, background: ROUND_BACKGROUNDS[6], group: 'Primary' },
  { id: 8, title: '高小 D: 🎁 X3', className: '高小 D', winnerCount: 3, background: ROUND_BACKGROUNDS[7], group: 'Primary' },
  { id: 9, title: '初中 A: 🎁 X2', className: '初中 A', winnerCount: 2, background: ROUND_BACKGROUNDS[8], group: 'Junior' },
  { id: 10, title: '初中 B: 🎁 X2', className: '初中 B', winnerCount: 2, background: ROUND_BACKGROUNDS[9], group: 'Junior' },
  { id: 11, title: '初中 C: 🎁 X3', className: '初中 C', winnerCount: 3, background: ROUND_BACKGROUNDS[10], group: 'Junior' },
  { id: 12, title: '初中 D: 🎁 X4', className: '初中 D', winnerCount: 4, background: ROUND_BACKGROUNDS[11], group: 'Junior' },
  { id: 13, title: '高中 A: 🎁 X4', className: '高中 A', winnerCount: 4, background: ROUND_BACKGROUNDS[12], group: 'Senior' },
  { id: 14, title: '高中 B: 🎁 X4', className: '高中 B', winnerCount: 4, background: ROUND_BACKGROUNDS[13], group: 'Senior' },
  { id: 15, title: '高中 C: 🎁 X4', className: '高中 C', winnerCount: 4, background: ROUND_BACKGROUNDS[14], group: 'Senior' },
  { id: 16, title: '高中 D: 🎁 X3', className: '高中 D', winnerCount: 3, background: ROUND_BACKGROUNDS[15], group: 'Senior' },
  { id: 17, title: '高中 E: 🎁 X3', className: '高中 E', winnerCount: 3, background: ROUND_BACKGROUNDS[16], group: 'Senior' },
];

export const STAGE_GROUPS: StageGroup[] = [
  { label: '初小:', rounds: [1, 2, 3, 4], letters: ['A', 'B', 'C', 'D'] },
  { label: '高小:', rounds: [5, 6, 7, 8], letters: ['A', 'B', 'C', 'D'] },
  { label: '初中:', rounds: [9, 10, 11, 12], letters: ['A', 'B', 'C', 'D'] },
  { label: '高中:', rounds: [13, 14, 15, 16, 17], letters: ['A', 'B', 'C', 'D', 'E'] }
];
