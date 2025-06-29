import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

// 型定義
type PropensityItemApi = {
  id: number;
  name: string;
  user_status: number;
  // 他にAPIから返るプロパティがあればここに追加
};

type PropensityItem = PropensityItemApi & {
  showSavedMessage: boolean;
};

// Propensity

/* debug */
let debug = process.env.REACT_APP_DEBUG;
if (debug === 'true') {
  console.log('[src/components/v1/Propensity.js:13] debug:', debug);
}
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Propensity = () => {
  const { token } = useAuth();
  const [propensitySelfRecognition, setSelfRecognition] = useState<
    PropensityItem[]
  >([]);
  const [propensityPropensity, setPropensity] = useState<PropensityItem[]>([]);
  const [propensityRelationship, setRelationship] = useState<PropensityItem[]>(
    []
  );
  const [propensityNg, setNg] = useState<PropensityItem[]>([]);
  const [propensityFetish, setFetish] = useState<PropensityItem[]>([]);
  const [propensityCommunicationStyle, setCommunicationStyle] = useState<
    PropensityItem[]
  >([]);
  const [loading, setLoading] = useState(false); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージを管理
  // const [updateLoading, setUpdateLoading] = useState(false); // スイッチ更新中の状態

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      console.log('[src/components/v1/Propensity.js:13] debug:', token);

      /** 自己認識 */
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiEndpoint}/v1/get/propensities/self_recognition?lang=ja`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedData: PropensityItem[] = response.data.map(
          (item: PropensityItemApi) => ({
            ...item,
            user_status: item.user_status === 1 ? 1 : 0,
            showSavedMessage: false,
          })
        );
        setSelfRecognition(updatedData);
        console.log(
          '[src/components/v1/Propensity.js:13] updatedData:',
          updatedData
        );
      } catch (err) {
        console.error('API error:', err);
        console.log('[src/components/v1/Propensity.js:13] updatedData:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'APIエラーが発生しました。'
        );
      } finally {
        setLoading(false);
      }

      /** 性癖 */
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiEndpoint}/v1/get/propensities/propensity?lang=ja`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedData: PropensityItem[] = response.data.map(
          (item: PropensityItemApi): PropensityItem => ({
            ...item,
            user_status: item.user_status === 1 ? 1 : 0,
            showSavedMessage: false,
          })
        );
        setPropensity(updatedData);
        console.log(
          '[src/components/v1/Propensity.js:13] updatedData:',
          updatedData
        );
      } catch (err) {
        console.error('API error:', err);
        console.log('[src/components/v1/Propensity.js:13] updatedData:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'APIエラーが発生しました。'
        );
      } finally {
        setLoading(false);
      }

      /** 関係の目的 */
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiEndpoint}/v1/get/propensities/relationship?lang=ja`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedData: PropensityItem[] = response.data.map(
          (item: PropensityItemApi): PropensityItem => ({
            ...item,
            user_status: item.user_status === 1 ? 1 : 0,
            showSavedMessage: false,
          })
        );
        setRelationship(updatedData);
        console.log(
          '[src/components/v1/Propensity.js:13] updatedData:',
          updatedData
        );
      } catch (err) {
        console.error('API error:', err);
        console.log('[src/components/v1/Propensity.js:13] updatedData:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'APIエラーが発生しました。'
        );
      } finally {
        setLoading(false);
      }

      /** 絶対NG項目 */
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiEndpoint}/v1/get/propensities/ng?lang=ja`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedData: PropensityItem[] = response.data.map(
          (item: PropensityItemApi): PropensityItem => ({
            ...item,
            user_status: item.user_status === 1 ? 1 : 0,
            showSavedMessage: false,
          })
        );
        setNg(updatedData);
        console.log(
          '[src/components/v1/Propensity.js:13] updatedData:',
          updatedData
        );
      } catch (err) {
        console.error('API error:', err);
        console.log('[src/components/v1/Propensity.js:13] updatedData:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'APIエラーが発生しました。'
        );
      } finally {
        setLoading(false);
      }

      /** フェチ要素 */
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiEndpoint}/v1/get/propensities/fetish?lang=ja`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const updatedData: PropensityItem[] = response.data.map(
          (item: PropensityItemApi): PropensityItem => ({
            ...item,
            user_status: item.user_status === 1 ? 1 : 0,
            showSavedMessage: false,
          })
        );
        setFetish(updatedData);
        console.log(
          '[src/components/v1/Propensity.js:13] updatedData:',
          updatedData
        );
      } catch (err) {
        console.error('API error:', err);
        console.log('[src/components/v1/Propensity.js:13] updatedData:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'APIエラーが発生しました。'
        );
      } finally {
        setLoading(false);
      }

      /**コミュニケーションスタイル */
      try {
        setLoading(true);
        const response = await axios.get(
          `${apiEndpoint}/v1/get/propensities/communication_style?lang=ja`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        interface CommunicationStyleApi {
          id: number;
          name: string;
          user_status: number;
        }
        interface CommunicationStyle extends CommunicationStyleApi {
          showSavedMessage: boolean;
        }
        const updatedData: CommunicationStyle[] = response.data.map(
          (item: CommunicationStyleApi): CommunicationStyle => ({
            ...item,
            user_status: item.user_status === 1 ? 1 : 0,
            showSavedMessage: false,
          })
        );
        setCommunicationStyle(updatedData);
        console.log(
          '[src/components/v1/Propensity.js:13] updatedData:',
          updatedData
        );
      } catch (err) {
        console.error('API error:', err);
        console.log('[src/components/v1/Propensity.js:13] updatedData:', err);
        setError(
          typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message: string }).message
            : 'APIエラーが発生しました。'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // interface HandlePropensityChangeEvent {
  //   id: number;
  //   value: number;
  // }

  const handlePropensityChange = async (
    id: number,
    value: number
  ): Promise<void> => {
    console.log('[src/components/v1/Propensity.js:50] id:value:', id, value);
    try {
      setError(null);
      console.log('[src/components/v1/Propensity.js:50] action:', id, value);
      const response = await axios.post(
        `${apiEndpoint}/v1/update/propensity`,
        { propensity_id: id, status: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelfRecognition((prev: PropensityItem[]) =>
        prev.map((item: PropensityItem) =>
          item.id === id
            ? { ...item, user_status: value, showSavedMessage: true }
            : item
        )
      );
      setPropensity((prev: PropensityItem[]) =>
        prev.map((item: PropensityItem) =>
          item.id === id
            ? { ...item, user_status: value, showSavedMessage: true }
            : item
        )
      );
      setRelationship((prev: PropensityItem[]) =>
        prev.map((item: PropensityItem) =>
          item.id === id
            ? { ...item, user_status: value, showSavedMessage: true }
            : item
        )
      );
      setNg((prev: PropensityItem[]) =>
        prev.map((item: PropensityItem) =>
          item.id === id
            ? { ...item, user_status: value, showSavedMessage: true }
            : item
        )
      );
      setFetish((prev: PropensityItem[]) =>
        prev.map((item: PropensityItem) =>
          item.id === id
            ? { ...item, user_status: value, showSavedMessage: true }
            : item
        )
      );
      setCommunicationStyle((prev: PropensityItem[]) =>
        prev.map((item: PropensityItem) =>
          item.id === id
            ? { ...item, user_status: value, showSavedMessage: true }
            : item
        )
      );
      console.log(
        '[src/components/v1/Propensity.js:50] API Response:',
        response.data
      );
    } catch (err) {
      console.log('[src/components/v1/Propensity.js:50] API err:', err);
    } finally {
      // setUpdateLoading(false);
    }
  };

  return (
    <>
      <h2>性癖情報</h2>
      {loading && <p>Loading...</p>}
      {!loading && !error && (
        <div className="myprofile-base-items mt20">
          <h3>自己認識</h3>
          <div className="self-recognition propensity-category">
            {propensitySelfRecognition.map((item) => (
              <div
                key={item.id}
                className="form-check form-switch checkbox-item"
              >
                <input
                  className="form-check-input propensity-checkbox"
                  type="checkbox"
                  role="switch"
                  id={`propensity-${item.id}`}
                  name={`propensity-${item.id}`}
                  value={item.id}
                  checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
                  onChange={(e) =>
                    handlePropensityChange(item.id, e.target.checked ? 1 : 0)
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor={`propensity-${item.id}`}
                >
                  {item.name}
                </label>
                {item.showSavedMessage && (
                  <span className="ml10 pdupdated">保存完了</span>
                )}
              </div>
            ))}
          </div>

          <div className="propensity propensity-category mt30">
            <h3>性癖</h3>
            <div className="prepensity">
              {loading && <p>Loading...</p>}
              {propensityPropensity.map((item) => (
                <div
                  key={item.id}
                  className="form-check form-switch checkbox-item"
                >
                  <input
                    className="form-check-input propensity-checkbox"
                    type="checkbox"
                    role="switch"
                    id={`propensity-${item.id}`}
                    name={`propensity-${item.id}`}
                    value={item.id}
                    checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
                    onChange={(e) =>
                      handlePropensityChange(item.id, e.target.checked ? 1 : 0)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`propensity-${item.id}`}
                  >
                    {item.name}
                  </label>
                  {item.showSavedMessage && (
                    <span className="ml10 pdupdated">保存完了</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="relationship propensity-category mt30">
            <h3>関係の目的</h3>
            <div className="propensity-relationship">
              {loading && <p>Loading...</p>}
              {propensityRelationship.map((item) => (
                <div
                  key={item.id}
                  className="form-check form-switch checkbox-item"
                >
                  <input
                    className="form-check-input propensity-checkbox"
                    type="checkbox"
                    role="switch"
                    id={`propensity-${item.id}`}
                    name={`propensity-${item.id}`}
                    value={item.id}
                    checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
                    onChange={(e) =>
                      handlePropensityChange(item.id, e.target.checked ? 1 : 0)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`propensity-${item.id}`}
                  >
                    {item.name}
                  </label>
                  {item.showSavedMessage && (
                    <span className="ml10 pdupdated">保存完了</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="ng propensity-category mt30">
            <h3>絶対NG項目</h3>
            <div className="ng">
              {loading && <p>Loading...</p>}
              {propensityNg.map((item) => (
                <div
                  key={item.id}
                  className="form-check form-switch checkbox-item"
                >
                  <input
                    className="form-check-input propensity-checkbox"
                    type="checkbox"
                    role="switch"
                    id={`propensity-${item.id}`}
                    name={`propensity-${item.id}`}
                    value={item.id}
                    checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
                    onChange={(e) =>
                      handlePropensityChange(item.id, e.target.checked ? 1 : 0)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`propensity-${item.id}`}
                  >
                    {item.name}
                  </label>
                  {item.showSavedMessage && (
                    <span className="ml10 pdupdated">保存完了</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="fetish propensity-category mt30">
            <h3>フェチ要素</h3>
            <div className="fetish">
              {loading && <p>Loading...</p>}
              {propensityFetish.map((item) => (
                <div
                  key={item.id}
                  className="form-check form-switch checkbox-item"
                >
                  <input
                    className="form-check-input propensity-checkbox"
                    type="checkbox"
                    role="switch"
                    id={`propensity-${item.id}`}
                    name={`propensity-${item.id}`}
                    value={item.id}
                    checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
                    onChange={(e) =>
                      handlePropensityChange(item.id, e.target.checked ? 1 : 0)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`propensity-${item.id}`}
                  >
                    {item.name}
                  </label>
                  {item.showSavedMessage && (
                    <span className="ml10 pdupdated">保存完了</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="communication-style propensity-category mt30">
            <h3>コミュニケーションスタイル</h3>
            <div className="communication-style">
              {loading && <p>Loading...</p>}
              {propensityCommunicationStyle.map((item) => (
                <div
                  key={item.id}
                  className="form-check form-switch checkbox-item"
                >
                  <input
                    className="form-check-input propensity-checkbox"
                    type="checkbox"
                    role="switch"
                    id={`propensity-${item.id}`}
                    name={`propensity-${item.id}`}
                    value={item.id}
                    checked={item.user_status === 1} // user_statusが1の場合ON、それ以外はOFF
                    onChange={(e) =>
                      handlePropensityChange(item.id, e.target.checked ? 1 : 0)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`propensity-${item.id}`}
                  >
                    {item.name}
                  </label>
                  {item.showSavedMessage && (
                    <span className="ml10 pdupdated">保存完了</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* <pre>{JSON.stringify(propensitySelfRecognition, null, 2)}</pre> */}
      {/* <div className="myprofile-base-items">
      <div className="pb-nicknam mt20">
        <h3>ニックネーム</h3>
        <div className="mb10">
          <span className="pdupdated">保存完了</span>
        </div>
        <div className="pd-comment">表示されるニックネーム</div>
          <input
            type="text"
            className="form-control"
            id="nickname"
            name="nickname"
            placeholder="ニックネーム"
            value=""
          />
      </div>
    </div> */}
    </>
  );
};
export default Propensity;
