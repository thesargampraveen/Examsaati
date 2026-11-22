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
import { colors, radius, spacing } from '../theme';
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} style={styles.backArrow} />
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
              <View style={styles.emptyTextRow}>
                <Text style={styles.emptyText}>
                  Start the conversation — wish them luck for {friend.exam || 'the exam'}!
                </Text>
                <MaterialCommunityIcons name="clover" size={16} color={colors.accent} />
              </View>
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
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backArrow: { marginRight: spacing.md, paddingHorizontal: 6 },
  name: { color: colors.white, fontWeight: '700', fontSize: 16 },
  meta: { color: colors.primaryLight, fontSize: 12 },
  reportLink: { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },
  bubbleRow: { flexDirection: 'row', marginBottom: spacing.sm },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: colors.text },
  bubbleTextMine: { fontSize: 15, color: colors.white },
  time: { fontSize: 10, color: colors.textMuted, marginTop: 2, alignSelf: 'flex-end' },
  timeMine: { fontSize: 10, color: colors.primaryLight, marginTop: 2, alignSelf: 'flex-end' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 110,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyTextRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
