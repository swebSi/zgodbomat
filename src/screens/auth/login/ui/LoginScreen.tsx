import { useSignIn } from '@clerk/clerk-expo';
import { ScreenContent } from '@shared/components/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async () => {
    if (!isLoaded) {
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError({ email: '', password: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setError({});

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        setError({ email: '', password: '' });
        await setActive({ session: signInAttempt.createdSessionId });
        return;
      }

      if (signInAttempt.status === 'needs_second_factor') {
        // Prepare second factor verification (send email code)
        await signIn.prepareSecondFactor({
          strategy: 'email_code',
        });
        // Navigate to second factor verification screen
        router.push(`/(auth)/verify-second-factor?email=${encodeURIComponent(email)}`);
        return;
      }

      // Handle other statuses
      console.error(JSON.stringify(signInAttempt, null, 2));
      setError({ password: 'Sign in incomplete. Please try again.' });
    } catch (err) {
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
        setError(
          isEmailMessage
            ? { email: err.message, password: '' }
            : { email: '', password: err.message }
        );
      } else {
        setError({ password: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailSubmitEditing = () => {
    passwordInputRef.current?.focus();
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
                Welcome back
              </Text>
              <Text variant="muted" className="text-center">
                Sign in to continue to your account
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              {/* Email Input */}
              <View className="gap-2">
                <Label htmlFor="email" nativeID="email">
                  Email
                </Label>
                <Input
                  id="email"
                  nativeID="email"
                  placeholder="Enter your email"
                  onChangeText={(text) => {
                    setEmail(text);
                    setError({});
                  }}
                  value={email}
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  onSubmitEditing={onEmailSubmitEditing}
                  returnKeyType="next"
                  className="h-12"
                />
                {error.email && (
                  <Text variant="small" className="text-destructive">
                    {error.email}
                  </Text>
                )}
              </View>

              {/* Password Input */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Label htmlFor="password" nativeID="password">
                    Password
                  </Label>
                  <Link href="/(auth)/forgot-password" asChild>
                    <Button variant="ghost" className="h-auto p-0">
                      <Text variant="small" className="text-primary">
                        Forgot password?
                      </Text>
                    </Button>
                  </Link>
                </View>
                <Input
                  ref={passwordInputRef}
                  id="password"
                  nativeID="password"
                  placeholder="Enter your password"
                  onChangeText={(text) => {
                    setPassword(text);
                    setError({});
                  }}
                  value={password}
                  secureTextEntry
                  autoComplete="password"
                  onSubmitEditing={handleSubmit}
                  returnKeyType="send"
                  className="h-12"
                />
                {error.password && (
                  <Text variant="small" className="text-destructive">
                    {error.password}
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
                <Text>{isLoading ? 'Please wait...' : 'Sign in'}</Text>
              </Button>

              {/* Sign Up Link */}
              <View className="flex-row items-center justify-center gap-2 pt-4">
                <Text variant="muted">Don't have an account?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Button variant="ghost" className="h-auto p-0">
                    <Text variant="small" className="text-primary font-medium">
                      Sign up
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
