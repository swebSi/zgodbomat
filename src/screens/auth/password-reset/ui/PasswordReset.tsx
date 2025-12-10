import { useSignIn } from '@clerk/clerk-expo';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function PasswordReset() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const codeInputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; password?: string }>({});

  const handleReset = async () => {
    if (!isLoaded) {
      return;
    }

    if (!code.trim() || !password.trim()) {
      setError({ code: '', password: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setError({});

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
        return;
      }
      setError({ password: 'Reset incomplete. Please try again.' });
    } catch (err) {
      if (err instanceof Error) {
        const isPasswordMessage = err.message.toLowerCase().includes('password');
        setError(
          isPasswordMessage
            ? { code: '', password: err.message }
            : { code: err.message, password: '' }
        );
      } else {
        setError({ password: 'Failed to reset password. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmitEditing = () => {
    codeInputRef.current?.focus();
  };

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
                Reset Password
              </Text>
              <Text variant="muted" className="text-center">
                Enter the code sent to your email and set a new password
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Password Input */}
              <View className="gap-2">
                <Label htmlFor="reset-password" nativeID="reset-password">
                  New Password
                </Label>
                <Input
                  id="reset-password"
                  nativeID="reset-password"
                  placeholder="Enter new password"
                  onChangeText={(text) => {
                    setPassword(text);
                    setError({});
                  }}
                  value={password}
                  secureTextEntry
                  autoComplete="new-password"
                  onSubmitEditing={onPasswordSubmitEditing}
                  returnKeyType="next"
                  className="h-12"
                />
                {error.password && (
                  <Text variant="small" className="text-destructive">
                    {error.password}
                  </Text>
                )}
              </View>

              {/* Code Input */}
              <View className="gap-2">
                <Label htmlFor="reset-code" nativeID="reset-code">
                  Verification Code
                </Label>
                <Input
                  ref={codeInputRef}
                  id="reset-code"
                  nativeID="reset-code"
                  placeholder="Enter verification code"
                  onChangeText={(text) => {
                    setCode(text);
                    setError({});
                  }}
                  value={code}
                  inputMode="numeric"
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  autoComplete="sms-otp"
                  textContentType="oneTimeCode"
                  onSubmitEditing={handleReset}
                  returnKeyType="send"
                  className="h-12"
                />
                {error.code && (
                  <Text variant="small" className="text-destructive">
                    {error.code}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <Button
                variant="default"
                onPress={handleReset}
                disabled={isLoading || !isLoaded}
                className="mt-6 h-12"
                size="lg">
                <Text>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
              </Button>

              {/* Back to Login */}
              <View className="border-border flex-row items-center justify-center gap-2 border-t pt-4">
                <Text variant="muted">Remember your password?</Text>
                <Link href="/(auth)/login" asChild>
                  <Button variant="ghost" className="h-auto p-0">
                    <Text variant="small" className="text-primary font-medium">
                      Sign in
                    </Text>
                  </Button>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContent>
  );
}
