import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function PendingApprovalScreen({ navigation }) {
  const { store, userRoleInStore, cancelJoinRequest, fetchStoreData } = useStore();
  const { logout } = useAuth();
  const { colors, isDark } = useTheme();
  const [checking, setChecking] = useState(false);

  // Checa se o gerente já aprovou
  const handleCheckStatus = async () => {
    setChecking(true);
    if (store?.id) {
      await fetchStoreData(store.id);
    }
    setTimeout(() => {
      setChecking(false);
      Alert.alert('Status do Pedido', 'O gerente ainda não confirmou o seu acesso. Tente novamente em instantes.');
    }, 600);
  };

  // Cancela o pedido atual e volta para digitar outro código
  const handleTryAnotherStore = () => {
    Alert.alert(
      'Digitar Outro Código',
      'Deseja cancelar o pedido atual para tentar entrar em outra loja?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Trocar Código',
          onPress: () => {
            cancelJoinRequest();
            navigation.replace('JoinStore');
          },
        },
      ]
    );
  };

  // Cancela e vai criar uma loja própria
  const handleCreateOwnStore = () => {
    cancelJoinRequest();
    navigation.navigate('CreateStore');
  };

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Deseja desconectar e voltar ao login?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          cancelJoinRequest();
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <LogoBox size="large" />
        <Text style={[styles.title, { color: colors.text }]}>Solicitação em Análise ⏳</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Seu pedido para acessar a loja foi enviado. Aguarde o gerente autorizar sua entrada.
        </Text>
      </View>

      {/* Card da Loja Solicitada */}
      <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: '#F59E0B' }]}>
        <View style={styles.statusBadgeRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusBadgeText}>AGUARDANDO LIBERAÇÃO</Text>
        </View>

        <Text style={[styles.storeName, { color: colors.text }]}>
          {store?.name || 'Loja Informada'}
        </Text>
        <Text style={[styles.storeCode, { color: colors.subText }]}>
          Código: <Text style={{ fontWeight: '700', color: colors.primary }}>{store?.code || 'LOJA-XXXX'}</Text>
        </Text>
        <Text style={[styles.roleText, { color: colors.subText }]}>
          Função solicitada: <Text style={{ fontWeight: '700', color: colors.text }}>{userRoleInStore || 'Vendedor'}</Text>
        </Text>

        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.primary }]}
          onPress={handleCheckStatus}
          disabled={checking}
        >
          {checking ? (
            <ActivityIndicator color={colors.primaryText} size="small" />
          ) : (
            <Text style={[styles.refreshBtnText, { color: colors.primaryText }]}>
              🔄 Checar se já fui aprovado
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Opções Alternativas enquanto aguarda */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>ERROU O CÓDIGO OU QUER MUDAR?</Text>

        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.primary }]}
          onPress={handleTryAnotherStore}
        >
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
            🔍 Inserir Código de Outra Loja
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.border, marginTop: 10 }]}
          onPress={handleCreateOwnStore}
        >
          <Text style={[styles.outlineBtnText, { color: colors.text }]}>
            ➕ Criar Minha Própria Loja
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ações de Rodapé */}
      <TouchableOpacity style={styles.logoutFooterBtn} onPress={handleLogout}>
        <Text style={[styles.logoutFooterText, { color: colors.subText }]}>
          Sair da Conta / Voltar ao Login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 22,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  statusCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  storeCode: {
    fontSize: 13,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 13,
    marginBottom: 16,
  },
  refreshBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  refreshBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  outlineBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
  logoutFooterBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutFooterText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});