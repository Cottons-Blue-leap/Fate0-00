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
  'zh-CN': {
    title: '隐私政策',
    sections: [
      {
        heading: '1. 收集的个人信息',
        content:
          '"命运 0时"收集以下信息：\n• 姓名（昵称）：用于显示运势结果\n• 出生日期及出生时间：用于计算运势（四柱、星座等）\n• 性别：用于四柱运势计算\n• 阴历/阳历偏好：用于四柱运势计算',
      },
      {
        heading: '2. 数据存储与处理',
        content:
          '• 所有个人数据仅存储在用户设备本地（localStorage）。\n• 不会向外部服务器传输或收集任何数据。\n• 清除浏览器数据后，所有数据将自动删除。',
      },
      {
        heading: '3. 第三方服务',
        content:
          '本服务可能使用以下第三方服务：\n• Google AdSense/AdMob：用于展示广告。Google的广告ID可能会被收集。',
      },
      {
        heading: '4. 儿童使用',
        content: '本服务不建议13岁以下儿童在无监护情况下单独使用。如儿童使用本服务，建议在家长的陪同或指导下进行。\n\n对于儿童在未经家长同意的情况下单独使用所产生的问题，运营方不承担责任。',
      },
      {
        heading: '5. 隐私政策变更',
        content: '如本政策发生变更，将在此页面上公布。',
      },
      {
        heading: '6. 联系方式',
        content: '隐私相关咨询：cottonsblueleap@gmail.com',
      },
    ],
  },
  'zh-TW': {
    title: '隱私權政策',
    sections: [
      {
        heading: '1. 蒐集的個人資訊',
        content:
          '「命運 0時」蒐集以下資訊：\n• 姓名（暱稱）：用於顯示運勢結果\n• 出生日期及出生時間：用於計算運勢（四柱、星座等）\n• 性別：用於四柱運勢計算\n• 農曆/國曆偏好：用於四柱運勢計算',
      },
      {
        heading: '2. 資料儲存與處理',
        content:
          '• 所有個人資料僅儲存於使用者裝置本機（localStorage）。\n• 不會向外部伺服器傳輸或蒐集任何資料。\n• 清除瀏覽器資料後，所有資料將自動刪除。',
      },
      {
        heading: '3. 第三方服務',
        content:
          '本服務可能使用以下第三方服務：\n• Google AdSense/AdMob：用於展示廣告。Google的廣告ID可能會被蒐集。',
      },
      {
        heading: '4. 兒童使用',
        content: '本服務不建議13歲以下兒童在無監護情況下單獨使用。如兒童使用本服務，建議在家長的陪同或指導下進行。\n\n對於兒童在未經家長同意的情況下單獨使用所產生的問題，營運方不承擔責任。',
      },
      {
        heading: '5. 隱私權政策變更',
        content: '如本政策發生變更，將於此頁面上公佈。',
      },
      {
        heading: '6. 聯絡方式',
        content: '隱私相關諮詢：cottonsblueleap@gmail.com',
      },
    ],
  },
  es: {
    title: 'Política de Privacidad',
    sections: [
      {
        heading: '1. Información que recopilamos',
        content:
          '"Fate 0:00" recopila la siguiente información:\n• Nombre (apodo): Para mostrar los resultados de la fortuna\n• Fecha y hora de nacimiento: Para calcular la fortuna (Saju, horóscopo, etc.)\n• Género: Para el cálculo de la fortuna Saju\n• Preferencia de calendario lunar/solar: Para el cálculo de la fortuna Saju',
      },
      {
        heading: '2. Almacenamiento y procesamiento de datos',
        content:
          '• Todos los datos personales se almacenan únicamente en el dispositivo del usuario (localStorage).\n• No se transmiten ni recopilan datos en servidores externos.\n• Todos los datos se eliminan automáticamente al borrar los datos del navegador.',
      },
      {
        heading: '3. Servicios de terceros',
        content:
          'Este servicio puede utilizar los siguientes servicios de terceros:\n• Google AdSense/AdMob: Utilizado para mostrar anuncios. El ID de publicidad de Google puede ser recopilado.',
      },
      {
        heading: '4. Uso por menores',
        content: 'No se recomienda el uso de este servicio sin supervisión para menores de 13 años. Si un menor utiliza este servicio, se recomienda la orientación o supervisión de un padre o tutor.\n\nEl operador no es responsable de los problemas derivados del uso sin supervisión por parte de un menor sin el consentimiento de los padres.',
      },
      {
        heading: '5. Cambios en esta política',
        content: 'Cualquier cambio en esta política se publicará en esta página.',
      },
      {
        heading: '6. Contacto',
        content: 'Consultas sobre privacidad: cottonsblueleap@gmail.com',
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    sections: [
      {
        heading: '1. Informations collectées',
        content:
          '« Fate 0:00 » collecte les informations suivantes :\n• Nom (pseudonyme) : Pour afficher les résultats de la divination\n• Date et heure de naissance : Pour calculer les prédictions (Saju, horoscope, etc.)\n• Genre : Pour le calcul de la divination Saju\n• Préférence calendrier lunaire/solaire : Pour le calcul de la divination Saju',
      },
      {
        heading: '2. Stockage et traitement des données',
        content:
          '• Toutes les données personnelles sont stockées uniquement sur l\'appareil de l\'utilisateur (localStorage).\n• Aucune donnée n\'est transmise ni collectée par des serveurs externes.\n• Toutes les données sont automatiquement supprimées lorsque les données du navigateur sont effacées.',
      },
      {
        heading: '3. Services tiers',
        content:
          'Ce service peut utiliser les services tiers suivants :\n• Google AdSense/AdMob : Utilisé pour afficher des publicités. L\'identifiant publicitaire de Google peut être collecté.',
      },
      {
        heading: '4. Utilisation par les enfants',
        content: 'Ce service n\'est pas recommandé pour une utilisation non supervisée par les enfants de moins de 13 ans. Si un enfant utilise ce service, nous recommandons l\'accompagnement ou la supervision d\'un parent.\n\nL\'opérateur n\'est pas responsable des problèmes résultant de l\'utilisation non supervisée par un enfant sans le consentement parental.',
      },
      {
        heading: '5. Modifications de cette politique',
        content: 'Toute modification de cette politique sera publiée sur cette page.',
      },
      {
        heading: '6. Contact',
        content: 'Pour les questions relatives à la vie privée : cottonsblueleap@gmail.com',
      },
    ],
  },
  pt: {
    title: 'Política de Privacidade',
    sections: [
      {
        heading: '1. Informações coletadas',
        content:
          '"Fate 0:00" coleta as seguintes informações:\n• Nome (apelido): Para exibir os resultados da fortuna\n• Data e hora de nascimento: Para calcular a fortuna (Saju, horóscopo, etc.)\n• Gênero: Para o cálculo da fortuna Saju\n• Preferência de calendário lunar/solar: Para o cálculo da fortuna Saju',
      },
      {
        heading: '2. Armazenamento e processamento de dados',
        content:
          '• Todos os dados pessoais são armazenados apenas no dispositivo do usuário (localStorage).\n• Nenhum dado é transmitido ou coletado por servidores externos.\n• Todos os dados são automaticamente excluídos quando os dados do navegador são limpos.',
      },
      {
        heading: '3. Serviços de terceiros',
        content:
          'Este serviço pode utilizar os seguintes serviços de terceiros:\n• Google AdSense/AdMob: Utilizado para exibir anúncios. O ID de publicidade do Google pode ser coletado.',
      },
      {
        heading: '4. Uso por crianças',
        content: 'Este serviço não é recomendado para uso sem supervisão por crianças menores de 13 anos. Se uma criança utilizar este serviço, recomendamos a orientação ou supervisão dos pais.\n\nO operador não é responsável por quaisquer problemas decorrentes do uso sem supervisão por uma criança sem o consentimento dos pais.',
      },
      {
        heading: '5. Alterações nesta política',
        content: 'Quaisquer alterações nesta política serão publicadas nesta página.',
      },
      {
        heading: '6. Contato',
        content: 'Para consultas sobre privacidade: cottonsblueleap@gmail.com',
      },
    ],
  },
  hi: {
    title: 'गोपनीयता नीति',
    sections: [
      {
        heading: '1. एकत्र की जाने वाली जानकारी',
        content:
          '"Fate 0:00" निम्नलिखित जानकारी एकत्र करता है:\n• नाम (उपनाम): भाग्य परिणाम प्रदर्शित करने के लिए\n• जन्म तिथि और जन्म समय: भाग्य गणना (साजू, राशिफल, आदि) के लिए\n• लिंग: साजू भाग्य गणना के लिए\n• चंद्र/सौर कैलेंडर प्राथमिकता: साजू भाग्य गणना के लिए',
      },
      {
        heading: '2. डेटा भंडारण और प्रसंस्करण',
        content:
          '• सभी व्यक्तिगत डेटा केवल उपयोगकर्ता के डिवाइस पर (localStorage में) संग्रहीत किया जाता है।\n• कोई भी डेटा बाहरी सर्वर को प्रेषित या उनके द्वारा एकत्र नहीं किया जाता।\n• ब्राउज़र डेटा साफ़ करने पर सभी डेटा स्वचालित रूप से हटा दिया जाता है।',
      },
      {
        heading: '3. तृतीय-पक्ष सेवाएँ',
        content:
          'यह सेवा निम्नलिखित तृतीय-पक्ष सेवाओं का उपयोग कर सकती है:\n• Google AdSense/AdMob: विज्ञापन प्रदर्शित करने के लिए उपयोग किया जाता है। Google का विज्ञापन ID एकत्र किया जा सकता है।',
      },
      {
        heading: '4. बच्चों द्वारा उपयोग',
        content: 'यह सेवा 13 वर्ष से कम आयु के बच्चों के बिना निगरानी के उपयोग के लिए अनुशंसित नहीं है। यदि कोई बच्चा इस सेवा का उपयोग करता है, तो माता-पिता के मार्गदर्शन या निगरानी की सिफारिश की जाती है।\n\nमाता-पिता की सहमति के बिना बच्चे के बिना निगरानी के उपयोग से उत्पन्न किसी भी समस्या के लिए ऑपरेटर जिम्मेदार नहीं है।',
      },
      {
        heading: '5. इस नीति में परिवर्तन',
        content: 'इस नीति में कोई भी परिवर्तन इस पृष्ठ पर प्रकाशित किया जाएगा।',
      },
      {
        heading: '6. संपर्क',
        content: 'गोपनीयता संबंधी पूछताछ: cottonsblueleap@gmail.com',
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    sections: [
      {
        heading: '1. المعلومات التي نجمعها',
        content:
          'يقوم تطبيق "Fate 0:00" بجمع المعلومات التالية:\n• الاسم (اللقب): لعرض نتائج الحظ\n• تاريخ ووقت الميلاد: لحساب الحظ (ساجو، الأبراج، إلخ)\n• الجنس: لحساب حظ ساجو\n• تفضيل التقويم القمري/الشمسي: لحساب حظ ساجو',
      },
      {
        heading: '2. تخزين البيانات ومعالجتها',
        content:
          '• يتم تخزين جميع البيانات الشخصية فقط على جهاز المستخدم (localStorage).\n• لا يتم نقل أو جمع أي بيانات بواسطة خوادم خارجية.\n• يتم حذف جميع البيانات تلقائيًا عند مسح بيانات المتصفح.',
      },
      {
        heading: '3. خدمات الطرف الثالث',
        content:
          'قد تستخدم هذه الخدمة خدمات الطرف الثالث التالية:\n• Google AdSense/AdMob: يُستخدم لعرض الإعلانات. قد يتم جمع معرّف إعلانات Google.',
      },
      {
        heading: '4. استخدام الأطفال',
        content: 'لا يُنصح باستخدام هذه الخدمة دون إشراف للأطفال تحت سن 13 عامًا. إذا استخدم طفل هذه الخدمة، فإننا نوصي بتوجيه أو إشراف أحد الوالدين.\n\nلا يتحمل المشغّل المسؤولية عن أي مشاكل ناتجة عن استخدام طفل للخدمة دون إشراف ودون موافقة الوالدين.',
      },
      {
        heading: '5. التغييرات على هذه السياسة',
        content: 'سيتم نشر أي تغييرات على هذه السياسة في هذه الصفحة.',
      },
      {
        heading: '6. الاتصال',
        content: 'للاستفسارات المتعلقة بالخصوصية: cottonsblueleap@gmail.com',
      },
    ],
  },
  bn: {
    title: 'গোপনীয়তা নীতি',
    sections: [
      {
        heading: '1. সংগৃহীত তথ্য',
        content:
          '"Fate 0:00" নিম্নলিখিত তথ্য সংগ্রহ করে:\n• নাম (ডাকনাম): ভাগ্যফল প্রদর্শনের জন্য\n• জন্ম তারিখ ও জন্ম সময়: ভাগ্য গণনার জন্য (সাজু, রাশিফল, ইত্যাদি)\n• লিঙ্গ: সাজু ভাগ্য গণনার জন্য\n• চান্দ্র/সৌর পঞ্জিকা পছন্দ: সাজু ভাগ্য গণনার জন্য',
      },
      {
        heading: '2. ডেটা সংরক্ষণ ও প্রক্রিয়াকরণ',
        content:
          '• সকল ব্যক্তিগত ডেটা শুধুমাত্র ব্যবহারকারীর ডিভাইসে (localStorage) সংরক্ষিত হয়।\n• কোনো ডেটা বাহ্যিক সার্ভারে প্রেরিত বা সংগৃহীত হয় না।\n• ব্রাউজার ডেটা মুছে ফেললে সকল ডেটা স্বয়ংক্রিয়ভাবে মুছে যায়।',
      },
      {
        heading: '3. তৃতীয় পক্ষের সেবা',
        content:
          'এই সেবা নিম্নলিখিত তৃতীয় পক্ষের সেবা ব্যবহার করতে পারে:\n• Google AdSense/AdMob: বিজ্ঞাপন প্রদর্শনের জন্য ব্যবহৃত হয়। Google-এর বিজ্ঞাপন আইডি সংগ্রহ করা হতে পারে।',
      },
      {
        heading: '4. শিশুদের ব্যবহার',
        content: 'এই সেবা ১৩ বছরের কম বয়সী শিশুদের তত্ত্বাবধানহীন ব্যবহারের জন্য প্রস্তাবিত নয়। যদি কোনো শিশু এই সেবা ব্যবহার করে, তাহলে অভিভাবকের নির্দেশনা বা তত্ত্বাবধানে ব্যবহার করার পরামর্শ দেওয়া হয়।\n\nঅভিভাবকের সম্মতি ছাড়া শিশুর তত্ত্বাবধানহীন ব্যবহার থেকে উদ্ভূত কোনো সমস্যার জন্য পরিচালক দায়ী নয়।',
      },
      {
        heading: '5. এই নীতির পরিবর্তন',
        content: 'এই নীতিতে কোনো পরিবর্তন হলে এই পৃষ্ঠায় প্রকাশ করা হবে।',
      },
      {
        heading: '6. যোগাযোগ',
        content: 'গোপনীয়তা সংক্রান্ত জিজ্ঞাসা: cottonsblueleap@gmail.com',
      },
    ],
  },
  ru: {
    title: 'Политика конфиденциальности',
    sections: [
      {
        heading: '1. Собираемая информация',
        content:
          '«Fate 0:00» собирает следующую информацию:\n• Имя (псевдоним): Для отображения результатов гадания\n• Дата и время рождения: Для расчёта предсказаний (Саджу, гороскоп и т.д.)\n• Пол: Для расчёта предсказаний Саджу\n• Предпочтение лунного/солнечного календаря: Для расчёта предсказаний Саджу',
      },
      {
        heading: '2. Хранение и обработка данных',
        content:
          '• Все персональные данные хранятся только на устройстве пользователя (localStorage).\n• Никакие данные не передаются на внешние серверы и не собираются ими.\n• Все данные автоматически удаляются при очистке данных браузера.',
      },
      {
        heading: '3. Сторонние сервисы',
        content:
          'Данный сервис может использовать следующие сторонние сервисы:\n• Google AdSense/AdMob: Используется для показа рекламы. Рекламный идентификатор Google может быть собран.',
      },
      {
        heading: '4. Использование детьми',
        content: 'Данный сервис не рекомендуется для самостоятельного использования детьми младше 13 лет. Если ребёнок пользуется данным сервисом, рекомендуется руководство или надзор со стороны родителей.\n\nОператор не несёт ответственности за любые проблемы, возникшие в результате самостоятельного использования сервиса ребёнком без согласия родителей.',
      },
      {
        heading: '5. Изменения в политике',
        content: 'Любые изменения данной политики будут опубликованы на этой странице.',
      },
      {
        heading: '6. Контакты',
        content: 'По вопросам конфиденциальности: cottonsblueleap@gmail.com',
      },
    ],
  },
  de: {
    title: 'Datenschutzrichtlinie',
    sections: [
      {
        heading: '1. Erfasste Informationen',
        content:
          '„Fate 0:00" erfasst die folgenden Informationen:\n• Name (Spitzname): Zur Anzeige der Wahrsagungsergebnisse\n• Geburtsdatum und -zeit: Zur Berechnung des Horoskops (Saju, Sternzeichen usw.)\n• Geschlecht: Zur Berechnung des Saju-Horoskops\n• Mond-/Sonnenkalender-Präferenz: Zur Berechnung des Saju-Horoskops',
      },
      {
        heading: '2. Datenspeicherung und -verarbeitung',
        content:
          '• Alle personenbezogenen Daten werden ausschließlich auf dem Gerät des Nutzers gespeichert (localStorage).\n• Es werden keine Daten an externe Server übermittelt oder von diesen erfasst.\n• Alle Daten werden automatisch gelöscht, wenn die Browserdaten gelöscht werden.',
      },
      {
        heading: '3. Drittanbieterdienste',
        content:
          'Dieser Dienst kann folgende Drittanbieterdienste nutzen:\n• Google AdSense/AdMob: Wird zur Anzeige von Werbung verwendet. Die Google-Werbe-ID kann erfasst werden.',
      },
      {
        heading: '4. Nutzung durch Kinder',
        content: 'Dieser Dienst wird nicht für die unbeaufsichtigte Nutzung durch Kinder unter 13 Jahren empfohlen. Wenn ein Kind diesen Dienst nutzt, empfehlen wir die Anleitung oder Aufsicht eines Elternteils.\n\nDer Betreiber übernimmt keine Verantwortung für Probleme, die aus der unbeaufsichtigten Nutzung durch ein Kind ohne elterliche Zustimmung entstehen.',
      },
      {
        heading: '5. Änderungen dieser Richtlinie',
        content: 'Änderungen dieser Richtlinie werden auf dieser Seite veröffentlicht.',
      },
      {
        heading: '6. Kontakt',
        content: 'Für Datenschutzanfragen: cottonsblueleap@gmail.com',
      },
    ],
  },
  it: {
    title: 'Informativa sulla Privacy',
    sections: [
      {
        heading: '1. Informazioni raccolte',
        content:
          '"Fate 0:00" raccoglie le seguenti informazioni:\n• Nome (soprannome): Per visualizzare i risultati della divinazione\n• Data e ora di nascita: Per calcolare le previsioni (Saju, oroscopo, ecc.)\n• Genere: Per il calcolo della divinazione Saju\n• Preferenza calendario lunare/solare: Per il calcolo della divinazione Saju',
      },
      {
        heading: '2. Archiviazione ed elaborazione dei dati',
        content:
          '• Tutti i dati personali sono archiviati esclusivamente sul dispositivo dell\'utente (localStorage).\n• Nessun dato viene trasmesso o raccolto da server esterni.\n• Tutti i dati vengono automaticamente eliminati quando i dati del browser vengono cancellati.',
      },
      {
        heading: '3. Servizi di terze parti',
        content:
          'Questo servizio può utilizzare i seguenti servizi di terze parti:\n• Google AdSense/AdMob: Utilizzato per mostrare annunci pubblicitari. L\'ID pubblicitario di Google potrebbe essere raccolto.',
      },
      {
        heading: '4. Utilizzo da parte dei minori',
        content: 'Questo servizio non è consigliato per l\'uso non supervisionato da parte di minori di 13 anni. Se un minore utilizza questo servizio, si raccomanda la guida o la supervisione di un genitore.\n\nL\'operatore non è responsabile per eventuali problemi derivanti dall\'uso non supervisionato da parte di un minore senza il consenso dei genitori.',
      },
      {
        heading: '5. Modifiche a questa informativa',
        content: 'Eventuali modifiche a questa informativa saranno pubblicate su questa pagina.',
      },
      {
        heading: '6. Contatti',
        content: 'Per domande sulla privacy: cottonsblueleap@gmail.com',
      },
    ],
  },
  tr: {
    title: 'Gizlilik Politikası',
    sections: [
      {
        heading: '1. Toplanan Bilgiler',
        content:
          '"Fate 0:00" aşağıdaki bilgileri toplar:\n• Ad (takma ad): Fal sonuçlarını görüntülemek için\n• Doğum tarihi ve saati: Fal hesaplaması (Saju, burç vb.) için\n• Cinsiyet: Saju fal hesaplaması için\n• Ay/Güneş takvimi tercihi: Saju fal hesaplaması için',
      },
      {
        heading: '2. Veri Depolama ve İşleme',
        content:
          '• Tüm kişisel veriler yalnızca kullanıcının cihazında (localStorage) saklanır.\n• Hiçbir veri harici sunuculara iletilmez veya bunlar tarafından toplanmaz.\n• Tarayıcı verileri temizlendiğinde tüm veriler otomatik olarak silinir.',
      },
      {
        heading: '3. Üçüncü Taraf Hizmetleri',
        content:
          'Bu hizmet aşağıdaki üçüncü taraf hizmetlerini kullanabilir:\n• Google AdSense/AdMob: Reklam gösterimi için kullanılır. Google\'ın reklam kimliği toplanabilir.',
      },
      {
        heading: '4. Çocukların Kullanımı',
        content: 'Bu hizmet, 13 yaşın altındaki çocukların gözetimsiz kullanımı için önerilmemektedir. Bir çocuk bu hizmeti kullanıyorsa, ebeveyn rehberliği veya gözetimi önerilir.\n\nİşletmeci, ebeveyn onayı olmaksızın bir çocuğun gözetimsiz kullanımından kaynaklanan herhangi bir sorundan sorumlu değildir.',
      },
      {
        heading: '5. Bu Politikadaki Değişiklikler',
        content: 'Bu politikadaki herhangi bir değişiklik bu sayfada yayınlanacaktır.',
      },
      {
        heading: '6. İletişim',
        content: 'Gizlilik ile ilgili sorularınız için: cottonsblueleap@gmail.com',
      },
    ],
  },
};

function getLang(lng: string): string {
  // Direct match first
  if (policies[lng]) return lng;
  // Try base language (e.g., 'zh-CN' -> already handled, 'ko-KR' -> 'ko')
  const base = lng.split('-')[0];
  if (policies[base]) return base;
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
