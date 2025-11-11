declare global {
  interface Window {
    hashconnect?: {
      hcData?: {
        pairingData?: {
          accountPublicKey?: string;
        };
      };
    };
  }
}
export {};
