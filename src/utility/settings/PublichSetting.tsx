import LanguageSelector from '../../utility/LanguageSelector';
import { useTranslation } from 'react-i18next';

const PublichSetting = () => {
  const { t, i18n } = useTranslation();
  return (
    <>
      <h3>{t('settings.publish')}</h3>
      <div className="form-check form-switch form-section d-flex justify-content-end mb20">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="flexSwitchCheckDefault"
        />
      </div>
      <div className="alert alert-secondary ms-3 mb-0 p-2" role="alert">
        マッチしたメンバーがいない場合はOFFにしないようにしてください。
      </div>
    </>
  );
};
export default PublichSetting;
