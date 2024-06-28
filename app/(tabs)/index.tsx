import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, ScrollView, TextInput } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const App = () => {
  const [characters, setCharacters] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Função para buscar os personagens da API
    fetch('https://rickandmortyapi.com/api/character', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((json) => {
        // Atualiza o estado com os personagens obtidos
        setCharacters(json.results);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Função para filtrar personagens com base na pesquisa
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topbar}>
        <Image
          source={require('@/assets/images/856443c541116a3dafefe5f5b9ab1377.png')}
          style={{ width: 46, height: 49 }}
        />
      </View>

      <View style={styles.logo}>
        <Image
          source={require('@/assets/images/92dc1ac359bbffe31ce3cb3223f68e22.png')}
          style={{ width: 312, height: 104 }}
        />
      </View>

      <View style={styles.buscar}>
        <TextInput
          placeholder='Filtre seu personagem'
          value={search}
          onChangeText={setSearch}
          style={styles.textInput}
        />
      </View>

      {filteredCharacters.map((character) => (
        <View key={character.id} style={styles.card}>
          <Image source={{ uri: character.image }} style={styles.image} />
          <Text style={styles.name}>{character.name}</Text>
          <Text>{character.species}</Text>
          <Text>{character.status}</Text>
          
        </View>
      ))}
    </ScrollView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  topbar: {
    height: 60,
    elevation: 10,
    alignItems: 'center',
    padding: 10,
    justifyContent: 'center',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 2,
    shadowColor: '#00000024',
  },
  logo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 50,
  },
  buscar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
    width: '100%',
    marginBottom: 20,
    marginTop: 50,
  },
  textInput: {
    height: '100%',
    fontSize: 16,
  },
  card: {
    marginBottom: 20,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: '90%',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
});

export default App;