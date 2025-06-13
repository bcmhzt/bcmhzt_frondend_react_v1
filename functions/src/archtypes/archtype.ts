// functions/src/archtypes/archtype.ts
import { onRequest }         from 'firebase-functions/v2/https';
import { logger }            from 'firebase-functions';
import { fireStorage } from '../firebase_admin';

export const listFiles = onRequest(async (req, res) => {
  // クエリ param ?dir=path/to/folder/
  // curl "https://us‑central1-bcmhzt-b25e9.cloudfunctions.net/listFiles?dir=profiles/0RIaflqb1DXhcyhNOb8MHolEtPg1/"

  const dir = (req.query.dir as string | undefined) ?? '';
  const prefix = dir.replace(/^\/+/, '');          // 先頭 '/' を除去

  try {
    // 指定 prefix 配下のオブジェクトを列挙
    const [files] = await fireStorage.getFiles({ prefix });

    const paths = files.map(f => f.name);
    logger.info('Listed files', { prefix, count: paths.length });

    res.json({ ok: true, path: prefix, files: paths });
  } catch (err) {
    logger.error('Failed to list files', { prefix, err });
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});



