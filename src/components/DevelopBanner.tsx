const env = process.env.REACT_APP_ENV;
const DevelopBanner = () => {
  return (
    <>
      {(env === "local" || env === "dev" || env === "test" || env === "stg") && (
        <div className="alert alert-secondary mt10 ml10 mr10" role="alert">
          Here is development environment. <a href="/list">Page List</a>
        </div>
      )}
    </>
  );
};
export default DevelopBanner;