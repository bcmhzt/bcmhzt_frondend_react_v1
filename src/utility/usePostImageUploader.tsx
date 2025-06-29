import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebaseConfig'; // ← firebaseConfigのパスはプロジェクトに合わせて調整してください
import { v4 as uuidv4 } from 'uuid';

export interface usePostImageUploaderOptions {
  baseDir?: string;
  uid?: string;
  limit?: number;
}

/**
 * ローカルFile → Firebase Storageアップロード → ダウンロードURL取得
 */
export function usePostImageUploader(
  options: usePostImageUploaderOptions = {}
) {
  const { baseDir = 'uploads', uid = '', limit = 10 } = options;
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  // 画像追加
  const addFiles = useCallback(
    (newFiles: File[]) => {
      setFiles((prev) => [...prev, ...newFiles].slice(0, limit));
    },
    [limit]
  );

  // 画像削除
  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setUploadProgress((prev) => prev.filter((_, i) => i !== idx));
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // 画像アップロード（Firebase Storage）
  const uploadAll = useCallback(async (): Promise<string[]> => {
    if (files.length === 0) return [];
    const uploadUrlList: string[] = [];

    await Promise.all(
      files.map((file, i) => {
        return new Promise<void>((resolve, reject) => {
          const ext = file.name.split('.').pop();
          const fileName = `${uuidv4()}.${ext}`;
          const metadata = {
            contentType: file.type,
            cacheControl: 'public,max-age=31536000,immutable',
          };
          const storageRef = ref(storage, `${baseDir}/${uid}/${fileName}`);
          const task = uploadBytesResumable(storageRef, file, metadata);

          task.on(
            'state_changed',
            (snap) => {
              const percent = Math.round(
                (snap.bytesTransferred / snap.totalBytes) * 100
              );
              setUploadProgress((prev) => {
                const next = [...prev];
                next[i] = percent;
                return next;
              });
            },
            (err) => {
              reject(err);
            },
            () => {
              getDownloadURL(task.snapshot.ref)
                .then((url) => {
                  setUrls((prev) => {
                    const next = [...prev];
                    next[i] = url;
                    return next;
                  });
                  uploadUrlList[i] = url;
                  resolve();
                })
                .catch(reject);
            }
          );
        });
      })
    );
    // 空要素を除外して返す
    return uploadUrlList.filter(Boolean);
  }, [files, baseDir, uid]);

  return {
    files,
    uploadProgress,
    urls,
    addFiles,
    removeFile,
    uploadAll,
  };
}
