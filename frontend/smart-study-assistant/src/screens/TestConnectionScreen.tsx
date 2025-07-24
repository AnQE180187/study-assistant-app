import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Button, Text, Card } from "react-native-paper";
import axios from "axios";

const TestConnectionScreen: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const testUrls = [
    "http://10.0.2.2:5000/api", // Android emulator
    "http://localhost:5000/api", // iOS simulator
    "http://192.168.1.17:5000/api", // Real device
    "http://10.0.2.2:5001", // Test server emulator
    "http://192.168.1.17:5001", // Test server real device
  ];

  const testConnection = async (baseURL: string) => {
    try {
      console.log(`Testing connection to: ${baseURL}`);
      const response = await axios.get(`${baseURL}/test`, { timeout: 5000 });
      return `✅ ${baseURL}: ${response.data.message}`;
    } catch (error: any) {
      console.error(`Failed to connect to ${baseURL}:`, error.message);
      return `❌ ${baseURL}: ${error.message}`;
    }
  };

  const testOTPEndpoint = async (baseURL: string) => {
    try {
      console.log(`Testing OTP endpoint: ${baseURL}`);
      const response = await axios.post(
        `${baseURL}/users/send-otp`,
        { email: "test@example.com" },
        { timeout: 10000 }
      );
      return `✅ OTP ${baseURL}: ${response.data.message}`;
    } catch (error: any) {
      console.error(`OTP failed for ${baseURL}:`, error.message);
      return `❌ OTP ${baseURL}: ${error.message}`;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    const newResults: string[] = [];

    // Test basic connections
    for (const url of testUrls) {
      const result = await testConnection(url);
      newResults.push(result);
      setResults([...newResults]);
    }

    // Test OTP endpoints
    const otpUrls = [
      "http://10.0.2.2:5000/api",
      "http://192.168.1.17:5000/api",
    ];

    for (const url of otpUrls) {
      const result = await testOTPEndpoint(url);
      newResults.push(result);
      setResults([...newResults]);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Connection Test</Text>

      <Button
        mode="contained"
        onPress={runAllTests}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Run Connection Tests
      </Button>

      <Card style={styles.resultsCard}>
        <Card.Content>
          <Text style={styles.resultsTitle}>Results:</Text>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    marginBottom: 20,
  },
  resultsCard: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: "monospace",
  },
});

export default TestConnectionScreen;
