import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const { setInitialStoreData } = useStore();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Informe e-mail e senha para acessar.');
      return;
    }

    setLoading(true);
    const result = await loginUser(
      {
        email: email.trim().toLowerCase(),
        password,
      },
      (storeData) => {
        setInitialStoreData(storeData);
      }
    );
    setLoading(false);

    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      Alert.alert('Falha no Login', result.error || 'E-mail ou senha incorretos.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.topSection}>
          <LogoBox size="large" />
          <Text style={[styles.title, { color: colors.text }]}>Conexão Estoque</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Acesse para acompanhar ou separar seus pedidos
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.subText }]}>E-mail</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="seuemail@loja.com"
            placeholderTextColor={colors.subText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={[styles.label, { color: colors.subText }]}>Senha</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="••••••••"
            placeholderTextColor={colors.subText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primaryText} size="small" />
                <Text style={[styles.primaryButtonText, { color: colors.primaryText, marginLeft: 8 }]}>
                  Entrando...
                </Text>
              </View>
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={[styles.switchButtonText, { color: colors.subText }]}>
              Não tem conta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { padding: 24 },
  topSection: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', marginTop: 12 },
  subtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, elevation: 3 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 15 },
  primaryButton: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { fontWeight: '700', fontSize: 15 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  switchButton: { marginTop: 16, alignItems: 'center' },
  switchButtonText: { fontSize: 13 },
});