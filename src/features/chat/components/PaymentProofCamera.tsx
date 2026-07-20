import { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { colors, borderRadius } from '../../../theme';

type Props = {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
};

export function PaymentProofCamera({ onCapture, onClose }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Memuat kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Akses Kamera</Text>
        <Text style={styles.subtitle}>
          Izinkan akses kamera untuk memfoto bukti pembayaran.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function takePicture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({
      base64: true,
      quality: 0.7,
    });
    if (photo?.base64) {
      setCaptured(photo.base64);
    }
  }

  if (captured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Bukti Pembayaran</Text>
        <Image
          source={{ uri: `data:image/jpeg;base64,${captured}` }}
          style={styles.preview}
          resizeMode="contain"
        />
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => onCapture(captured)}
          >
            <Text style={styles.btnText}>Gunakan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setCaptured(null)}>
            <Text style={styles.cancelText}>Ulang</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraHint}>Foto bukti pembayaran</Text>
          <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 24,
    gap: 12,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
    gap: 20,
  },
  cameraHint: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    backgroundColor: colors.surfaceDark,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
