/** ef892fba */
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SettingsBase from '../../components/users/SettingsBase';

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/pages/user/Settings.tsx:xx] debug:', debug);
}

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

const Settings = () => {
  return (
    <>
      <div className="app-body">
        <Header />
        <div className="container bc-app">
          <div className="row">
            <div className="col-12 col-md-6 bc-left">
              <SettingsBase />
            </div>
            <div className="d-none d-md-block col-md-6 bc-right">right</div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};
export default Settings;
