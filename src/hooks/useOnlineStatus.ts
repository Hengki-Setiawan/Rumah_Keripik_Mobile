import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected !== false);
    });
    return () => unsub();
  }, []);

  return isOnline;
}
