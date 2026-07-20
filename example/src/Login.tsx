import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {ILoginForm} from './App';
import RNPickerSelect from 'react-native-picker-select';
interface ILoginPage {
  onSubmit: (value: ILoginForm) => void;
}
const LoginPage = ({onSubmit}: ILoginPage) => {
  const [userId, setUserId] = useState('top');
  const [apiKey, setApiKey] = useState(
    'b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f',
  );
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedApiKeyOption, setSelectedApiKeyOption] = useState(
    'b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f',
  );
  const [selectedRegionOption, setSelectedRegionOption] = useState('sg');
  const options = [
    {label: 'Social', value: 'social'},
    {label: 'Chat', value: 'chat'},
  ];
  const regionOptions = [
    {label: 'sg', value: 'sg'},
    {label: 'eu', value: 'eu'},
    {label: 'us', value: 'us'},
    {label: 'staging', value: 'staging'},
    {label: 'dev', value: 'dev'},
  ];
  const apiKeyOptions = [
    {
      label: 'b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f',
      value: 'b3babb0b3a89f4341d31dc1a01091edcd70f8de7b23d697f',
    },
    {
      label: 'b0efe90c69ddf2604a63d81853081688840088b6e967397e',
      value: 'b0efe90c69ddf2604a63d81853081688840088b6e967397e',
    },
    {
      label: 'b0efe90c3bdda2304d628918520c1688845889e4bc363d2c',
      value: 'b0efe90c3bdda2304d628918520c1688845889e4bc363d2c',
    },
    {
      label: 'b0ebeb5939def76019308d4a530b12ddd558dde5bf346e2e',
      value: 'b0ebeb5939def76019308d4a530b12ddd558dde5bf346e2e',
    },
    {label: 'custom', value: ''},
  ];
  const handleLogin = () => {
    // Perform login logic here
    onSubmit &&
      onSubmit({
        userId: userId,
        apiRegion: selectedRegionOption,
        apiKey: selectedApiKeyOption || apiKey,
        module: selectedOption,
      });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./amity-logo-banner.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>React Native UIkit</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Userid</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Userid"
          onChangeText={text => setUserId(text)}
          value={userId}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>API Key</Text>
        {!selectedApiKeyOption ? (
          <TextInput
            style={styles.input}
            placeholder="Enter your API Key"
            onChangeText={text => setApiKey(text)}
            value={apiKey}
          />
        ) : (
          <View>
            <RNPickerSelect
              onValueChange={value => setSelectedApiKeyOption(value)}
              items={apiKeyOptions}
              value={selectedApiKeyOption}
              style={dropdownStyles}
            />
            <Text style={{color: 'gray', paddingVertical: 6}}>
              {selectedApiKeyOption}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>API Region</Text>
        <RNPickerSelect
          onValueChange={value => setSelectedRegionOption(value)}
          items={regionOptions}
          value={selectedRegionOption}
          style={dropdownStyles}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>UIKit Module</Text>
        <RNPickerSelect
          onValueChange={value => setSelectedOption(value)}
          items={options}
          value={selectedOption}
          style={dropdownStyles}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};
const dropdownStyles = {
  inputIOS: {
    fontSize: 14, // Adjust the font size here
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputIOSContainer: {
    zIndex: 100,
  },
  inputAndroid: {
    fontSize: 14, // Adjust the font size here
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#06be8b',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'black',
  },
  button: {
    width: '80%',
    height: 40,
    backgroundColor: '#06be8b',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginPage;
