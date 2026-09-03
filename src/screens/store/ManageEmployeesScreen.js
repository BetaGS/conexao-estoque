import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useStore } from '../../contexts/StoreContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function ManageEmployeesScreen() {
  const { employees, pendingRequests, approveMember, rejectMember } = useStore();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. SEÇÃO: SOLICITAÇÕES PENDENTES DE APROVAÇÃO */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Solicitações de Entrada ({pendingRequests.length})
        </Text>
        <Text style={[styles.sectionSub, { color: colors.subText }]}>
          Usuários que colocaram o código da loja e aguardam liberação
        </Text>
      </View>

      {pendingRequests.length === 0 ? (
        <View style={[styles.cardEmpty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.emptyText, { color: colors.subText }]}>Nenhuma solicitação pendente no momento.</Text>
        </View>
      ) : (
        pendingRequests.map((req) => (
          <View key={req.id} style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
            <View>
              <Text style={[styles.personName, { color: colors.text }]}>{req.name}</Text>
              <Text style={[styles.personNickname, { color: colors.primary }]}>{req.nickname}</Text>
              <Text style={[styles.roleBadge, { color: colors.subText }]}>
                Solicitou cargo: <Text style={{ fontWeight: '700', color: colors.text }}>{req.requestedRole}</Text>
              </Text>
            </View>

            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[styles.approveBtn, { backgroundColor: '#16A34A' }]}
                onPress={() => {
                  approveMember(req.id, req.requestedRole);
                  Alert.alert('Aprovado!', `${req.name} agora faz parte da equipe como ${req.requestedRole}.`);
                }}
              >
                <Text style={styles.btnTextWhite}>Aprovar ✓</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rejectBtn, { backgroundColor: colors.dangerSurface }]}
                onPress={() => rejectMember(req.id)}
              >
                <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13 }}>Recusar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* 2. SEÇÃO: EQUIPE OFICIAL ATIVA */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipe Ativa ({employees.length})</Text>
      </View>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.employeeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.personName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.personNickname, { color: colors.subText }]}>{item.nickname}</Text>
            </View>
            <View style={[styles.activeRolePill, { backgroundColor: colors.chip }]}>
              <Text style={[styles.activeRoleText, { color: colors.primary }]}>{item.role}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  sectionSub: { fontSize: 12, marginTop: 2 },
  cardEmpty: { padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
  emptyText: { fontSize: 13 },
  requestCard: { padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  personName: { fontSize: 15, fontWeight: '700' },
  personNickname: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  roleBadge: { fontSize: 12, marginTop: 4 },
  requestActions: { gap: 6 },
  approveBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  rejectBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  btnTextWhite: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  employeeCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeRolePill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8 },
  activeRoleText: { fontSize: 12, fontWeight: '700' },
});