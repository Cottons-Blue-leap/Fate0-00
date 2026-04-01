// AUTO-GENERATED from csv/saju_*.csv — DO NOT EDIT MANUALLY
import type { HeavenlyStem, EarthlyBranch, FiveElement } from '../../types/fortune';

export interface StemData {
  stem: HeavenlyStem;
  element: FiveElement;
  nature: 'yang' | 'yin';
}

export interface BranchData {
  branch: EarthlyBranch;
  element: FiveElement;
  hiddenStems: { stem: HeavenlyStem; element: FiveElement; weight: number }[];
}

export const heavenlyStems: StemData[] = [
  { stem: '甲' as HeavenlyStem, element: '木' as FiveElement, nature: 'yang' as const },
  { stem: '乙' as HeavenlyStem, element: '木' as FiveElement, nature: 'yin' as const },
  { stem: '丙' as HeavenlyStem, element: '火' as FiveElement, nature: 'yang' as const },
  { stem: '丁' as HeavenlyStem, element: '火' as FiveElement, nature: 'yin' as const },
  { stem: '戊' as HeavenlyStem, element: '土' as FiveElement, nature: 'yang' as const },
  { stem: '己' as HeavenlyStem, element: '土' as FiveElement, nature: 'yin' as const },
  { stem: '庚' as HeavenlyStem, element: '金' as FiveElement, nature: 'yang' as const },
  { stem: '辛' as HeavenlyStem, element: '金' as FiveElement, nature: 'yin' as const },
  { stem: '壬' as HeavenlyStem, element: '水' as FiveElement, nature: 'yang' as const },
  { stem: '癸' as HeavenlyStem, element: '水' as FiveElement, nature: 'yin' as const },
];

export const earthlyBranches: BranchData[] = [
  { branch: '子' as EarthlyBranch, element: '水' as FiveElement, hiddenStems: [{ stem: '癸' as HeavenlyStem, element: '水' as FiveElement, weight: 10 }] },
  { branch: '丑' as EarthlyBranch, element: '土' as FiveElement, hiddenStems: [{ stem: '己' as HeavenlyStem, element: '土' as FiveElement, weight: 10 }, { stem: '癸' as HeavenlyStem, element: '水' as FiveElement, weight: 5 }, { stem: '辛' as HeavenlyStem, element: '金' as FiveElement, weight: 3 }] },
  { branch: '寅' as EarthlyBranch, element: '木' as FiveElement, hiddenStems: [{ stem: '甲' as HeavenlyStem, element: '木' as FiveElement, weight: 10 }, { stem: '丙' as HeavenlyStem, element: '火' as FiveElement, weight: 5 }, { stem: '戊' as HeavenlyStem, element: '土' as FiveElement, weight: 3 }] },
  { branch: '卯' as EarthlyBranch, element: '木' as FiveElement, hiddenStems: [{ stem: '乙' as HeavenlyStem, element: '木' as FiveElement, weight: 10 }] },
  { branch: '辰' as EarthlyBranch, element: '土' as FiveElement, hiddenStems: [{ stem: '戊' as HeavenlyStem, element: '土' as FiveElement, weight: 10 }, { stem: '乙' as HeavenlyStem, element: '木' as FiveElement, weight: 5 }, { stem: '癸' as HeavenlyStem, element: '水' as FiveElement, weight: 3 }] },
  { branch: '巳' as EarthlyBranch, element: '火' as FiveElement, hiddenStems: [{ stem: '丙' as HeavenlyStem, element: '火' as FiveElement, weight: 10 }, { stem: '庚' as HeavenlyStem, element: '金' as FiveElement, weight: 5 }, { stem: '戊' as HeavenlyStem, element: '土' as FiveElement, weight: 3 }] },
  { branch: '午' as EarthlyBranch, element: '火' as FiveElement, hiddenStems: [{ stem: '丁' as HeavenlyStem, element: '火' as FiveElement, weight: 10 }, { stem: '己' as HeavenlyStem, element: '土' as FiveElement, weight: 5 }] },
  { branch: '未' as EarthlyBranch, element: '土' as FiveElement, hiddenStems: [{ stem: '己' as HeavenlyStem, element: '土' as FiveElement, weight: 10 }, { stem: '丁' as HeavenlyStem, element: '火' as FiveElement, weight: 5 }, { stem: '乙' as HeavenlyStem, element: '木' as FiveElement, weight: 3 }] },
  { branch: '申' as EarthlyBranch, element: '金' as FiveElement, hiddenStems: [{ stem: '庚' as HeavenlyStem, element: '金' as FiveElement, weight: 10 }, { stem: '壬' as HeavenlyStem, element: '水' as FiveElement, weight: 5 }, { stem: '戊' as HeavenlyStem, element: '土' as FiveElement, weight: 3 }] },
  { branch: '酉' as EarthlyBranch, element: '金' as FiveElement, hiddenStems: [{ stem: '辛' as HeavenlyStem, element: '金' as FiveElement, weight: 10 }] },
  { branch: '戌' as EarthlyBranch, element: '土' as FiveElement, hiddenStems: [{ stem: '戊' as HeavenlyStem, element: '土' as FiveElement, weight: 10 }, { stem: '辛' as HeavenlyStem, element: '金' as FiveElement, weight: 5 }, { stem: '丁' as HeavenlyStem, element: '火' as FiveElement, weight: 3 }] },
  { branch: '亥' as EarthlyBranch, element: '水' as FiveElement, hiddenStems: [{ stem: '壬' as HeavenlyStem, element: '水' as FiveElement, weight: 10 }, { stem: '甲' as HeavenlyStem, element: '木' as FiveElement, weight: 5 }] },
];

export const elementFortunes: Record<FiveElement, string[]> = {
  '木': ['목(木)의 기운이 강합니다. 성장과 발전의 에너지가 넘치는 사주입니다.', '목의 기운을 가진 당신은 인자하고 곧은 성품의 소유자입니다.'],
  '火': ['화(火)의 기운이 강합니다. 열정과 에너지가 넘치는 사주입니다.', '화의 기운을 가진 당신은 카리스마와 추진력의 소유자입니다.'],
  '土': ['토(土)의 기운이 강합니다. 안정과 중심의 에너지를 가진 사주입니다.', '토의 기운을 가진 당신은 포용력과 인내심의 소유자입니다.'],
  '金': ['금(金)의 기운이 강합니다. 결단력과 정의감의 에너지를 가진 사주입니다.', '금의 기운을 가진 당신은 원칙과 정확함의 소유자입니다.'],
  '水': ['수(水)의 기운이 강합니다. 지혜와 적응력의 에너지를 가진 사주입니다.', '수의 기운을 가진 당신은 통찰력과 적응력의 소유자입니다.'],
};

export interface DayMasterProfile {
  stem: HeavenlyStem;
  element: FiveElement;
  nature: string;
  symbol: string;
  emoji: string;
  title: string;
  description: string;
}

export const dayMasterProfiles: DayMasterProfile[] = [
  { stem: '甲' as HeavenlyStem, element: '木' as FiveElement, nature: '양', symbol: '거대한 고목', emoji: '🌳', title: '하늘을 찌르는 고목', description: '甲木 — 당신은 하늘을 향해 곧게 뻗는 거대한 고목입니다. 정의감이 강하고 리더십이 있으며, 한 번 정한 방향을 쉽게 바꾸지 않습니다. 강인하지만 유연함이 부족할 수 있습니다. 봄의 시작, 새벽의 에너지를 품고 있습니다.' },
  { stem: '乙' as HeavenlyStem, element: '木' as FiveElement, nature: '음', symbol: '바람에 흔들리는 넝쿨', emoji: '🌿', title: '유연한 넝쿨', description: '乙木 — 당신은 바람에 휘어져도 꺾이지 않는 넝쿨입니다. 부드럽고 적응력이 뛰어나며, 강한 것을 감싸 안는 힘이 있습니다. 예술적 감수성과 섬세함을 지녔습니다.' },
  { stem: '丙' as HeavenlyStem, element: '火' as FiveElement, nature: '양', symbol: '작열하는 태양', emoji: '☀️', title: '만물을 비추는 태양', description: '丙火 — 당신은 세상을 밝히는 태양입니다. 열정적이고 카리스마가 넘치며, 주변을 따뜻하게 합니다. 공명정대하고 감출 수 없는 존재감을 가졌습니다. 하지만 너무 뜨거워 가까이 하기 어려울 수 있습니다.' },
  { stem: '丁' as HeavenlyStem, element: '火' as FiveElement, nature: '음', symbol: '어둠을 밝히는 촛불', emoji: '🕯️', title: '어둠 속의 촛불', description: '丁火 — 당신은 어둠 속에서 길을 밝히는 촛불입니다. 은은하지만 확실한 빛, 지적이고 통찰력이 깊습니다. 겉으로는 온화하지만 내면에 강한 신념을 품고 있습니다.' },
  { stem: '戊' as HeavenlyStem, element: '土' as FiveElement, nature: '양', symbol: '움직이지 않는 산', emoji: '⛰️', title: '흔들리지 않는 산', description: '戊土 — 당신은 태풍에도 흔들리지 않는 산입니다. 듬직하고 포용력이 넓으며, 사람들이 의지하는 존재입니다. 변화가 느리지만 한 번 움직이면 거대한 힘을 발휘합니다.' },
  { stem: '己' as HeavenlyStem, element: '土' as FiveElement, nature: '음', symbol: '만물을 키우는 비옥한 대지', emoji: '🌾', title: '비옥한 대지', description: '己土 — 당신은 생명을 키워내는 비옥한 대지입니다. 겸손하고 헌신적이며, 다른 사람을 돌보는 데 재능이 있습니다. 겉으로 드러나지 않지만 모든 것의 기반이 됩니다.' },
  { stem: '庚' as HeavenlyStem, element: '金' as FiveElement, nature: '양', symbol: '제련되지 않은 원석', emoji: '⚔️', title: '거친 원석의 칼날', description: '庚金 — 당신은 아직 제련되지 않은 차가운 원석, 그리고 그 속에 숨겨진 날카로운 칼날입니다. 결단력과 추진력이 뛰어나며, 원칙에 엄격합니다. 시련이 당신을 더 날카롭게 벼립니다.' },
  { stem: '辛' as HeavenlyStem, element: '金' as FiveElement, nature: '음', symbol: '달빛에 빛나는 보석', emoji: '💎', title: '달빛의 보석', description: '辛金 — 당신은 달빛 아래 빛나는 정교한 보석입니다. 섬세하고 완벽주의적이며, 아름다움과 순수함을 추구합니다. 외로움을 잘 타지만 그 고독이 깊은 빛을 만들어냅니다.' },
  { stem: '壬' as HeavenlyStem, element: '水' as FiveElement, nature: '양', symbol: '끝없이 흐르는 대하', emoji: '🌊', title: '멈추지 않는 대하', description: '壬水 — 당신은 산을 깎고 바다로 흘러가는 거대한 강입니다. 지혜롭고 포용력이 넓으며, 어떤 장애물도 돌아갈 길을 찾습니다. 자유를 사랑하고 구속을 싫어합니다.' },
  { stem: '癸' as HeavenlyStem, element: '水' as FiveElement, nature: '음', symbol: '새벽에 맺힌 이슬', emoji: '💧', title: '새벽의 이슬', description: '癸水 — 당신은 새벽 풀잎에 맺힌 한 방울의 이슬입니다. 섬세하고 직관적이며, 보이지 않는 것을 느끼는 영감이 있습니다. 조용하지만 만물을 적시는 깊은 힘을 가졌습니다.' },
];
