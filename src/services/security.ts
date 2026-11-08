// Security Service for budgetfy: SHA-256 PIN hashing, WebAuthn biometrics, and privacy masking

export const SecurityService = {
  // Hash PIN code using browser Web Crypto SHA-256
  async hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Verify PIN against stored SHA-256 hash
  async verifyPin(pin: string, storedHash: string): Promise<boolean> {
    const computed = await this.hashPin(pin);
    return computed === storedHash;
  },

  // Check if phone or computer supports hardware biometrics (Face ID, Touch ID, Fingerprint, Windows Hello)
  async isBiometricsSupported(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential) {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    } catch {
      return false;
    }
  },

  // Register biometrics via WebAuthn
  async registerBiometrics(userName: string): Promise<string | null> {
    try {
      if (!window.PublicKeyCredential) return null;

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      crypto.getRandomValues(userId);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'budgetfy' },
          user: {
            id: userId,
            name: userName || 'budgetfy-user',
            displayName: userName || 'budgetfy User',
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential | null;

      return credential ? credential.id : null;
    } catch (err) {
      console.warn('Biometric registration error:', err);
      return null;
    }
  },

  // Verify biometrics via WebAuthn
  async authenticateBiometrics(): Promise<boolean> {
    try {
      if (!window.PublicKeyCredential) return false;

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
        },
      });

      return Boolean(assertion);
    } catch (err) {
      console.warn('Biometric verification cancelled or failed:', err);
      return false;
    }
  },

  // Format currency with support for privacy masking (e.g. $•••• in public mode)
  formatAmount(amount: number, symbol: string, isMasked: boolean): string {
    if (isMasked) {
      return `${symbol}••••`;
    }
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

