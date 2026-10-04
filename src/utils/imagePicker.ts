import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { api } from '../services/api';
import { Alert } from 'react-native';

export interface PickAndUploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

export async function pickAndUploadImage(): Promise<PickAndUploadResult> {
  return new Promise((resolve) => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        resolve({ success: false, message: 'Image selection cancelled' });
        return;
      }

      if (response.errorCode || response.errorMessage) {
        resolve({
          success: false,
          message: response.errorMessage || response.errorCode || 'Failed to select image',
        });
        return;
      }

      const asset = response.assets && response.assets[0];
      if (!asset || !asset.base64) {
        resolve({ success: false, message: 'No valid image selected' });
        return;
      }

      const mimeType = asset.type || 'image/jpeg';
      const base64Data = `data:${mimeType};base64,${asset.base64}`;

      try {
        const res = await api.uploadImage(base64Data);
        if (res.success && res.data?.url) {
          resolve({ success: true, url: res.data.url });
        } else {
          resolve({ success: false, message: res.message || 'Image upload failed' });
        }
      } catch (err: any) {
        resolve({ success: false, message: err.message || 'Failed to upload image to server' });
      }
    });
  });
}
