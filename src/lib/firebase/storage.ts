import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not configured.');
  
  const fileRef = ref(storage, `avatars/${uid}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

export async function uploadCredential(uid: string, file: File, filename: string): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not configured.');
  
  const fileRef = ref(storage, `credentials/${uid}/${filename}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
