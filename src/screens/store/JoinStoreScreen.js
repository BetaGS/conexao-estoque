import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import LogoBox from '../../components/LogoBox';

export default function JoinStoreScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [selectedRole, setSelectedRole] = useState('Vendedor');
  const [loading, setLoading] = useState(false);
  const [myStores, setMyStores] = useState([]);
  const [loadingMyStores, setLoadingMyStores] = useState(true);

  const { logout } = useAuth();
  const { requestJoinStore, selectExistingStore, resetStoreState } = useStore();
  const { colors } = useTheme();

  // Busca lojas que pertencem a esta conta
  useEffect(() => {
    let isMounted = true;
    async function loadUserStores() {
      try {
        const response = await api.get('/stores/my-stores');
        if (isMounted) {
          setMyStores(response.data || []);
        }
      } catch (err) {
        console.log('Nenhuma loja prévia encontrada ou erro:', err.message);
      } finally {
        if (isMounted) setLoadingMyStores(false);
      }
    }
    loadUserStores();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoin = async () => {
    if (!code.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, insira o código da loja.');
      return;
    }

    setLoading(true);
    const result = await requestJoinStore(code.trim().toUpperCase(), selectedRole);
    setLoading(false);

    if (result.success) {
      Alert.alert('Solicitação Enviada', result.message || 'Aguarde aprovação do gerente da loja.');
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível solicitar acesso.');
    }
  };

  const handleSelectMyStore = async (storeToOpen) => {
    setLoading(true);
    const result = await selectExistingStore(storeToOpen);
    setLoading(false);

    if (result.success) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else {
      Alert.alert('Erro', result.error || 'Não foi possível acessar a loja.');
    }
  };

  const handleBackToLogin = () => {
    Alert.alert('Voltar ao Login', 'Deseja desconectar e voltar à tela inicial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sim, Sair',
        style: 'destructive',
        onPress: () => {
          resetStoreState();
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topSection}>
        <LogoBox size="large" />
        <Text style={[styles.title, { color: colors.text }]}>Acessar Loja</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Entre na sua loja ou solicite entrada em uma equipe existente.
        </Text>
      </View>

      {/* Seção: Lojas já criadas pelo usuário */}
      {loadingMyStores ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginBottom: 16 }} />
      ) : myStores.length > 0 ? (
        <View style={[styles.myStoresCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
          <Text style={[styles.myStoresBadge, { color: colors.primary }]}>MINHAS LOJAS CRIADAS</Text>
          {myStores.map((item) => (
            <View key={item.id} style={[styles.storeItemRow, { borderBottomColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.storeItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.storeItemCode, { color: colors.subText }]}>
                  Cód: {item.code || item.id} • (Gerente)
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.enterMyStoreBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleSelectMyStore(item)}
                disabled={loading}
              >
                <Text style={[styles.enterMyStoreBtnText, { color: colors.primaryText }]}>Entrar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      {/* Card de Solicitar Acesso por Código */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.subText }]}>ENTRAR COM CÓDIGO *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Ex: LOJA-6936"
          placeholderTextColor={colors.subText}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          editable={!loading}
        />

        <Text style={[styles.label, { color: colors.subText, marginTop: 14 }]}>SUA FUNÇÃO NA LOJA *</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'Vendedor'
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
            onPress={() => setSelectedRole('Vendedor')}
          >
            <Text
              style={[
                styles.roleBtnText,
                { color: selectedRole === 'Vendedor' ? colors.primaryText : colors.text },
              ]}
            >
              🛍️ Vendedor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleBtn,
              selectedRole === 'Estoquista'
                ? { backgroundColor: colors.primary, borderColor: colors.primary }
                : { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
            onPress={() => setSelectedRole('Estoquista')}
          >
            <Text
              style={[
                styles.roleBtnText,
                { color: selectedRole === 'Estoquista' ? colors.primaryText : colors.text },
              ]}
            >
              📦 Estoquista
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} size="small" />
          ) : (
            <Text style={[styles.primaryButtonText, { color: colors.primaryText }]}>Solicitar Acesso</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity
          style={[styles.createStoreBtn, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateStore')}
          disabled={loading}
        >
          <Text style={[styles.createStoreBtnText, { color: colors.primary }]}>
            ➕ Quero Criar uma Nova Loja
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backLoginBtn} onPress={handleBackToLogin} disabled={loading}>
        <Text style={[styles.backLoginText, { color: colors.subText }]}>
          ← Sair / Voltar para o Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  topSection: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 14 },
  subtitle: { fontSize: 13, marginTop: 6, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
  myStoresCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    elevation: 2,
  },
  myStoresBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  storeItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  storeItemName: { fontSize: 16, fontWeight: '700' },
  storeItemCode: { fontSize: 12, marginTop: 2 },
  enterMyStoreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  enterMyStoreBtnText: { fontWeight: '700', fontSize: 13 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, elevation: 3 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16, textAlign: 'center', fontWeight: '600' },
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  roleBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  roleBtnText: { fontWeight: '700', fontSize: 14 },
  primaryButton: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  primaryButtonText: { fontWeight: '700', fontSize: 15 },
  divider: { height: 1, marginVertical: 18 },
  createStoreBtn: { padding: 14, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', borderStyle: 'dashed' },
  createStoreBtnText: { fontWeight: '700', fontSize: 14 },
  backLoginBtn: { marginTop: 22, alignItems: 'center', paddingVertical: 10 },
  backLoginText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});