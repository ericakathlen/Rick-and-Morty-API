import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import SearchBar from '@/components/SearchBar';
import CharacterDetails from '@/components/CharactersDetails';

type Character = {
  id: number;
  name: string;
  species: string;
  image: string;
  status: string;
  gender: string;
  type: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
};

const FavoritosScreen: React.FC = () => {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [favoritos, setFavoritos] = useState<{ [key: number]: boolean }>({});
  const [favoritesLoaded, setFavoritosCarregados] = useState(false);
  const [charcacterSelected, setCharactersSelected] = useState<Character | null>(null);
  const [pickSearch, setPickSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadFavorites = async () => {
        try {
          const favoritosSalvos = await AsyncStorage.getItem('favorites');
          if (favoritosSalvos) {
            setFavoritos(JSON.parse(favoritosSalvos));
          }
          setFavoritosCarregados(true);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      };

      loadFavorites();
    }, [])
  );

  useEffect(() => {
    if (favoritesLoaded) {
      carregarPersonagensFavoritos();
    }
  }, [favoritesLoaded, favoritos]);

  const carregarPersonagensFavoritos = async () => {
    const idsFavoritos = Object.keys(favoritos).filter(id => favoritos[Number(id)]);
    if (idsFavoritos.length === 0) {
      setAllCharacters([]);
      return;
    }

    try {
      const promises = idsFavoritos.map(id =>
        fetch(`https://rickandmortyapi.com/api/character/${id}`).then(response => response.json())
      );
      const personagensFavoritos = await Promise.all(promises);
      setAllCharacters(personagensFavoritos);
    } catch (error) {
      console.error('Request error:', error);
    }
  };

  const toggleFavorito = async (id: number) => {
    if (favoritos[id]) {
      return;
    }

    const novosFavoritos = { ...favoritos };
    novosFavoritos[id] = !novosFavoritos[id];
    setFavoritos(novosFavoritos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
  };

  const handleSearch = (termo: string) => {
    setPickSearch(termo);
    performSearch(termo);
  };

  const performSearch = async (termo: string) => {
    if (termo === '') {
      carregarPersonagensFavoritos();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${termo}`);
      if (!response.ok) {
        setAllCharacters([]);
        return;
      }
      const data = await response.json();
      const personagensFiltrados = data.results.filter((personagem: Character) => favoritos[personagem.id]);
      setAllCharacters(personagensFiltrados);
    } catch (error) {
      console.error('Error in search', error);
      setAllCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setPickSearch('');
    carregarPersonagensFavoritos();
  };

  const showCharacterDetails = (character: Character) => {
    setCharactersSelected(character);
  };

  const hideCharacterDetails = () => {
    setCharactersSelected(null);
  };

  const renderItem = ({ item }: { item: Character }) => (
    <TouchableOpacity onPress={() => showCharacterDetails(item)}>
      <View style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.imagem} resizeMode="cover" />
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.nome}>{item.name}</Text>
            <Text style={styles.info}>{item.species}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorito(item.id)}
            style={[styles.heartIcon, favoritos[item.id] && styles.disabledHeartIcon]}
            disabled={favoritos[item.id]} 
          >
            <Ionicons
              name={favoritos[item.id] ? 'heart' : 'heart-outline'}
              size={25}
              color={favoritos[item.id] ? 'red' : 'black'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Image
          source={require('@/assets/images/856443c541116a3dafefe5f5b9ab1377.png')}
          style={{ width: 46, height: 49 }}
        />
      </View>
      <View style={styles.searchBarContainer}>
        <SearchBar onSearch={handleSearch} onClear={resetSearch} />
      </View>

      {charcacterSelected && (
        <View style={styles.detailContainer}>
          <TouchableOpacity onPress={hideCharacterDetails} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Fechar Detalhes</Text>
          </TouchableOpacity>
          <CharacterDetails character={charcacterSelected} onClose={hideCharacterDetails} />
        </View>
      )}

      <FlatList
        data={allCharacters}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}`}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={<Text>Ops! Nenhum personagem curtido.</Text>}
      />
    </View>
  );
};

export default FavoritosScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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

  searchBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
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
  imagem: {
    width: 312,
    height: 288,
    borderRadius: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  textContainer: {
    flex: 1,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
  },
  heartIcon: {
    marginLeft: 10,
  },
  disabledHeartIcon: {
    opacity: 0.5,
  },
  loader: {
    marginTop: 10,
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  detailContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
