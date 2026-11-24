import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors, radius, spacing, shadow, typography } from '../theme';
import { Avatar } from '../components/ui';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ReportBlockSheet from '../components/ReportBlockSheet';
import ExamMeta from '../components/ExamMeta';

export default function ChatScreen({ route, navigation }) {
  const friend = route.params?.friend;
  const [group, setGroup] = useState(route.params?.group || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const { user } = useAuth();
  const listRef = useRef(null);
  const poll = useRef(null);

  const load = useCallback(async () => {
    try {
      if (group) {
        const res = await api.getGroupMessages(group._id);
        setMessages(res.messages || []);
      } else if (friend) {
        const res = await api.getMessages(friend._id);
        setMessages(res.messages || []);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    }
  }, [friend, group, navigation]);

  const refreshGroup = useCallback(async () => {
    if (!group) return;
    try {
      const res = await api.getGroup(group._id);
      setGroup(res.group);
    } catch {
      // group may have been deleted if everyone left
      navigation.goBack();
    }
  }, [group, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
      refreshGroup();
      poll.current = setInterval(load, 4000);
      return () => clearInterval(poll.current);
    }, [load, refreshGroup])
  );

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      if (group) await api.sendGroupMessage(group._id, t);
      else await api.sendMessage(friend._id, t);
      setText('');
      await load();
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  };

  const leave = async () => {
    Alert.alert('Leave group', `Leave “${group?.name}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.leaveGroup(group._id);
            setInfoVisible(false);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  if (!friend && !group) return null;
  const title = group ? group.name : friend?.name;
  const subtitle = group ? `${group.members?.length || 0} members` : friend?.exam || '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerMain}
          activeOpacity={group ? 0.8 : 1}
          onPress={group ? () => setInfoVisible(true) : undefined}
          disabled={!group}
        >
          {group ? (
            <View style={[styles.groupAvatar, { backgroundColor: group.avatarColor || colors.accent }]}>
              <MaterialCommunityIcons name="account-group" size={20} color={colors.white} />
            </View>
          ) : (
            <Avatar name={friend?.name} color={friend?.avatarColor} size={38} />
          )}
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.name} numberOfLines={1}>{title || 'Student'}</Text>
            <Text style={styles.meta} numberOfLines={1}>{subtitle}</Text>
            {!group && <ExamMeta user={friend} light style={{ marginTop: 1 }} />}
          </View>
        </TouchableOpacity>
        {group ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateGroup', { group })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="account-plus" size={24} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setReportVisible(true)}>
            <Text style={styles.reportLink}>Report</Text>
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <View style={{ flex: 1 }}>
          {messages.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="clover" size={26} color={colors.primary} />
              </View>
              <Text style={styles.emptyText}>
                {group
                  ? `Start the conversation in “${group.name}” 🍀`
                  : `Start the conversation — wish them luck for ${friend?.exam || 'the exam'}! 🍀`}
              </Text>
            </View>
          ) : null}
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m._id}
            onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: false })}
            contentContainerStyle={{ padding: spacing.lg }}
            renderItem={({ item }) => {
              if (item.system) {
                return (
                  <Text style={styles.systemMsg} numberOfLines={2}>{item.text}</Text>
                );
              }
              const mine = group
                ? (item.sender?._id || item.sender) === user?._id
                : item.sender !== friend?._id;
              const senderName = group && !mine ? item.sender?.name : null;
              return (
                <View style={[styles.bubbleRow, mine && { justifyContent: 'flex-end' }]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    {senderName && <Text style={styles.senderName}>{senderName}</Text>}
                    <Text style={mine ? styles.bubbleTextMine : styles.bubbleText}>{item.text}</Text>
                    <Text style={mine ? styles.timeMine : styles.time}>
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={sending}>
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {!group && (
        <ReportBlockSheet
          visible={reportVisible}
          targetUser={friend}
          onClose={() => setReportVisible(false)}
          onDone={() => navigation.goBack()}
        />
      )}

      {/* Group info: members + add students + leave */}
      <Modal visible={infoVisible} animationType="slide" transparent>
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={[styles.groupAvatar, { backgroundColor: group?.avatarColor || colors.accent }]}>
                <MaterialCommunityIcons name="account-group" size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.sheetTitle} numberOfLines={1}>{group?.name}</Text>
                <Text style={styles.sheetSub}>{group?.members?.length || 0} members</Text>
              </View>
              <TouchableOpacity onPress={() => setInfoVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addMembersBtn}
              onPress={() => {
                setInfoVisible(false);
                navigation.navigate('CreateGroup', { group });
              }}
            >
              <MaterialCommunityIcons name="account-plus" size={20} color={colors.primary} />
              <Text style={styles.addMembersText}>Add students</Text>
            </TouchableOpacity>

            <FlatList
              data={group?.members || []}
              keyExtractor={(m) => String(m._id)}
              contentContainerStyle={{ paddingBottom: spacing.lg }}
              renderItem={({ item }) => (
                <View style={styles.memberRow}>
                  <Avatar name={item.name} color={item.avatarColor} size={40} />
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {item.name || 'Student'}
                      {item._id === user?._id ? ' (you)' : ''}
                    </Text>
                    <ExamMeta user={item} style={{ marginTop: 1 }} />
                  </View>
                  {group?.admin && (group.admin._id || group.admin) === item._id && (
                    <Text style={styles.adminTag}>Admin</Text>
                  )}
                </View>
              )}
            />

            <TouchableOpacity style={styles.leaveBtn} onPress={leave}>
              <MaterialCommunityIcons name="exit-to-app" size={20} color="#DC2626" />
              <Text style={styles.leaveText}>Leave group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    ...shadow,
  },
  headerMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.full,
  },
  groupAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.white, fontWeight: '700', fontSize: 16 },
  meta: { color: colors.primaryLight, fontSize: 12, marginTop: 1 },
  reportLink: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  systemMsg: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xxl,
    overflow: 'hidden',
  },
  senderName: { fontSize: 12, fontWeight: '800', color: colors.primary, marginBottom: 2 },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm, paddingHorizontal: 2 },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 2,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    ...shadow,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 21 },
  bubbleTextMine: { fontSize: 15, color: colors.white, lineHeight: 21 },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { fontSize: 10, color: colors.primaryLight, marginTop: 4, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    maxHeight: 110,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xxl,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: { ...typography.secondary, textAlign: 'center', maxWidth: 260 },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    paddingBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  sheetSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  addMembersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addMembersText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.text },
  adminTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  leaveText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
