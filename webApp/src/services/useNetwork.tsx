import { useEffect, useState } from 'react';
import { Network } from '@capacitor/network';

const initialState = {
  id: '0',
  connected: true,
  connectionType: 'unknown',
};

export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState(initialState);
  useEffect(() => {
    const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange);
    Network.getStatus().then(handleNetworkStatusChange);
    let canceled = false;
    return () => {
      canceled = true;
      handler.remove();
    };

    function handleNetworkStatusChange(status: any) {
      console.log('useNetwork - status change', status);
      if (!canceled) {
        setNetworkStatus({ ...status, id: '0' });
      }
    }
  }, []);
  return { networkStatus };
};
