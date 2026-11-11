import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { login } = useAuth();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.backButton}>‹</Text>

          <Text style={styles.logoText}>⌛ TempBox</Text>

          <Text style={styles.loginText}>Login  ◯</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>⌛</Text>
        </View>

        {/* Student Badge */}
        <View style={styles.studentBadge}>
          <Text style={styles.studentBadgeText}>
            🎓  Free for Students & Educators
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Welcome back to TempBox
        </Text>

        <Text style={styles.subtitle}>
          Smart, lifespan-driven storage for clutter-free college life.
        </Text>

        {/* University Login */}
        <Pressable style={styles.universityButton}>
          <View>
            <Text style={styles.universityTitle}>
              🏛  Continue with University
            </Text>

            <Text style={styles.universitySubtitle}>
              Instant verified 10 GB quota (.edu)
            </Text>
          </View>

          <Text style={styles.arrow}>→</Text>
        </Pressable>

        {/* Google and Apple */}
        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialText}>🇬  Google</Text>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <Text style={styles.socialText}>  Apple</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>
            or sign in with email
          </Text>
          <View style={styles.divider} />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Campus or Personal Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="alex@stanford.edu or name@mail.com"
            placeholderTextColor="#777587"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Password
          </Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your security pass"
              placeholderTextColor="#777587"
              secureTextEntry={!passwordVisible}
            />

            <Pressable
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Text style={styles.eye}>
                {passwordVisible ? '🙈' : '👁'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Remember Me */}
        <View style={styles.optionsRow}>
          <Text style={styles.rememberText}>
            □  Remember me
          </Text>

          <Text style={styles.forgotText}>
            Forgot password?
          </Text>
        </View>

        {/* Login Button */}
        <Pressable
          style={styles.loginButton}
          onPress={() => {
            login();
            router.replace('/');
          }}
        >
          <Text style={styles.loginButtonText}>
            Log In to TempBox  →
          </Text>
        </Pressable>

        {/* Privacy Guarantee */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>
            🛡  Privacy Guarantee
          </Text>

          <Text style={styles.privacyText}>
            TempBox automatically purges cached lecture slides,
            lab scripts, and shared campus files according to
            their self-destruct timers.
          </Text>
        </View>

        {/* Extra Buttons */}
        <View style={styles.extraRow}>
          <Pressable style={styles.extraButton}>
            <Text>🏫 Campus SSO Help</Text>
          </Pressable>

          <Pressable style={styles.extraButton}>
            <Text>📡 Use Offline Mode</Text>
          </Pressable>
        </View>

        {/* Sign Up */}
        <Text style={styles.signup}>
          Don't have an account?{' '}
          <Text style={styles.signupLink}>
            Sign up free
          </Text>
        </Text>

        <Text style={styles.footer}>
          Zero-knowledge encryption • ISO 27001 compliant transient storage
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },

  backButton: {
    fontSize: 36,
    color: '#131b2e',
  },

  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131b2e',
  },

  loginText: {
    fontSize: 14,
    color: '#131b2e',
  },

  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: '#4f46e5',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  logoIcon: {
    fontSize: 45,
  },

  studentBadge: {
    alignSelf: 'center',
    backgroundColor: '#e2dfff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 15,
  },

  studentBadgeText: {
    color: '#0f0069',
    fontWeight: '600',
  },

  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#131b2e',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#464555',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 25,
  },

  universityButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  universityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  universitySubtitle: {
    color: '#dad7ff',
    fontSize: 11,
    marginTop: 3,
  },

  arrow: {
    color: 'white',
    fontSize: 25,
  },

  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  socialButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },

  socialText: {
    fontSize: 15,
    fontWeight: '600',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#dae2fd',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#464555',
    fontSize: 12,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#f2f3ff',
    borderRadius: 14,
    padding: 15,
    fontSize: 14,
    color: '#131b2e',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3ff',
    borderRadius: 14,
    paddingLeft: 15,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: '#131b2e',
  },

  eye: {
    fontSize: 18,
    paddingHorizontal: 15,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  rememberText: {
    color: '#464555',
  },

  forgotText: {
    color: '#3525cd',
    fontWeight: '600',
  },

  loginButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 30,
    padding: 17,
    alignItems: 'center',
  },

  loginButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },

  privacyCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
  },

  privacyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 7,
  },

  privacyText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#464555',
  },

  extraRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  extraButton: {
    flex: 1,
    backgroundColor: '#f2f3ff',
    borderRadius: 14,
    padding: 13,
    alignItems: 'center',
  },

  signup: {
    textAlign: 'center',
    marginTop: 30,
    color: '#464555',
  },

  signupLink: {
    color: '#3525cd',
    fontWeight: '700',
  },

  footer: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777587',
    fontSize: 10,
  },
});