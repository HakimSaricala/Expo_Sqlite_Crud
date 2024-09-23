import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const db = SQLite.openDatabaseSync("crud.db");
  const [modalVisible, setModalVisible] = useState(false);
  const [studentRecords, setStudentRecords] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [mname, setMname] = useState("");
  const [course, setCourse] = useState("");
  const [age, setAge] = useState("");
  useEffect(() => {
    const init = async () => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS crud 
          (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, fname TEXT NOT NULL, lname TEXT NOT NULL, mname TEXT, course TEXT NOT NULL, age INTEGER NOT NULL);
      `);
    };
    init();
    loadRecords();
  }, []);
  const loadRecords = async () => {
    const records = await db.getAllAsync("SELECT * FROM crud");
    console.log(records);
    setStudentRecords(records);
  };
  const resetModal = () => {
    setSelectedItem(null);

    setFname("");
    setLname("");
    setMname("");
    setCourse("");
    setAge("");
  };
  const onCreate = () => {
    resetModal();
    console.log(selectedItem);
    setModalVisible(!modalVisible);
  };

  const onSave = async () => {
    if (!fname || !lname || !course || !age) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (selectedItem) {
        await db.runAsync(
          `UPDATE crud SET fname = ?, lname = ?, mname = ?, course = ?, age = ? WHERE id = ?`,
          [fname, lname, mname, course, parseInt(age), selectedItem.id]
        );

        console.log("Record updated successfully");
        setSelectedItem(null);
      } else {
        await db.runAsync(
          `INSERT INTO crud (fname, lname, mname, course, age) VALUES (?, ?, ?, ?, ?)`,
          [fname, lname, mname, course, parseInt(age)]
        );
        console.log("Record inserted successfully");
      }

      loadRecords();
      setModalVisible(false);
      resetModal();
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };
  const onCancel = () => {
    setModalVisible(!modalVisible);
  };
  const onEdit = (item) => {
    setSelectedItem(item);
    setFname(item.fname);
    setLname(item.lname);
    setMname(item.mname);
    setCourse(item.course);
    setAge(item.age.toString());

    setModalVisible(true);
  };
  const onDelete = async (id) => {
    try {
      await db.runAsync(`DELETE FROM crud WHERE id = ?`, [id]);
      console.log("Record deleted successfully");
      loadRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };
  const formatId = (id) => {
    if (id < 10) {
      return `a21-00${id}`;
    } else if (id < 100) {
      return `a21-0${id}`;
    } else {
      return `a21-${id}`;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View>
        <Text>Student number: {formatId(item.id)}</Text>
        <Text>
          Name: {item.fname} {item.mname} {item.lname}
        </Text>
        <Text>Course: {item.course}</Text>
        <Text>Age: {item.age} years old</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Ionicons name="pencil" size={24} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <Text style={styles.Title}>Student Records</Text>
      <FlatList
        data={studentRecords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              {selectedItem ? "Edit Record" : "Create Record"}
            </Text>
            <TextInput
              placeholder="First Name"
              value={fname}
              onChangeText={setFname}
              style={styles.input}
            />
            <TextInput
              placeholder="Last Name"
              value={lname}
              onChangeText={setLname}
              style={styles.input}
            />
            <TextInput
              placeholder="Middle Name"
              value={mname}
              onChangeText={setMname}
              style={styles.input}
            />
            <TextInput
              placeholder="Course"
              value={course}
              onChangeText={setCourse}
              style={styles.input}
            />
            <TextInput
              placeholder="Age"
              value={age}
              onChangeText={setAge}
              style={styles.input}
              keyboardType="numeric"
            />
            <View style={styles.ModalBody}>
              <TouchableOpacity style={styles.SaveButton} onPress={onCancel}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.SaveButton} onPress={onSave}>
                <Text style={styles.textStyle}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.FloatingButton} onPress={onCreate}>
        <Ionicons name="add-circle" size={60} color="green" />
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  Title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingTop: 20,
    textAlign: "left",
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",

    padding: 20,
  },
  FloatingButton: {
    resizeMode: "contain",
    width: 60,
    height: 60,
    position: "absolute",
    right: 20,
    bottom: 70,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  SaveButton: {
    backgroundColor: "green",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  ModalBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    width: 200,
    paddingHorizontal: 10,
  },
  recordItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
});
