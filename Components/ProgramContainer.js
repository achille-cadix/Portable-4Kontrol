// Components/ProgramContainer.js

import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  RefreshControl,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {connect} from 'react-redux';
import Dialog from 'react-native-dialog';
import Slider from '@react-native-community/slider';
import ProgramItem from './ProgramItem';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProgramContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playlistsList: [],
      programsList: [],
      brightness: 100,
      refreshingData: true,
      wheelsList: [],
      server_ip: false,
      ip_text: '',
      client: null,
      responseFromsServer: true,
    };
    this.default_ip = '37';
  }

  storeData = async (item, value) => {
    try {
      await AsyncStorage.setItem(item, value.toString());
    } catch (e) {
      console.log(e);
    }
  };

  getMyStringValue = async (item) => {
    try {
      stringValue = await AsyncStorage.getItem(item);
      return stringValue != null ? stringValue : this.default_ip;
    } catch (e) {
      console.log(e);
    }
  };

  _stopProgram() {
    return this.state.client
      .post('/program/stop')
      .then((reponse) => {
        const actionStop = {type: 'STOP_PROGRAM'};
        this.props.dispatch(actionStop);
        Toast.show({
          type: 'success',
          visibilityTime: 2000,
          autoHide: true,
          position: 'bottom',
          text1: 'Arret du programme',
        });
      })
      .catch((error) => {
        console.log(error.response);
        Toast.show({
          type: 'error',
          visibilityTime: 3000,
          autoHide: true,
          position: 'bottom',
          text1: 'Pas de réponse de : ' + this.state.client.defaults.baseURL,
          text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K',
        });
        const actionStop = {type: 'STOP_PROGRAM'};
        this.props.dispatch(actionStop);
      });
  }

  _turnOffLed() {
    return this.state.client
      .post('/programs/off')
      .then((response) => {
        const actionStop = {type: 'STOP_PROGRAM'};
        this.props.dispatch(actionStop);
        Toast.show({
          type: 'success',
          visibilityTime: 2000,
          autoHide: true,
          position: 'bottom',
          text1: 'Extinction des LEDs',
        });
      })
      .catch((error) => {
        console.log(error.response);
        Toast.show({
          type: 'error',
          visibilityTime: 3000,
          autoHide: true,
          position: 'bottom',
          text1: 'Pas de réponse de : ' + this.state.client.defaults.baseURL,
          text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K',
        });
        const actionStop = {type: 'STOP_PROGRAM'};
        this.props.dispatch(actionStop);
      });
  }

  _loadProgramsList() {
    this.setState({
      refreshingData: false,
    });
    return this.state.client
      .get('/programs')
      .then((response) => response.data)
      .then((data) => {
        this.setState({
          programsList: data,
          refreshingData: false,
        });
        Toast.show({
          type: 'success',
          visibilityTime: 1000,
          autoHide: true,
          position: 'bottom',
          text1: 'Chargement des programmes effectué',
        });
        const update_programs = {
          type: 'UPDATE_PROGRAMS',
          value: this.state.programsList,
        };
        this.props.dispatch(update_programs);
      })
      .catch((error) => {
        console.error(error);
        this.setState({responseFromsServer: false});
        console.log(error.response);
        Toast.show({
          type: 'error',
          visibilityTime: 3000,
          autoHide: true,
          position: 'bottom',
          text1: 'Pas de réponse de : ' + this.state.client.defaults.baseURL,
          text2: error.response || error.message,
        });
        this.setState({
          refreshingData: false,
        });
      });
  }

  _loadPlaylistsList = () => {
    return this.state.client
      .get('/playlists')
      .then((response) => response.data)
      .then((data) => {
        this.setState({
          playlistsList: data,
          refreshingData: false,
        });
        Toast.show({
          type: 'success',
          visibilityTime: 1000,
          autoHide: true,
          position: 'bottom',
          text1: 'Chargement des playlists effectué',
        });
        const update_playlists = {
          type: 'UPDATE_PLAYLISTS',
          value: this.state.playlistsList,
        };
        this.props.dispatch(update_playlists);
      })
      .catch((error) => {
        console.log(error.response);
        Toast.show({
          type: 'error',
          visibilityTime: 3000,
          autoHide: true,
          position: 'bottom',
          text1: 'Pas de réponse de : ' + this.state.client.defaults.baseURL,
          text2: error.response || error.message,
        });
        this.setState({
          refreshingData: false,
        });
      });
  };

  _loadWheelsList = () => {
    return this.state.client
      .get('/wheels')
      .then((response) => response.data)
      .then((data) => {
        this.setState({
          wheelsList: data,
          refreshingData: false,
        });
      })
      .catch((error) => {
        console.log(error.response);
        Toast.show({
          type: 'error',
          visibilityTime: 3000,
          autoHide: true,
          position: 'bottom',
          text1: 'Pas de réponse de : ' + this.state.client.defaults.baseURL,
          text2: error.response || error.message,
        });
      });
  };

  _refreshFunction = () => {
    this._loadProgramsList();
    this._loadPlaylistsList();
    this._loadWheelsList();
  };

  _askForServerIp() {
    if (!this.state.responseFromsServer) {
      return (
        <Dialog.Container visible={true}>
          <Dialog.Title>Entrez l'IP du serveur</Dialog.Title>
          <Dialog.Description>192.168.1. ??</Dialog.Description>
          <Dialog.Input
            placeholder="IP du server"
            style={styles.text_input}
            onChangeText={(text) => this.setState({ip_text: text})}
            keyboardType="numeric"
          />
          <Dialog.Button
            label="Valider"
            onPress={async () => {
              this.setState({
                responseFromsServer: true,
                client: axios.create({
                  baseURL: 'http://192.168.1.' + this.state.ip_text + ':8080',
                  timeout: 2000,
                  headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                  },
                }),
              });
              await this.storeData('@server_ip', this.state.ip_text);
              this._loadPlaylistsList();
            }}
          />
        </Dialog.Container>
      );
    }
  }

  async componentDidMount() {
    let server_ip =
      (await this.getMyStringValue('@server_ip')) ?? this.default_ip;
    this.setState({
      client: axios.create({
        baseURL: 'http://192.168.1.' + server_ip + ':8080',
        timeout: 2000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      }),
    });
    this._refreshFunction();
  }

  render() {
    return (
      <View style={styles.main_container}>
        <View>{this._askForServerIp()}</View>
        <View style={styles.main_container}>
          <View style={styles.top_buttons}>
            <View style={styles.button_style}>
              <TouchableOpacity
                style={styles.stop_button}
                onPress={() => this._stopProgram()}>
                <Text>Arreter le programme</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.button_style}>
              <TouchableOpacity
                style={styles.off_button}
                onPress={() => this._turnOffLed()}>
                <Text>Eteindre les LEDs</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View></View>
          <View style={styles.programlist_container}>
            <FlatList
              style={styles.list_container}
              data={this.state.programsList}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshingData}
                  onRefresh={() => {
                    this._refreshFunction();
                  }}
                />
              }
              keyExtractor={(item, index) => 'key' + index}
              renderItem={({item}) => (
                <ProgramItem
                  client={this.state.client}
                  brightness={this.state.brightness}
                  program={item}
                  wheelsList={this.state.wheelsList}
                  refreshFunction={this._refreshFunction}
                  navigation={this.props.navigation}
                  playlists={this.state.playlistsList}
                />
              )}
            />
          </View>
          <View style={styles.slider}>
            <Slider
              minimumValue={0}
              maximumValue={255}
              value={100}
              onValueChange={(value) => {
                this.setState({brightness: parseInt(value)});
              }}
            />
          </View>
        </View>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    marginTop: 10,
    marginBottom: 5,
  },
  top_buttons_container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  programlist_container: {
    flex: 10,
    backgroundColor: '#fff',
  },
  top_buttons: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 5,
    marginRight: 5,
    marginTop: 0,
    marginBottom: 10,
  },
  button_style: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 0,
    marginBottom: 10,
  },
  stop_button: {
    alignItems: 'center',
    backgroundColor: 'yellow',
    padding: 10,
  },
  off_button: {
    alignItems: 'center',
    backgroundColor: 'red',
    padding: 10,
  },
  slider: {
    flex: 1,
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    borderWidth: 2,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  list_container: {
    marginLeft: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    runningProgram: state.runningProgram,
    programsGlobalList: state.programsGlobalList,
    playlistsGlobalList: state.playlistsGlobalList,
  };
};

export default connect(mapStateToProps)(ProgramContainer);
