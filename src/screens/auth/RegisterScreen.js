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
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerUser } = useAuth();
  const { colors } = useTheme();

  const handleRegister = async () => {
    if (!name.trim() || !nickname.trim() || !email.trim() || !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    const result = await registerUser({
      name: name.trim(),
      nickname: nickname.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (result.success) {
      Alert.alert('Conta criada!', 'Bem-vindo ao Conexão Estoque.');
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Falha no Cadastro', result.error || 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <LogoBox size="large" />
          <Text style={[styles.title, { color: colors.text }]}>Criar Nova Conta</Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Preencha seus dados para acessar ou gerenciar lojas
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.subText }]}>Nome Completo</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex: João da Silva"
            placeholderTextColor={colors.subText}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />

          <Text style={[styles.label, { color: colors.subText }]}>Nickname / Identificador</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            placeholder="Ex: joao.vendas"
            placeholderTextColor={colors.subText}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="none"
            editable={!loading}
          />

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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primaryText} size="small" />
                <Text style={[styles.primaryButtonText, { color: colors.primaryText, marginLeft: 8 }]}>
                  Conectando ao servidor...
                </Text>
              </View>
            ) : (
              <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Finalizar Cadastro</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={[styles.switchButtonText, { color: colors.subText }]}>
              Já tem uma conta? <Text style={{ color: colors.primary, fontWeight: '700' }}>Fazer Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  topSection: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 12 },
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