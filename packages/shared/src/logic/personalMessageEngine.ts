import type { FiveElement } from '../types/fortune';
import { getSajuReading } from './sajuEngine';
import { getTodayPillar } from './dailySajuEngine';
import { getMoonPhase, getSunSign } from './moonEngine';
import { elementEmojis } from './sajuDeepEngine';
import { getInteraction } from './fiveElements';
import type { Interaction } from './fiveElements';

type MoonQuadrant = 'new' | 'waxing' | 'full' | 'waning';

function getMoonQuadrant(phase: number): MoonQuadrant {
  if (phase < 0.125 || phase >= 0.875) return 'new';
  if (phase < 0.375) return 'waxing';
  if (phase < 0.625) return 'full';
  return 'waning';
}

export interface PersonalMessageResult {
  /** i18n key: personalDaily.{interaction}.{moonQuadrant} */
  messageKey: string;
  /** User's day master element */
  dayMasterElement: FiveElement;
  /** Emoji for day master element */
  elementEmoji: string;
  /** i18n key for element name: personalDaily.elementName.{element} */
  elementNameKey: string;
  /** Today's element */
  todayElement: FiveElement;
  /** Interaction type */
  interaction: Interaction;
  /** Moon quadrant */
  moonQuadrant: MoonQuadrant;
  /** Sun sign key */
  sunSign: string;
}

const elementNameKeys: Record<FiveElement, string> = { '木': 'personalDaily.elementName.木', '火': 'personalDaily.elementName.火', '土': 'personalDaily.elementName.土', '金': 'personalDaily.elementName.金', '水': 'personalDaily.elementName.水' };

export interface PersonalMessageInput {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  isLunar: boolean;
  name: string;
  /** Pre-converted solar date if isLunar */
  solarDate?: { year: number; month: number; day: number };
}

export function getPersonalMessage(
  input: PersonalMessageInput,
  date: Date = new Date(),
): PersonalMessageResult {
  // Get user's birth saju to find day master element
  const saju = getSajuReading(
    input.birthYear,
    input.birthMonth,
    input.birthDay,
    input.birthHour,
    input.isLunar,
    input.solarDate,
  );
  const dayMasterElement = saju.pillars[2].element; // 日柱 천간 오행

  // Today's pillar element
  const todayPillar = getTodayPillar(date);
  const todayElement = todayPillar.element;

  // Interaction
  const interaction = getInteraction(dayMasterElement, todayElement);

  // Moon quadrant
  const moonPhase = getMoonPhase(date);
  const moonQuadrant = getMoonQuadrant(moonPhase);

  // Sun sign
  const sunSign = getSunSign(input.birthMonth, input.birthDay);

  return {
    messageKey: `personalDaily.${interaction}.${moonQuadrant}`,
    dayMasterElement,
    elementEmoji: elementEmojis[dayMasterElement],
    elementNameKey: elementNameKeys[dayMasterElement],
    todayElement,
    interaction,
    moonQuadrant,
    sunSign,
  };
}
