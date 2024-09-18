import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definir o tipo do item do estoque
interface StockItem {
  name: string;
  quantity: number;
}

// Obter as dimensões da tela
const { width, height } = Dimensions.get('window');

const App = () => {
  const [itemName, setItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [stock, setStock] = useState<StockItem[]>([]);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  useEffect(() => {
    loadStockFromStorage();
  }, []);

  useEffect(() => {
    saveStockToStorage();
  }, [stock]);

  const addItemToStock = () => {
    if (itemName.trim() === '' || quantity === '') {
      Alert.alert('Erro', 'Nome e quantidade são obrigatórios');
      return;
    }

    const updatedStock = [...stock];
    const index = updatedStock.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (index >= 0) {
      updatedStock[index].quantity = parseInt(quantity, 10);
    } else {
      updatedStock.push({ name: itemName, quantity: parseInt(quantity, 10) });
    }

    setStock(updatedStock);
    setItemName('');
    setQuantity('');
    setEditingItem(null);
  };

  const removeItemFromStock = (itemName: string) => {
    const updatedStock = stock.map(item => {
      if (item.name.toLowerCase() === itemName.toLowerCase() && item.quantity > 0) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    });

    setStock(updatedStock);
  };
  useEffect(() => {
    stock.forEach(item => {
      if (item.quantity === 1) {
        Alert.alert('Atenção', `O item ${item.name} está acabando!`);
      } else if (item.quantity === 0) {
        Alert.alert('Alerta', `O item ${item.name} acabou! É necessário comprar mais.`);
      }
    });
  }, [stock]);

  const deleteItem = (itemName: string) => {
    const updatedStock = stock.filter(item => item.name.toLowerCase() !== itemName.toLowerCase());
    setStock(updatedStock);
  };

  const startEditing = (item: StockItem) => {
    setItemName(item.name);
    setQuantity(item.quantity.toString());
    setEditingItem(item);
  };

  const saveStockToStorage = async () => {
    try {
      await AsyncStorage.setItem('stock', JSON.stringify(stock));
    } catch (error) {
      console.error('Error saving stock to storage', error);
    }
  };

  const loadStockFromStorage = async () => {
    try {
      const storedStock = await AsyncStorage.getItem('stock');
      if (storedStock) {
        setStock(JSON.parse(storedStock));
      }
    } catch (error) {
      console.error('Error loading stock from storage', error);
    }
  };

  const renderItem = ({ item }: { item: StockItem }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}: {item.quantity}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => removeItemFromStock(item.name)}>
          <Text style={styles.buttonText}>Remover 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => startEditing(item)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => deleteItem(item.name)}>
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Controle de Estoque</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome do item"
            value={itemName}
            onChangeText={setItemName}
          />

          <TextInput
            style={styles.input}
            placeholder="Quantidade"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.addButton} onPress={addItemToStock}>
            <Text style={styles.addButtonText}>{editingItem ? 'Atualizar Estoque' : 'Adicionar ao Estoque'}</Text>
          </TouchableOpacity>

          <FlatList
            data={stock}
            keyExtractor={item => item.name}
            renderItem={renderItem}
            style={styles.list}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Centraliza o conteúdo verticalmente
    alignItems: 'center', // Centraliza o conteúdo horizontalmente
    paddingHorizontal: 20,
    paddingVertical: 20, // Adiciona espaçamento vertical
    minHeight: height * 0.8, // Garante que o conteúdo ocupe pelo menos 80% da tela
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: width * 0.9, // Ajusta para ocupar 90% da largura da tela
    maxWidth: 400, // Limita a largura máxima
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    marginTop: 20,
    width: width * 0.9,
    maxWidth: 400,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default App;
