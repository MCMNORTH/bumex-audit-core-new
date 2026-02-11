import { uploadBytesResumable, getDownloadURL, ref } from 'firebase/storage';
import { auth, storage } from '@/lib/firebase';

type UploadResult = {
  path: string;
  url: string;
  size: number;
};

type UploadXlsmOptions = {
  onProgress?: (progress: number) => void;
  projectId?: string;
};

const safeFileName = (name: string) => name.replace(/[^\w.\-]+/g, '_');

const getStorageBucket = () => storage.app.options.storageBucket || 'unknown';

export const uploadXlsm = async (
  file: File,
  options: UploadXlsmOptions = {}
): Promise<UploadResult> => {
  if (!file.name.toLowerCase().endsWith('.xlsm')) {
    const err = new Error('Only .xlsm files are accepted.');
    (err as { code?: string }).code = 'storage/invalid-file-type';
    throw err;
  }

  const user = auth.currentUser;
  if (!user) {
    const err = new Error('User not authenticated');
    (err as { code?: string }).code = 'auth/not-authenticated';
    throw err;
  }

  const fileName = safeFileName(file.name);
  const storagePath = `source-excel/${user.uid}/${Date.now()}-${fileName}`;
  const storageRef = ref(storage, storagePath);
  const bucket = getStorageBucket();

  console.info('Starting XLSM upload', {
    uid: user.uid,
    storagePath,
    bucket,
  });

  const metadata = {
    contentType: file.type || 'application/vnd.ms-excel.sheet.macroEnabled.12',
    customMetadata: options.projectId ? { projectId: options.projectId } : undefined,
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise<UploadResult>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (options.onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options.onProgress(Number.isFinite(progress) ? progress : 0);
        }
      },
      (error) => {
        console.error('XLSM upload failed', {
          uid: user.uid,
          storagePath,
          bucket,
          code: (error as { code?: string }).code,
          message: (error as Error).message,
          stack: (error as Error).stack,
        });
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            path: storagePath,
            url,
            size: file.size,
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

export const getStorageBucketName = () => getStorageBucket();
