import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useStore } from '../../contexts/StoreContext';
import LogoBox from '../../components/LogoBox';

export default function ProfileScreen({ navigation }) {
  const { user, logout, deleteAccount } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const {
    store,
    userRoleInStore,
    membershipStatus,
    cancelJoinRequest,
    resetStoreState,
    fetchStoreData,
  } = useStore();

  const [isDeleting, setIsDeleting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const displayNickname = user?.nickname
    ? (user.nickname.startsWith('@') ? user.nickname : `@${user.nickname}`)
    : '@usuario';

  const isPending = membershipStatus === 'pending';

  // Verifica se o gerente já aprovou
  const handleCheckApproval = async () => {
    if (!store?.id) return;
    setCheckingStatus(true);
    await fetchStoreData(store.id);
    setTimeout(() => {
      setCheckingStatus(false);
      Alert.alert('Status da Solicitação', 'Seu pedido ainda está em análise pelo gerente.');
    }, 600);
  };

  // Cancela a solicitação pendente
  const handleCancelPending = () => {
    Alert.alert(
      'Cancelar Solicitação',
      `Deseja cancelar a solicitação para a loja "${store?.name || 'solicitada'}"?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => {
            cancelJoinRequest();
            Alert.alert('Sucesso', 'Solicitação cancelada.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Deseja realmente desconectar desta conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          resetStoreState();
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir Conta',
      'Essa ação é irreversível. Todos os seus dados, lojas vinculadas e permissões serão removidos permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Definitivamente',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const result = await deleteAccount();
            setIsDeleting(false);

            if (result.success) {
              resetStoreState();
              Alert.alert('Conta Excluída', 'Sua conta foi encerrada com sucesso.');
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } else {
              Alert.alert('Erro ao Excluir', result.error || 'Não foi possível excluir sua conta.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Topo do Usuário */}
      <View style={styles.avatarSection}>
        <LogoBox size="large" />
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Usuário'}</Text>
        <Text style={[styles.userRoleBadge, { backgroundColor: colors.chip || '#E5E7EB', color: colors.primary }]}>
          {isPending ? 'Solicitação Pendente ⏳' : (userRoleInStore || 'Sem Vínculo')}
        </Text>
      </View>

      {/* Card da Loja Pendente */}
      {isPending && (
        <View style={[styles.pendingCard, { borderColor: '#F59E0B', backgroundColor: isDark ? '#261C0D' : '#FFFBEB' }]}>
          <View style={styles.pendingHeader}>
            <View style={styles.pulseDot} />
            <Text style={styles.pendingBadgeText}>SOLICITAÇÃO EM ANÁLISE</Text>
          </View>

          <Text style={[styles.pendingStoreName, { color: colors.text }]}>
            {store?.name || 'Loja Selecionada'}
          </Text>
          <Text style={[styles.pendingInfoText, { color: colors.subText }]}>
            Função solicitada: <Text style={{ fontWeight: '700', color: colors.primary }}>{userRoleInStore || 'Vendedor'}</Text>
          </Text>
          <Text style={[styles.pendingInfoText, { color: colors.subText }]}>
            Código: <Text style={{ fontWeight: '600', color: colors.text }}>{store?.code || 'LOJA-XXXX'}</Text>
          </Text>

          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={[styles.checkBtn, { backgroundColor: colors.primary }]}
              onPress={handleCheckApproval}
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <ActivityIndicator color={colors.primaryText} size="small" />
              ) : (
                <Text style={[styles.checkBtnText, { color: colors.primaryText }]}>Verificar Aprovação</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelLinkBtn} onPress={handleCancelPending}>
              <Text style={styles.cancelLinkText}>Cancelar Solicitação</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Seção para Entrar em Outra Loja ou Criar Loja */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardHeader, { color: colors.subText }]}>Lojas e Equipes</Text>
        <Text style={[styles.helperDesc, { color: colors.subText }]}>
          Você pode tentar outro código ou abrir uma loja para gerenciar sua equipe:
        </Text>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('JoinStore')}
        >
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>
            🔍 Inserir Código de Outra Loja
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.border, marginTop: 10 }]}
          onPress={() => navigation.navigate('CreateStore')}
        >
          <Text style={[styles.actionBtnText, { color: colors.text }]}>
            ➕ Criar Minha Própria Loja
          </Text>
        </TouchableOpacity>
      </View>

      {/* Informações Cadastrais */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardHeader, { color: colors.subText }]}>Informações Cadastrais</Text>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.subText }]}>Nickname</Text>
          <Text style={[styles.infoValue, { color: colors.primary }]}>{displayNickname}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.subText }]}>E-mail</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || '—'}</Text>
        </View>
      </View>

      {/* Preferências / Tema */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardHeader, { color: colors.subText }]}>Preferências</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={[styles.switchTitle, { color: colors.text }]}>Modo Escuro</Text>
            <Text style={[styles.switchSubtitle, { color: colors.subText }]}>Altera o tema visual da interface</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? colors.primary : '#F4F3F4'}
            trackColor={{ false: '#767577', true: '#93C5FD' }}
          />
        </View>
      </View>

      {/* Ações da Conta */}
      <View style={styles.actionBlock}>
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.border }]}
          onPress={handleLogout}
          disabled={isDeleting}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>Sair da Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteBtn,
            { backgroundColor: colors.dangerSurface || '#FEE2E2', opacity: isDeleting ? 0.6 : 1 },
          ]}
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color={colors.danger || '#EF4444'} size="small" />
          ) : (
            <Text style={[styles.deleteText, { color: colors.danger || '#EF4444' }]}>
              Excluir Minha Conta
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  avatarSection: { alignItems: 'center', marginTop: 6, marginBottom: 20 },
  userName: { fontSize: 22, fontWeight: '700', marginTop: 10 },
  userRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    overflow: 'hidden',
  },
  pendingCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  pendingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D97706', marginRight: 6 },
  pendingBadgeText: { fontSize: 11, fontWeight: '800', color: '#B45309', letterSpacing: 0.5 },
  pendingStoreName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  pendingInfoText: { fontSize: 13, marginBottom: 2 },
  pendingActions: { marginTop: 14, gap: 10 },
  checkBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  checkBtnText: { fontWeight: '700', fontSize: 13 },
  cancelLinkBtn: { alignItems: 'center', paddingVertical: 4 },
  cancelLinkText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  cardHeader: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  helperDesc: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  actionBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: { fontWeight: '700', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 14, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchTitle: { fontSize: 15, fontWeight: '600' },
  switchSubtitle: { fontSize: 12, marginTop: 2 },
  actionBlock: { marginTop: 8, gap: 10, marginBottom: 30 },
  logoutBtn: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  logoutText: { fontWeight: '700', fontSize: 15 },
  deleteBtn: { padding: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  deleteText: { fontWeight: '700', fontSize: 15 },
});