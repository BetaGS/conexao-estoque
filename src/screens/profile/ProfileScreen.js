import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoBox from '../../components/LogoBox';

export default function ProfileScreen({ navigation }) {
  const { user, logout, deleteAccount } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  // Exibe o nickname com prefixo @ formatado
  const displayNickname = user?.id?.startsWith('@')
    ? user.id
    : user?.nickname
    ? `@${user.nickname}`
    : '@usuario';

  const handleLogout = () => {
    Alert.alert('Sair da Conta', 'Deseja realmente desconectar desta conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
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
          onPress: () => {
            deleteAccount();
            Alert.alert('Conta Excluída', 'Sua conta foi encerrada com sucesso.');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.avatarSection}>
        <LogoBox size="large" />
        <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Usuário'}</Text>
        <Text style={[styles.userRoleBadge, { backgroundColor: colors.chip, color: colors.primary }]}>
          {user?.role || 'Membro'}
        </Text>
      </View>

      {/* Dados Cadastrais */}
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
            <Text style={[styles.switchSubtitle, { color: colors.subText }]}>Altera as cores de toda a interface</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? colors.primary : '#F4F3F4'}
            trackColor={{ false: '#767577', true: '#93C5FD' }}
          />
        </View>
      </View>

      {/* Ações de Conta */}
      <View style={styles.actionBlock}>
        <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.border }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: colors.text }]}>Sair da Conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: colors.dangerSurface }]}
          onPress={handleDeleteAccount}
        >
          <Text style={[styles.deleteText, { color: colors.danger }]}>Excluir Minha Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 24 },
  userName: { fontSize: 22, fontWeight: '700', marginTop: 12 },
  userRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    overflow: 'hidden',
  },
  card: { padding: 18, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
  cardHeader: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 14, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchTitle: { fontSize: 15, fontWeight: '600' },
  switchSubtitle: { fontSize: 12, marginTop: 2 },
  actionBlock: { marginTop: 12, gap: 12, marginBottom: 30 },
  logoutBtn: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  logoutText: { fontWeight: '700', fontSize: 15 },
  deleteBtn: { padding: 16, borderRadius: 14, alignItems: 'center' },
  deleteText: { fontWeight: '700', fontSize: 15 },
});