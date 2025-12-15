import { useSignIn } from '@clerk/clerk-expo';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import { t } from '@lingui/core/macro';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function ForgotPassword() {
  const { email: emailParam = '' } = useLocalSearchParams<{ email?: string }>();
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState(emailParam);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(t`Email is required`);
      return;
    }

    if (!isLoaded) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setSuccess(true);
      router.push(`/(auth)/password-reset?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t`Failed to send reset code. Please try again.`);
      }
    } finally {
      setIsLoading(false);
    }
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
                {t`Forgot Password?`}
              </Text>
              <Text variant="muted" className="text-center">
                {t`Enter your email to reset your password`}
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Email Input */}
              <View className="gap-2">
                <Label htmlFor="email" nativeID="email">
                  {t`Email`}
                </Label>
                <Input
                  id="email"
                  nativeID="email"
                  placeholder={t`Enter your email`}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  value={email}
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onSubmitEditing={handleSubmit}
                  returnKeyType="send"
                  className="h-12"
                />
                {error && (
                  <Text variant="small" className="text-destructive">
                    {error}
                  </Text>
                )}
                {success && (
                  <Text variant="small" className="text-green-600 dark:text-green-400">
                    {t`Reset code sent! Check your email.`}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <Button
                variant="default"
                onPress={handleSubmit}
                disabled={isLoading || !isLoaded}
                className="mt-6 h-12"
                size="lg">
                <Text>{isLoading ? t`Sending...` : t`Reset Password`}</Text>
              </Button>

              {/* Back to Login */}
              <View className="border-border flex-row items-center justify-center gap-2 border-t pt-4">
                <Text variant="muted">{t`Remember your password?`}</Text>
                <Button variant="ghost" onPress={() => router.back()} className="h-auto p-0">
                    <Text variant="small" className="text-primary font-medium">
                      {t`Sign in`}
                    </Text>
                </Button>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContent>
  );
}
