import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const policies: Record<string, { title: string; sections: Array<{ heading: string; content: string }> }> = {
  ko: {
    title: '개인정보처리방침',
    sections: [
      {
        heading: '1. 수집하는 개인정보',
        content:
          '본 서비스 "운명 0시"는 다음 정보를 수집합니다:\n• 이름 (닉네임): 운세 결과 표시용\n• 생년월일 및 출생 시간: 사주, 별자리 등 운세 산출용\n• 성별: 사주 운세 산출용\n• 음력/양력 구분: 사주 운세 산출용',
      },
      {
        heading: '2. 개인정보의 저장 및 처리',
        content:
          '• 모든 개인정보는 사용자의 기기 내(localStorage)에만 저장됩니다.\n• 외부 서버로 전송되거나 수집되지 않습니다.\n• 브라우저 데이터를 삭제하면 모든 데이터가 자동으로 삭제됩니다.',
      },
      {
        heading: '3. 제3자 서비스',
        content:
          '본 서비스는 다음 제3자 서비스를 사용할 수 있습니다:\n• Google AdSense/AdMob: 광고 표시를 위해 사용됩니다. Google의 광고 ID가 수집될 수 있습니다.',
      },
      {
        heading: '4. 아동의 이용',
        content: '본 서비스는 만 13세 미만 아동의 단독 이용을 권장하지 않습니다. 아동이 이용할 경우 보호자의 동반 또는 지도하에 이용하시기를 권장합니다.\n\n아동이 보호자 동의 없이 단독으로 이용하여 발생하는 문제에 대해 운영자는 책임을 지지 않습니다.',
      },
      {
        heading: '5. 개인정보처리방침 변경',
        content: '본 방침이 변경될 경우 이 페이지에 게시하여 알려드립니다.',
      },
      {
        heading: '6. 연락처',
        content: '개인정보 관련 문의: cottonsblueleap@gmail.com',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Information We Collect',
        content:
          '"Fate 0:00" collects the following information:\n• Name (nickname): For displaying fortune results\n• Date and time of birth: For calculating fortunes (Saju, Horoscope, etc.)\n• Gender: For Saju fortune calculation\n• Lunar/Solar calendar preference: For Saju fortune calculation',
      },
      {
        heading: '2. Data Storage and Processing',
        content:
          '• All personal data is stored only on the user\'s device (localStorage).\n• No data is transmitted to or collected by external servers.\n• All data is automatically deleted when browser data is cleared.',
      },
      {
        heading: '3. Third-Party Services',
        content:
          'This service may use the following third-party services:\n• Google AdSense/AdMob: Used for displaying advertisements. Google\'s advertising ID may be collected.',
      },
      {
        heading: '4. Children\'s Use',
        content: 'This service is not recommended for unsupervised use by children under 13. If a child uses this service, we recommend parental guidance or supervision.\n\nThe operator is not responsible for any issues arising from a child\'s unsupervised use without parental consent.',
      },
      {
        heading: '5. Changes to This Policy',
        content: 'Any changes to this policy will be posted on this page.',
      },
      {
        heading: '6. Contact',
        content: 'For privacy inquiries: cottonsblueleap@gmail.com',
      },
    ],
  },
  ja: {
    title: 'プライバシーポリシー',
    sections: [
      {
        heading: '1. 収集する個人情報',
        content:
          '「運命 0時」は以下の情報を収集します：\n• 名前（ニックネーム）：占い結果の表示用\n• 生年月日および出生時間：四柱推命、星座占い等の算出用\n• 性別：四柱推命の算出用\n• 旧暦/新暦の区分：四柱推命の算出用',
      },
      {
        heading: '2. 個人情報の保存と処理',
        content:
          '• すべての個人情報はユーザーの端末内（localStorage）にのみ保存されます。\n• 外部サーバーへの送信や収集は行いません。\n• ブラウザのデータを削除すると、すべてのデータが自動的に削除されます。',
      },
      {
        heading: '3. 第三者サービス',
        content:
          '本サービスは以下の第三者サービスを使用する場合があります：\n• Google AdSense/AdMob：広告の表示に使用されます。Googleの広告IDが収集される場合があります。',
      },
      {
        heading: '4. 児童のご利用',
        content: '本サービスは13歳未満の児童が単独で利用することを推奨しておりません。児童がご利用になる場合は、保護者の同伴または指導のもとでのご利用をお勧めいたします。\n\n保護者の同意なく児童が単独で利用したことにより生じた問題について、運営者は責任を負いません。',
      },
      {
        heading: '5. プライバシーポリシーの変更',
        content: '本ポリシーに変更がある場合、このページに掲載してお知らせします。',
      },
      {
        heading: '6. お問い合わせ',
        content: 'プライバシーに関するお問い合わせ：cottonsblueleap@gmail.com',
      },
    ],
  },
};

function getLang(lng: string): string {
  if (lng.startsWith('ja')) return 'ja';
  if (lng.startsWith('ko')) return 'ko';
  return 'en';
}

export default function PrivacyPage() {
  const { i18n } = useTranslation();
  const lang = getLang(i18n.language);
  const policy = policies[lang] || policies['en']!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a0a2e 0%, #2e0a0a 100%)',
        padding: '40px 20px',
        color: '#e0d0f0',
        fontFamily: "'Noto Serif KR', serif",
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textDecoration: 'none' }}>
          ← Back
        </Link>

        <h1 style={{
          fontSize: '24px',
          marginTop: '24px',
          marginBottom: '8px',
          color: '#c39bd3',
          textShadow: '0 0 20px rgba(155,89,182,0.3)',
        }}>
          {policy.title}
        </h1>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '32px' }}>
          Last updated: 2026-03-25
        </p>

        {policy.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>
              {section.heading}
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: '1.8',
              whiteSpace: 'pre-line',
            }}>
              {section.content}
            </p>
          </div>
        ))}

        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          fontSize: '12px',
          color: 'rgba(255,255,255,0.25)',
          textAlign: 'center',
        }}>
          운명 0시 / Fate 0:00
        </div>
      </div>
    </motion.div>
  );
}
