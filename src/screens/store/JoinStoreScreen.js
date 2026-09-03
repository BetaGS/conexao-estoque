import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function JoinStoreScreen({ navigation }) {
  const [storeCode, setStoreCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('Vendedor'); // Vendedor ou Estoquista
  const { requestJoinStore } = useStore();
  const { user } = useAuth();
  const { colors } = useTheme();

  const handleJoin = () => {
    if (!storeCode.trim()) {
      Alert.alert('Atenção', 'Informe o código da loja fornecido pelo seu gerente.');
      return;
    }

    requestJoinStore(storeCode, user, selectedRole);
    Alert.alert(
      'Solicitação Enviada! ⏳',
      `Seu pedido para entrar como ${selectedRole} foi enviado ao Gerente. Assim que ele autorizar, seu acesso será liberado automaticamente.`
    );
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        <LogoBox size="large" />
        <Text style={[styles.title, { color: colors.text }]}>Entrar na Loja</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Insira o código fornecido pelo gerente e selecione a sua função na equipe.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.subText }]}>Código da Loja *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Ex: LOJA-6936"
          placeholderTextColor={colors.subText}
          value={storeCode}
          onChangeText={setStoreCode}
          autoCapitalize="characters"
        />

        <Text style={[styles.label, { color: colors.subText }]}>Sua Função na Loja *</Text>
        <View style={styles.rolePicker}>
          {['Vendedor', 'Estoquista'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleOption,
                { backgroundColor: colors.chip, borderColor: colors.border },
                selectedRole === role && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.roleText,
                  { color: colors.text },
                  selectedRole === role && { color: colors.primaryText, fontWeight: '700' },
                ]}
              >
                {role === 'Vendedor' ? '🛍️ Vendedor' : '📦 Estoquista'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleJoin}>
          <Text style={[styles.buttonText, { color: colors.primaryText }]}>Solicitar Acesso</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 14 },
  subtitle: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  card: { padding: 22, borderRadius: 24, borderWidth: 1, elevation: 3 },
  label: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, textAlign: 'center', fontWeight: '700', letterSpacing: 1 },
  rolePicker: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleOption: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  roleText: { fontSize: 13, fontWeight: '600' },
  button: { padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { fontWeight: '700', fontSize: 15 },
});