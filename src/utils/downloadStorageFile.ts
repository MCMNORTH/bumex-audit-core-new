import { getBlob, getMetadata, ref } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { storage, auth } from '@/lib/firebase';

const waitForAuthReady = (timeoutMs: number = 5000) =>
  new Promise<void>((resolve, reject) => {
    if (auth.currentUser) {
      resolve();
      return;
    }
    const timeout = setTimeout(() => {
      unsub();
      reject(new Error('User not authenticated. Please sign in and retry.'));
    }, timeoutMs);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearTimeout(timeout);
        unsub();
        resolve();
      }
    });
  });

export type StorageSelfCheckResult = {
  ok: boolean;
  uid?: string;
  path?: string;
  projectId?: string;
  bucket?: string;
  bytesLength?: number;
  contentType?: string | null;
  updated?: string;
  error?: string;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  let timeoutId: number | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error('Timeout while downloading from Storage.'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
};

export const downloadStorageFile = async (storagePath: string): Promise<ArrayBuffer> => {
  await waitForAuthReady();

  console.log('storagePath', storagePath);
  console.log('firebase.projectId', storage.app.options.projectId);
  console.log('firebase.storageBucket', storage.app.options.storageBucket);
  console.log('auth.app.projectId', auth.app.options.projectId);
  console.log('UID', auth.currentUser?.uid);

  if (storagePath.startsWith('gs://')) {
    throw new Error('Invalid storagePath (gs://). Use a storage path like source-excel/<uid>/... instead.');
  }
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    throw new Error('Invalid storagePath (URL). Use the storage path, not a URL.');
  }

  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('User not authenticated. Please sign in and retry.');
  }
  if (!storagePath.startsWith(`source-excel/${uid}/`)) {
    throw new Error(`Invalid storagePath. Expected source-excel/${uid}/...`);
  }

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = await getMetadata(storageRef);
    console.log('METADATA', {
      size: metadata.size,
      contentType: metadata.contentType,
      updated: metadata.updated,
    });

    const blob = await withTimeout(getBlob(storageRef), 15000);
    const arrayBuffer = await blob.arrayBuffer();
    console.log('DOWNLOAD BYTES', arrayBuffer.byteLength);
    return arrayBuffer;
  } catch (error) {
    console.error('DOWNLOAD FAILED', {
      uid,
      storagePath,
      bucket: storage.app.options.storageBucket,
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
    });
    throw error;
  }
};

export const storageSelfCheck = async (storagePath: string): Promise<StorageSelfCheckResult> => {
  try {
    await waitForAuthReady();
    const uid = auth.currentUser?.uid;
    const bucket = storage.app.options.storageBucket;
    const projectId = storage.app.options.projectId;
    const storageRef = ref(storage, storagePath);

    let metadata;
    try {
      metadata = await getMetadata(storageRef);
    } catch (error) {
      const message = (error as Error)?.message || '';
      if (message.includes('object-not-found')) {
        return {
          ok: false,
          uid,
          path: storagePath,
          bucket,
          projectId,
          error: 'File not found (wrong path)',
        };
      }
      if (message.includes('unauthorized') || message.includes('permission')) {
        return {
          ok: false,
          uid,
          path: storagePath,
          bucket,
          projectId,
          error: 'Unauthorized (rules/path/uid)',
        };
      }
      return {
        ok: false,
        uid,
        path: storagePath,
        bucket,
        projectId,
        error: `${(error as Error)?.name}: ${(error as Error)?.message}`,
      };
    }

    let blob: Blob;
    try {
      blob = await withTimeout(getBlob(storageRef), 15000);
    } catch (error) {
      return {
        ok: false,
        uid,
        path: storagePath,
        bucket,
        projectId,
        error: 'Timeout or network error while downloading from Storage.',
      };
    }

    return {
      ok: true,
      uid,
      path: storagePath,
      bucket,
      projectId,
      bytesLength: blob.size,
      contentType: metadata.contentType ?? null,
      updated: metadata.updated,
    };
  } catch (error) {
    return {
      ok: false,
      uid: auth.currentUser?.uid,
      path: storagePath,
      bucket: storage.app.options.storageBucket,
      projectId: storage.app.options.projectId,
      error: `${(error as Error)?.name}: ${(error as Error)?.message}`,
    };
  }
};
