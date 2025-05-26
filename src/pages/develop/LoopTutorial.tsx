import { useAuth } from '../../contexts/AuthContext';
// import { UserFirebase } from '../../types/UserFirebase'; // adjust the path as needed

// interface CurrentUserProfile {
//   [section: string]: any; // どんなキーでも OK、値の中身は any
// }

const LoopTutorial = () => {
  const { currentUserProfile, isLogin } = useAuth();
  return (
    <>
      <h2>LoopTutorial</h2>
      <p>isLogin: {isLogin ? 'ログイン中' : '未ログイン'}</p>
      <pre>{JSON.stringify(isLogin, null, 2)}</pre>
      {/* <pre>{JSON.stringify(currentUserProfile, null, 2)}</pre> */}

      <div>
        {Object.entries(currentUserProfile).map(([section, data]) => (
          <div key={section} style={{ marginBottom: '1em' }}>
            {/* セクション名 */}
            <h3>{section}</h3>
            {Array.isArray(data) ? (
              data.map((item, i) => (
                <pre key={i} style={{ background: '#fafafa', padding: '4px' }}>
                  {JSON.stringify(item, null, 2)}
                </pre>
              ))
            ) : (
              <pre style={{ background: '#fafafa', padding: '4px' }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
            {/* <pre style={{ background: '#f0f0f0', padding: '8px' }}>
              {JSON.stringify(data, null, 2)}
            </pre> */}
          </div>
        ))}
      </div>
    </>
  );
};
export default LoopTutorial;
