import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, Delete, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { SecurityService } from '../services/security';
import { sound } from '../services/sound';

interface AppLockScreenProps {
  storedPinHash: string;
  biometricsEnabled?: boolean;
  onUnlock: () => void;
  onForgotPin?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  storedPinHash,
  biometricsEnabled,
  onUnlock,
  onForgotPin,
}) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    SecurityService.isBiometricsSupported().then(supported => {
      setBiometricAvailable(supported && Boolean(biometricsEnabled));
      if (supported && biometricsEnabled) {
        handleBiometricAuth();
      }
    });
  }, [biometricsEnabled]);

  const handleKeyPress = (digit: string) => {
    if (pin.length >= 6) return;
    sound.playTap();
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMessage('');

    // If reaches 4 or 6 digits, check
    if (nextPin.length >= 4) {
      checkPin(nextPin);
    }
  };

  const handleDelete = () => {
    sound.playTap();
    setPin(prev => prev.slice(0, -1));
    setErrorMessage('');
  };

  const checkPin = async (candidate: string) => {
    const isValid = await SecurityService.verifyPin(candidate, storedPinHash);
    if (isValid) {
      sound.playSuccess();
      onUnlock();
    } else if (candidate.length >= 6) {
      // Failed after full length
      triggerError();
    }
  };

  const triggerError = () => {
    setErrorShake(true);
    setErrorMessage('Incorrect PIN. Please try again.');
    setTimeout(() => {
      setPin('');
      setErrorShake(false);
    }, 600);
  };

  const handleBiometricAuth = async () => {
    const success = await SecurityService.authenticateBiometrics();
    if (success) {
      sound.playSuccess();
      onUnlock();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8FC] dark:bg-[#0B0F19] flex flex-col items-center justify-between p-6 select-none animate-fade-in">
      {/* Top Branding & Lock Icon */}
      <div className="flex flex-col items-center pt-8 sm:pt-12 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#241930] dark:bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-xl shadow-purple-900/20 mb-4 animate-bounce">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#241930] dark:text-slate-100">
          budgetfy is Locked
        </h1>
        <p className="text-xs text-[#7F7094] dark:text-slate-400 mt-1">
          Enter your security PIN to unlock your budget
        </p>

        {/* PIN Dots Indicator */}
        <div className={`flex items-center gap-3.5 my-6 ${errorShake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map(i => {
            const isFilled = i < pin.length;
            return (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#241930] dark:bg-indigo-400 scale-110 shadow-xs'
                    : 'bg-[#DDD5E6] dark:bg-[#1E293B] border border-[#C5B7D4] dark:border-[#2F3D55]'
                }`}
              />
            );
          })}
        </div>

        {errorMessage && (
          <span className="text-xs font-bold text-rose-500 animate-fade-in block">
            {errorMessage}
          </span>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="h-16 rounded-2xl bg-white dark:bg-[#161F30] border border-[#E3DCED] dark:border-[#223049] text-2xl font-mono font-bold text-[#241930] dark:text-slate-100 shadow-xs hover:bg-[#FAF8FC] dark:hover:bg-[#1E293B] active:scale-95 transition-all flex items-center justify-center"
            >
              {num}
            </button>
          ))}

          {/* Biometrics button */}
          <button
            type="button"
            onClick={biometricAvailable ? handleBiometricAuth : undefined}
            disabled={!biometricAvailable}
            className={`h-16 rounded-2xl border flex items-center justify-center transition-all ${
              biometricAvailable
                ? 'bg-purple-100/70 dark:bg-indigo-950/60 border-purple-300 dark:border-indigo-800 text-purple-700 dark:text-indigo-300 active:scale-95'
                : 'border-transparent text-transparent pointer-events-none'
            }`}
            title="Biometric Unlock"
          >
            <Fingerprint className="w-7 h-7" />
          </button>

          {/* 0 button */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-16 rounded-2xl bg-white dark:bg-[#161F30] border border-[#E3DCED] dark:border-[#223049] text-2xl font-mono font-bold text-[#241930] dark:text-slate-100 shadow-xs hover:bg-[#FAF8FC] dark:hover:bg-[#1E293B] active:scale-95 transition-all flex items-center justify-center"
          >
            0
          </button>

          {/* Backspace button */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-white dark:bg-[#161F30] border border-[#E3DCED] dark:border-[#223049] text-[#75668B] dark:text-slate-400 shadow-xs hover:text-[#241930] active:scale-95 transition-all flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Emergency / Forgot PIN reset */}
        {onForgotPin && (
          <div className="pt-4 text-center">
            <button
              onClick={onForgotPin}
              className="text-xs font-semibold text-[#8C7D9E] dark:text-slate-400 hover:text-rose-600 underline transition-colors"
            >
              Forgot PIN?
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

