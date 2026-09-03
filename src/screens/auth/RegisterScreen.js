import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { registerUser } = useAuth();
  const { colors } = useTheme();

  const handleNicknameChange = (text) => {
    const formatted = text.toLowerCase().replace(/\s+/g, '');
    setNickname(formatted);
  };

  const handleRegister = () => {
    if (!name.trim() || !nickname.trim() || !email.trim() || !password) {
      Alert.alert('Campos Obrigatórios', 'Por favor preencha todos os campos para continuar.');
      return;
    }

    if (nickname.length < 3) {
      Alert.alert('Nickname Inválido', 'O nickname precisa ter no mínimo 3 caracteres.');
      return;
    }

    registerUser({ name, nickname, email, password });
    // Agora vai direto para o painel do app
    navigation.replace('MainTabs');
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        <LogoBox size="large" />
        <Text style={[styles.brandTitle, { color: colors.text }]}>Criar Conta</Text>
        <Text style={[styles.brandSubtitle, { color: colors.subText }]}>Cadastre seu perfil de acesso</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.subText }]}>Nome Completo *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Ex: Ana Clara"
          placeholderTextColor={colors.subText}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: colors.subText }]}>Nickname / Usuário *</Text>
        <View style={[styles.nicknameInputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Text style={[styles.atSymbol, { color: colors.subText }]}>@</Text>
          <TextInput
            style={[styles.nicknameInput, { color: colors.text }]}
            placeholder="anaclara"
            placeholderTextColor={colors.subText}
            value={nickname}
            onChangeText={handleNicknameChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={[styles.label, { color: colors.subText }]}>E-mail *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="exemplo@loja.com"
          placeholderTextColor={colors.subText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.subText }]}>Senha *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="••••••••"
          placeholderTextColor={colors.subText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleRegister}>
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>Criar Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.switchRow}>
        <Text style={{ color: colors.subText }}>Já possui cadastro? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.linkText, { color: colors.primary }]}>Fazer Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 24 },
  brandTitle: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  brandSubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  card: { padding: 22, borderRadius: 24, borderWidth: 1, elevation: 3 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, marginBottom: 14, fontSize: 15 },
  nicknameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    marginBottom: 14,
  },
  atSymbol: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  nicknameInput: { flex: 1, paddingVertical: 13, fontSize: 15 },
  button: { padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonText: { fontWeight: '700', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { fontWeight: '700' },
});