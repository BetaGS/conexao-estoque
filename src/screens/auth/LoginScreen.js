import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser } = useAuth();
  const { colors } = useTheme();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Informe e-mail e senha para entrar.');
      return;
    }
    loginUser({ email, password });
    navigation.replace('MainTabs');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        <LogoBox size="large" />
        <Text style={[styles.brandTitle, { color: colors.text }]}>Conexão Estoque</Text>
        <Text style={[styles.brandSubtitle, { color: colors.subText }]}>Gerenciamento ágil de produtos e equipes</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Acessar Conta</Text>

        <Text style={[styles.label, { color: colors.subText }]}>E-mail</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="seuemail@loja.com"
          placeholderTextColor={colors.subText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.subText }]}>Senha</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="••••••••"
          placeholderTextColor={colors.subText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogin}>
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>Entrar no Sistema</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.switchRow}>
        <Text style={{ color: colors.subText }}>Ainda não tem conta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 28 },
  brandTitle: { fontSize: 26, fontWeight: '800', marginTop: 14 },
  brandSubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 15 },
  button: { padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { fontWeight: '700', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  linkText: { fontWeight: '700' },
});