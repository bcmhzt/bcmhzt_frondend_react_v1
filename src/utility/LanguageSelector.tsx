import React, { useEffect, useState } from 'react';
// import { Helmet, HelmetProvider } from 'react-helmet-async';
import i18n from '../settings/i18n'; /** Import the shared i18n configuration */

/** Language selection component */
const LanguageSelector = () => {
  /** Manage the currently selected language */
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  /** Handle language changes */
  interface LanguageChangeEvent extends React.ChangeEvent<HTMLSelectElement> {}

  const handleLanguageChange = (event: LanguageChangeEvent): void => {
    const selectedLanguage: string = event.target.value;
    i18n.changeLanguage(selectedLanguage); /** Change the language using i18n */
    setCurrentLanguage(
      selectedLanguage
    ); /** Update the state with the selected language */
    localStorage.setItem(
      'language',
      selectedLanguage
    ); /** Save the selected language in localStorage */
  };

  /** Synchronize i18n language on initial render */
  useEffect(() => {
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage]);

  return (
    <>
      {/* <HelmetProvider>
      <Helmet htmlAttributes={{ lang: i18n.currentLanguage }} />
    </HelmetProvider> */}

      <div className="language-selector d-flex justify-content-end mr20 ml20 mb20">
        <select
          className="col-lg-2 form-select"
          value={
            currentLanguage
          } /** Display the current language in the dropdown */
          onChange={
            handleLanguageChange
          } /** Trigger language change on selection */
        >
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
          <option value="zh">中文</option>
          <option value="ko">한국어</option>
          <option value="ja">日本語</option>
        </select>
      </div>
    </>
  );
};

export default LanguageSelector;
