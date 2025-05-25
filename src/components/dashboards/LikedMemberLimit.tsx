const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

interface ApiResponse {
  success: any;
  status: any;
  message: any;
  data: any;
  errors: any;
}

const ArchitectFile = () => {
  return (
    <>
      {/* ArchitectFile
      <pre>{JSON.stringify(apiEndpoint, null, 2)}</pre> */}
    </>
  );
};
export default ArchitectFile;
