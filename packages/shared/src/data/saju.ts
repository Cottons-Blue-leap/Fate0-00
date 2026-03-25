import type { HeavenlyStem, EarthlyBranch, FiveElement } from '../types/fortune';

export const heavenlyStems: { stem: HeavenlyStem; element: FiveElement }[] = [
  { stem: '甲', element: '木' }, { stem: '乙', element: '木' },
  { stem: '丙', element: '火' }, { stem: '丁', element: '火' },
  { stem: '戊', element: '土' }, { stem: '己', element: '土' },
  { stem: '庚', element: '金' }, { stem: '辛', element: '金' },
  { stem: '壬', element: '水' }, { stem: '癸', element: '水' },
];

export const earthlyBranches: { branch: EarthlyBranch; element: FiveElement }[] = [
  { branch: '子', element: '水' }, { branch: '丑', element: '土' },
  { branch: '寅', element: '木' }, { branch: '卯', element: '木' },
  { branch: '辰', element: '土' }, { branch: '巳', element: '火' },
  { branch: '午', element: '火' }, { branch: '未', element: '土' },
  { branch: '申', element: '金' }, { branch: '酉', element: '金' },
  { branch: '戌', element: '土' }, { branch: '亥', element: '水' },
];

export const elementFortunes: Record<FiveElement, string[]> = {
  '木': [
    '목(木)의 기운이 강합니다. 성장과 발전의 에너지가 넘치는 사주입니다.',
    '목의 기운을 가진 당신은 인자하고 곧은 성품의 소유자입니다.',
  ],
  '火': [
    '화(火)의 기운이 강합니다. 열정과 에너지가 넘치는 사주입니다.',
    '화의 기운을 가진 당신은 카리스마와 추진력의 소유자입니다.',
  ],
  '土': [
    '토(土)의 기운이 강합니다. 안정과 중심의 에너지를 가진 사주입니다.',
    '토의 기운을 가진 당신은 포용력과 인내심의 소유자입니다.',
  ],
  '金': [
    '금(金)의 기운이 강합니다. 결단력과 정의감의 에너지를 가진 사주입니다.',
    '금의 기운을 가진 당신은 원칙과 정확함의 소유자입니다.',
  ],
  '水': [
    '수(水)의 기운이 강합니다. 지혜와 적응력의 에너지를 가진 사주입니다.',
    '수의 기운을 가진 당신은 통찰력과 적응력의 소유자입니다.',
  ],
};
