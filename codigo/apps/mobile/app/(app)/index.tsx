import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuthStore } from '@/store/auth.store'
import { Colors } from '@/constants/colors'

export default function HomeScreen() {
  const { usuario, clearAuth } = useAuthStore()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Olá, {usuario?.nome?.split(' ')[0]}</Text>
        <Text style={styles.perfil}>{usuario?.perfil}</Text>
        <Text style={styles.placeholder}>Obras em breve...</Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={clearAuth} accessibilityLabel="Sair">
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  perfil: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  placeholder: {
    marginTop: 24,
    fontSize: 14,
    color: Colors.textDisabled,
  },
  logoutBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
})
