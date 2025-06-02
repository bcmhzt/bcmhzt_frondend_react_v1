const TimeZoneSetting = () => {
  /**
   * データベースからタイムゾーンを取得して初期設定する
   */
  return (
    <>
      <div className="language-selector d-flex justify-content-end mr20 ml20 mb20">
        <select className="col-lg-2 form-select" value="">
          <option value="">オーストラリア東部標準時、標準時 (UTC+10:00)</option>
          <option value="">日本標準時 (UTC+9:00)</option>
          <option value="">韓国標準時 (UTC+9:00)</option>
          <option value="">中国標準時 (UTC+8:00)</option>
          <option value="">インド標準時 (UTC+5:30)</option>
          <option value="">南アフリカ標準時 (UTC+2:00)</option>
          <option value="">中央ヨーロッパ時間、標準時 (UTC+1:00)</option>
          <option value="">ドイツ標準時 (UTC+1:00)</option>
          <option value="">フランス標準時 (UTC+1:00)</option>
          <option value="">グリニッジ標準時 (UTC+0:00)</option>
          <option value="">ブラジル時間、標準時 (UTC-3:00)</option>
          <option value="">米国東部時間、標準時 (UTC-5:00)</option>
          <option value="">米国中部時間、標準時 (UTC-6:00)</option>
          <option value="">米国山岳時間、標準時 (UTC-7:00)</option>
          <option value="">米国太平洋時間、標準時 (UTC-8:00)</option>
        </select>
      </div>
    </>
  );
};
export default TimeZoneSetting;
