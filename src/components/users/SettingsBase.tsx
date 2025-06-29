// import { useState } from 'react';
/** i18n */
import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';
import TimeZoneSetting from '../../utility/TimeZoneSetting';
import PublichSetting from '../../utility/settings/PublichSetting';
import MatchedNotificationSetting from '../../utility/settings/MatchedNotificationSetting';
import LikedNotificationSetting from '../../utility/settings/LikedNotificationSetting';

/**
 * ef892fba
 * [src/pages/user/Settings.tsx:xx]
 *
 * type: page.
 *
 * [Order]
 * - 言語の設定 (日本語)
 * - タイムゾーン (日本標準時（JST）)
 * - ナイススケベされたときの通知 (OFF)
 * - マッチしたときの通知 (ON)
 * - サイト内公開 (ON)
 */

const SettingsBase = () => {
  // const [loading, setLoading] = useState(false);
  // const [status, setStatus] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="settings">
        <h2 className="section-title-h2 mb20">{t('settings.title')}</h2>

        <h3>{t('settings.language')}</h3>
        <LanguageSelector />

        <h3>{t('settings.timezone')}</h3>
        <TimeZoneSetting />

        <LikedNotificationSetting />

        <MatchedNotificationSetting />

        <PublichSetting />
      </div>
    </>
  );
};
export default SettingsBase;
