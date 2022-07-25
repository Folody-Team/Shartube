import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';

type Props = {
  onPress: () => void;
  children: any;
}

const Button = ({ onPress, children }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  )
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{
        fontSize: 30,
        color: '#fff',
        marginBottom: 50,
      }}>Login</Text>
      <View style={{
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 15,
      }}>
        <Text style={{
          color: '#fff',
          fontSize: 17,
          paddingVertical: 12,
        }}>Email</Text>
        <TextInput style={styles.input} placeholder="Enter email" placeholderTextColor='rgb(189, 189, 189)'/>
      </View>
      <View style={{
        width: '100%',
        alignSelf: 'stretch',
        marginBottom: 30,
      }}>
        <Text style={{
          color: '#fff',
          fontSize: 17,
          paddingVertical: 12,
        }}>Password</Text>
        <TextInput style={styles.input} placeholder="Enter password" placeholderTextColor='rgb(189, 189, 189)' secureTextEntry={true}/>
      </View>
      <StatusBar style="auto" />
      <Button onPress={() => {
        console.log('Button pressed')
      }}>Login</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141518',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2F4DEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buttonText: {
    fontSize: 18,
    color: '#BDBDBD',
  },
  input: {
    width: "100%",
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#212328',
    color: '#fff',
    alignSelf: 'stretch',
  }
});
