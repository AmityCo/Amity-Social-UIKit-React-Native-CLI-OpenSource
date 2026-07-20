import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type UiKitModule = 'social' | 'chat';

export interface ILoginForm {
  userId: string;
  apiKey: string;
  apiRegion: string;
  module: UiKitModule;
}

interface ILoginPage {
  onSubmit: (value: ILoginForm) => void;
}

const REGIONS = ['sg', 'eu', 'us'];

export default function LoginPage({ onSubmit }: ILoginPage) {
  const [userId, setUserId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiRegion, setApiRegion] = useState('sg');
  const [module, setModule] = useState<UiKitModule>('chat');

  const handleLogin = () => {
    if (!userId || !apiKey) return;
    onSubmit({ userId, apiKey, apiRegion, module });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>React Native UIKit</Text>

      <View style={styles.field}>
        <Text style={styles.label}>User ID</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your User ID"
          autoCapitalize="none"
          value={userId}
          onChangeText={setUserId}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>API Key</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your API Key"
          autoCapitalize="none"
          value={apiKey}
          onChangeText={setApiKey}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>API Region</Text>
        <View style={styles.row}>
          {REGIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, apiRegion === r && styles.chipActive]}
              onPress={() => setApiRegion(r)}
            >
              <Text
                style={[
                  styles.chipText,
                  apiRegion === r && styles.chipTextActive,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>UIKit Module</Text>
        <View style={styles.row}>
          {(['social', 'chat'] as UiKitModule[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, module === m && styles.chipActive]}
              onPress={() => setModule(m)}
            >
              <Text
                style={[styles.chipText, module === m && styles.chipTextActive]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  field: { gap: 6 },
  label: { fontSize: 13, color: '#636878' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chipActive: { backgroundColor: '#1054DE', borderColor: '#1054DE' },
  chipText: { color: '#292B32', textTransform: 'capitalize' },
  chipTextActive: { color: '#FFFFFF' },
  button: {
    backgroundColor: '#1054DE',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
