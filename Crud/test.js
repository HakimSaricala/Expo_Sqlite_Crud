import { StatusBar } from "expo-status-bar";
import React from "react";
import { useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import { StyleSheet, Text, View, Button, Image, TextInput } from "react-native";

const App = () => {
  const db = SQLite.openDatabaseSync("todos.db");
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const init = async () => {
      await db.execAsync(`
          PRAGMA journal_mode = WAL;
          CREATE TABLE IF NOT EXISTS crud 
            (id INTEGER PRIMARY KEY NOT NULL, fname TEXT NOT NULL, fname TEXT NOT NULL, mname TEXT, course TEXT NOT NULL, age INTEGER NOT NULL);
        `);
    };
    init();
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const todosDb = await db.getAllAsync("SELECT * FROM crud");
    setTodos(todosDb);
  };

  const addTodoDb = async (todo) => {
    const id = todos.length + 1;
    await db.runAsync("INSERT INTO todos (id, todo) VALUES (?, ?)", id, todo);
    setTodos([{ id: id, todo: todo }, ...todos]);
  };

  const addTodo = () => {
    addTodoDb(input);
    setInput("");
  };

  const deleteTodo = async (id) => {
    await db.runAsync("DELETE FROM todos WHERE id = $id", { $id: id });
    loadTodos();
  };

  return (
    <View style={styles.container}>
      {todos &&
        todos.map((item) => (
          <View key={item.id}>
            <Text>{item.todo}</Text>
            <Button title="Delete Todo" onPress={() => deleteTodo(item.id)} />
          </View>
        ))}
      <TextInput style={styles.input} onChangeText={setInput} value={input} />
      <Button title="Add Todo" onPress={addTodo} />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    width: 100,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
