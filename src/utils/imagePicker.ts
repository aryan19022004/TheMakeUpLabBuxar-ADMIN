import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';

export interface PickImageResult {
  success: boolean;
  uri?: string;
  base64?: string;
  fileName?: string;
  fileSize?: number;
  message?: string;
}

/**
 * Opens image gallery to select an image.
 * Does NOT immediately upload to server or Cloudinary.
 * Returns local image URI for immediate preview and base64 string for form submission.
 */
export async function pickImage(): Promise<PickImageResult> {
  return new Promise((resolve) => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    };

    launchImageLibrary(options, (response) => {
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
      if (!asset || (!asset.uri && !asset.base64)) {
        resolve({ success: false, message: 'No valid image selected' });
        return;
      }

      const mimeType = asset.type || 'image/jpeg';
      const base64Data = asset.base64 ? `data:${mimeType};base64,${asset.base64}` : undefined;

      resolve({
        success: true,
        uri: asset.uri,
        base64: base64Data,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      });
    });
  });
}
