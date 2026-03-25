import type { ZodiacSign } from '../types/fortune';

// Keyword pools for the Nebula Oracle message generator
const adjectives: Record<string, string[]> = {
  fire: ['불타는', '타오르는', '백열의', '용암빛', '노이즈 섞인'],
  earth: ['정적에 잠긴', '묵직한', '결정화된', '고대의', '잊힌'],
  air: ['투명한', '떠도는', '공명하는', '속삭이는', '미세한'],
  water: ['차가운', '깊은 곳의', '안개 낀', '흐르는', '은빛'],
};

const objects: Record<string, string[]> = {
  aries: ['불꽃의 뿔', '첫 번째 섬광'],
  taurus: ['흑요석 황소', '대지의 왕관'],
  gemini: ['이중의 거울', '은빛 나비'],
  cancer: ['달빛 조개', '기억의 호수'],
  leo: ['은빛 사자', '태양의 갈기'],
  virgo: ['별의 낟알', '수정 저울'],
  libra: ['균형의 추', '하늘의 천칭'],
  scorpio: ['심연의 바늘', '독의 꽃'],
  sagittarius: ['불화살', '지평선 너머의 문'],
  capricorn: ['얼음의 봉우리', '시간의 톱니바퀴'],
  aquarius: ['공명하는 종', '전파의 강'],
  pisces: ['잊힌 궤도', '꿈의 산호'],
};

const verbs = [
  '조우하는', '흩어지는', '침잠하는', '잉태하는',
  '관통하는', '포용하는', '각성하는', '해독하는',
  '수렴하는', '방출하는',
];

const results = [
  '오래된 침묵 속에서 답을 얻으리라.',
  '잊혀진 주파수가 다시 공명하기 시작한다.',
  '새벽의 첫 빛이 당신의 길을 비춘다.',
  '감춰져 있던 가능성이 수면 위로 떠오른다.',
  '흔들림 없는 결단이 새로운 궤도를 연다.',
  '직감의 주파수를 따라가면 출구가 보인다.',
  '고요한 물결 아래, 거대한 흐름이 움직인다.',
  '타인의 시선 너머에서 진짜 당신을 만난다.',
  '깨진 거울 조각들이 새로운 풍경을 비춘다.',
  '과거의 메아리가 미래의 열쇠가 된다.',
];

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

export interface OracleMessage {
  adjective: string;
  object: string;
  verb: string;
  result: string;
  fullMessage: string;
}

export function generateOracleMessage(sunSign: ZodiacSign, dateStr: string): OracleMessage {
  const element = {
    aries: 'fire', taurus: 'earth', gemini: 'air', cancer: 'water',
    leo: 'fire', virgo: 'earth', libra: 'air', scorpio: 'water',
    sagittarius: 'fire', capricorn: 'earth', aquarius: 'air', pisces: 'water',
  }[sunSign];

  const seed = hashSeed(dateStr + sunSign);

  const adj = pick(adjectives[element], seed, 0);
  const obj = pick(objects[sunSign], seed, 1);
  const verb = pick(verbs, seed, 2);
  const res = pick(results, seed, 3);

  return {
    adjective: adj,
    object: obj,
    verb,
    result: res,
    fullMessage: `${adj} ${obj}이(가) ${verb} 날, ${res}`,
  };
}
