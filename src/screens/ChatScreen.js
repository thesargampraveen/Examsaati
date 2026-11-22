import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, shadow, typography } from '../theme';
import { Avatar } from '../components/ui';
import { api } from '../api/client';
import ReportBlockSheet from '../components/ReportBlockSheet';
import ExamMeta from '../components/ExamMeta';

export default function ChatScreen({ route, navigation }) {
  const friend = route.params?.friend;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const listRef = useRef(null);
  const poll = useRef(null);

  const load = useCallback(async () => {
    if (!friend) return;
    try {
      const res = await api.getMessages(friend._id);
      setMessages(res.messages || []);
    } catch (err) {
      Alert.alert('Error', err.message);
      navigation.goBack();
    }
  }, [friend, navigation]);

  useEffect(() => {
    load();
    poll.current = setInterval(load, 4000);
    return () => clearInterval(poll.current);
  }, [load]);

  const send = async () => {
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await api.sendMessage(friend._id, t);
      setText('');
      await load();
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  };

  if (!friend) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Avatar name={friend.name} color={friend.avatarColor} size={38} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.name}>{friend.name || 'Student'}</Text>
          <Text style={styles.meta}>{friend.exam || ''}</Text>
          <ExamMeta user={friend} light style={{ marginTop: 1 }} />
        </View>
        <TouchableOpacity onPress={() => setReportVisible(true)}>
          <Text style={styles.reportLink}>Report</Text>
        </TouchableOpacity>
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
                Start the conversation — wish them luck for {friend.exam || 'the exam'}! 🍀
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
              const mine = item.sender !== friend._id;
              return (
                <View style={[styles.bubbleRow, mine && { justifyContent: 'flex-end' }]}>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
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

      <ReportBlockSheet
        visible={reportVisible}
        targetUser={friend}
        onClose={() => setReportVisible(false)}
        onDone={() => navigation.goBack()}
      />
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
  backBtn: {
    marginRight: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.full,
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
});
