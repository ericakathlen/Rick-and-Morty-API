import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const HomeScreen: React.FC = () => {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [charcacterSelected, setCharactersSelected] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pickSearch, setPickSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});
  const [favoritesLoaded, setFavoritosCarregados] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];
  let timeout: NodeJS.Timeout | null = null;

  useEffect(() => {
    loadFavorites();
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (favoritesLoaded) {
      carregarPersonagens();
    }
  }, [favoritesLoaded]);

  useEffect(() => {
    if (favoritesLoaded) {
      salvarFavoritos();
    }
  }, [favorites]);

  const carregarPersonagens = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character?page=${paginaAtual}`);
      if (!response.ok) {
        throw new Error('Error loading data!');
      }
      const data = await response.json();

      setAllCharacters((prev) => [...prev, ...data.results]);
      setHasMore(data.info.next !== null);
      setPaginaAtual((prev) => prev + 1);
    } catch (error) {
      console.error('Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (termo: string) => {
    setPickSearch(termo);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      performSearch(termo);
    }, 300);
  };

  const performSearch = async (termo: string) => {
    setLoading(true);

    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${termo}`);
      if (!response.ok) {
        throw new Error('Error loading data!');
      }
      const data = await response.json();

      if (data.error) {
        setAllCharacters([]);
      } else {
        setAllCharacters(data.results);
      }
    } catch (error) {
      setAllCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setPickSearch('');
    setPaginaAtual(1); 
    setAllCharacters([]);
    setHasMore(true);
    carregarPersonagens();
  };

  const showCharacterDetails = (character: Character) => {
    setCharactersSelected(character);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideCharacterDetails = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCharactersSelected(null);
    });
  };

  const toggleFavorito = (id: number) => {
    const novosFavorites = { ...favorites };
    novosFavorites[id] = !novosFavorites[id];
    setFavorites(novosFavorites);
  };

  const salvarFavoritos = async () => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritosSalvos = await AsyncStorage.getItem('favorites');
      if (favoritosSalvos) {
        setFavorites(JSON.parse(favoritosSalvos));
      }
      setFavoritosCarregados(true);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
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
          <TouchableOpacity onPress={() => toggleFavorito(item.id)} style={styles.heartIcon}>
            <Ionicons
              name={favorites[item.id] ? 'heart' : 'heart-outline'}
              size={24}
              color={favorites[item.id] ? 'red' : 'black'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    return (
      loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Ops! Não possui nenhum personagem com este nome.</Text>
      </View>
    );
  };

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

      {pickSearch === '' ? (
        <FlatList
          data={allCharacters}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          onEndReached={carregarPersonagens}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.contentContainer}
        />
      ) : (
        <FlatList
          data={allCharacters}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.contentContainer}
        />
      )}

      {charcacterSelected && (
        <Animated.View style={[styles.detailContainer, { opacity }]}>
          <CharacterDetails character={charcacterSelected} onClose={hideCharacterDetails} />
        </Animated.View>
      )}
    </View>
  );
};

export default HomeScreen;

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

  tituloContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  tituloImage: {
    marginTop: 30,
    width: 312,
    height: 104,
  },
  searchBarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  heartIcon: {
    marginLeft: 100,
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
    backgroundColor: 'rgba(255, 255, 255, 1)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
