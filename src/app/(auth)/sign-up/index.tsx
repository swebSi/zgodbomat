import { useSignUp } from '@clerk/clerk-expo';
import { ScreenContent } from '@shared/components/ScreenContent/ui/ScreenContent';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Text } from '@shared/components/ui/text';
import { Link, router } from 'expo-router';
import * as React from 'react';
import type { TextInput } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function SignUp() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const passwordInputRef = React.useRef<TextInput>(null);
  const [error, setError] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  async function onSubmit() {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      router.push(`/(auth)/sign-up/verify-email?email=${email}`);
    } catch (err) {
      // See https://go.clerk.com/mRUDrIe for more info on error handling
      if (err instanceof Error) {
        const isEmailMessage =
          err.message.toLowerCase().includes('identifier') ||
          err.message.toLowerCase().includes('email');
        setError(isEmailMessage ? { email: err.message } : { password: err.message });
        return;
      }
      console.error(JSON.stringify(err, null, 2));
    }
  }

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
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
                Create your account
              </Text>
              <Text variant="muted" className="text-center">
                Welcome! Please fill in the details to get started.
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
                  placeholder="m@example.com"
                  keyboardType="email-address"
                  autoComplete="email"
                  autoCapitalize="none"
                  onChangeText={setEmail}
                  onSubmitEditing={onEmailSubmitEditing}
                  returnKeyType="next"
                  className="h-12"
                />
                {error.email ? (
                  <Text variant="small" className="text-destructive">
                    {error.email}
                  </Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View className="gap-2">
                <Label htmlFor="password" nativeID="password">
                  Password
                </Label>
                <Input
                  ref={passwordInputRef}
                  id="password"
                  nativeID="password"
                  placeholder="Enter your password"
                  secureTextEntry
                  onChangeText={setPassword}
                  returnKeyType="send"
                  onSubmitEditing={onSubmit}
                  className="h-12"
                />
                {error.password ? (
                  <Text variant="small" className="text-destructive">
                    {error.password}
                  </Text>
                ) : null}
              </View>

              {/* Submit Button */}
              <Button className="w-full" onPress={onSubmit} disabled={!isLoaded} size="lg">
                <Text>Continue</Text>
              </Button>

              {/* Sign In Link */}
              <View className="flex-row items-center justify-center gap-2 pt-4">
                <Text variant="muted">Already have an account?</Text>
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
