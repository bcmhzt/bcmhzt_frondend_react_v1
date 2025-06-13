// 9b8f1859
import { onRequest } from 'firebase-functions/v2/https';
import { logger }    from 'firebase-functions';

/**
 * HTTP Trigger: curl http://localhost:5001/bcmhzt-b25e9/us-central1/hello
 */
export const hello = onRequest(
  {
    region: 'us-central1',
    invoker: 'public',
  },(_req, res) => {
  const name = 'World';
  logger.info('✅ [logger.info] Hello world, cloud function http triggered !', [name]);
  res.send('☀️ [res.send] Hello world, cloud function http triggered !\n');
  console.log('☹️ [console.log] Hello world, cloud function http triggered !\n');
});

/** for test */
export * from './uploads/logUpload';
/** upload image resize */ 
export * from './uploads/resizeImage';
/** Functions archtype for develop */
export * from './archtypes/archtype';
/** Functions archtype for develop */
export * from './utilities/makeSubImages';
