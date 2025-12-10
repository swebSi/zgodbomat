import { useSignIn } from '@clerk/clerk-expo';
import { ScreenContent } from '@shared/components/ScreenContent/ui/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import type { TextStyle } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

const RESEND_CODE_INTERVAL_SECONDS = 30;

const TABULAR_NUMBERS_STYLE: TextStyle = { fontVariant: ['tabular-nums'] };

function useCountdown(seconds = 30) {
  const [countdown, setCountdown] = React.useState(seconds);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = React.useCallback(() => {
    setCountdown(seconds);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [seconds]);

  React.useEffect(() => {
    startCountdown();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startCountdown]);

  return { countdown, restartCountdown: startCountdown };
}

export default function VerifySecondFactor() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { countdown, restartCountdown } = useCountdown(RESEND_CODE_INTERVAL_SECONDS);

  async function onSubmit() {
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      // Use the code the user provided to attempt second factor verification
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code,
      });

      // If verification was completed, set the session to active
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }

      // Handle other statuses
      console.error(JSON.stringify(signInAttempt, null, 2));
      setError('Verification incomplete. Please try again.');
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        console.error(JSON.stringify(err, null, 2));
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function onResendCode() {
    if (!isLoaded) return;

    try {
      await signIn.prepareSecondFactor({ strategy: 'email_code' });
      restartCountdown();
      setError('');
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        setError(err.message);
      } else {
        console.error(JSON.stringify(err, null, 2));
      }
    }
  }

  return (
    <ScreenContent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled">
          <View className="mx-auto w-full max-w-md gap-8">
            {/* Header */}
            <View className="gap-2">
              <Text variant="h1" className="text-center">
                Verify your identity
              </Text>
              <Text variant="muted" className="text-center">
                Enter the verification code sent to {email || 'your email'}
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Code Input */}
              <View className="gap-2">
                <Label htmlFor="code" nativeID="code">
                  Verification code
                </Label>
                <Input
                  id="code"
                  nativeID="code"
                  placeholder="Enter verification code"
                  autoCapitalize="none"
                  onChangeText={(text) => {
                    setCode(text);
                    setError('');
                  }}
                  value={code}
                  returnKeyType="send"
                  keyboardType="numeric"
                  autoComplete="sms-otp"
                  textContentType="oneTimeCode"
                  onSubmitEditing={onSubmit}
                  className="h-12"
                />
                {error ? (
                  <Text variant="small" className="text-destructive">
                    {error}
                  </Text>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={countdown > 0 || !isLoaded}
                  onPress={onResendCode}
                  className="h-auto self-start p-0">
                  <Text variant="small" className="text-primary">
                    Didn&apos;t receive the code? Resend{' '}
                    {countdown > 0 ? (
                      <Text variant="small" style={TABULAR_NUMBERS_STYLE}>
                        ({countdown})
                      </Text>
                    ) : null}
                  </Text>
                </Button>
              </View>

              {/* Submit Button */}
              <Button
                className="w-full"
                onPress={onSubmit}
                disabled={!isLoaded || isLoading}
                size="lg">
                <Text>{isLoading ? 'Verifying...' : 'Continue'}</Text>
              </Button>

              {/* Cancel Button */}
              <Button variant="ghost" className="mx-auto" onPress={router.back}>
                <Text variant="small" className="text-muted-foreground">
                  Cancel
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContent>
  );
}
