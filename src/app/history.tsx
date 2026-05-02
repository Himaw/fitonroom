import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppRadii, AppShadows, BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const fitonHistory: {
  id: string;
  title: string;
  status: 'Completed' | 'Processing' | 'Failed';
  createdAt: string;
}[] = [];

export default function HistoryScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>History</Text>
          <Text style={[styles.title, { color: theme.text }]}>Your previous fitons.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Generated results for this device will appear here.
          </Text>
        </View>

        {fitonHistory.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No fitons yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Once you upload body photos and generate a try-on, the result list will show up here
              with status, item name, and image preview.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {fitonHistory.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.historyItem,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}>
                <View style={[styles.thumbnail, { backgroundColor: theme.backgroundSelected }]} />
                <View style={styles.historyText}>
                  <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.itemMeta, { color: theme.textSecondary }]}>
                    {item.status} · {item.createdAt}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset + 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: '100%',
  },
  header: {
    gap: 10,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyState: {
    ...AppShadows.card,
    borderRadius: AppRadii.card,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  historyItem: {
    alignItems: 'center',
    ...AppShadows.card,
    borderRadius: AppRadii.inner,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 12,
  },
  thumbnail: {
    borderRadius: AppRadii.control,
    height: 72,
    width: 56,
  },
  historyText: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  itemMeta: {
    fontSize: 14,
  },
});
