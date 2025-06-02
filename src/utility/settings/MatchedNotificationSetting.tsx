import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';

const MatchedNotificationSetting = () => {
  const { t, i18n } = useTranslation();
  return (
    <>
      <h3>{t('settings.notification_matched')}</h3>
      <div className="form-check form-switch form-section d-flex justify-content-end mb20">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
        />
      </div>
    </>
  );
};
export default MatchedNotificationSetting;
