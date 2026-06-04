import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'
import { Colors } from '@/constants/colors'
import type { AuthResponse } from '@brain-master/shared/tipos'

type LoginMode = 'email' | 'token'

export default function LoginScreen() {
  const { setAuth } = useAuthStore()

  const [mode, setMode] = useState<LoginMode>('email')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (loading) return
    setLoading(true)

    try {
      let response: AuthResponse

      if (mode === 'email') {
        if (!email.trim() || !senha.trim()) {
          Alert.alert('Atenção', 'Preencha email e senha.')
          return
        }
        const { data } = await api.post<AuthResponse>('/auth/login', { email: email.trim().toLowerCase(), senha })
        response = data
      } else {
        const tokenFormatado = token.trim().toUpperCase()
        if (!tokenFormatado) {
          Alert.alert('Atenção', 'Informe seu token de acesso.')
          return
        }
        const { data } = await api.post<AuthResponse>('/auth/token-login', { token: tokenFormatado })
        response = data
      }

      setAuth(response.access_token, response.usuario)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.'
      Alert.alert('Erro', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>Brain Master</Text>
          <Text style={styles.subtitle}>Gestão de Obras</Text>
        </View>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'email' && styles.toggleBtnActive]}
            onPress={() => setMode('email')}
            accessibilityLabel="Login com email"
          >
            <Text style={[styles.toggleText, mode === 'email' && styles.toggleTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'token' && styles.toggleBtnActive]}
            onPress={() => setMode('token')}
            accessibilityLabel="Login com token"
          >
            <Text style={[styles.toggleText, mode === 'token' && styles.toggleTextActive]}>
              Token
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'email' ? (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={Colors.textDisabled}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="••••••••"
                placeholderTextColor={Colors.textDisabled}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Token de acesso</Text>
              <TextInput
                style={[styles.input, styles.inputToken]}
                value={token}
                onChangeText={setToken}
                placeholder="FUN-XXXXX ou ENG-XXXXX"
                placeholderTextColor={Colors.textDisabled}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={9}
              />
              <Text style={styles.tokenHint}>
                Peça o token ao responsável pela obra
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel="Entrar"
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: 28,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  form: {
    gap: 16,
    marginBottom: 28,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  inputToken: {
    letterSpacing: 2,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  tokenHint: {
    fontSize: 12,
    color: Colors.textDisabled,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
})
