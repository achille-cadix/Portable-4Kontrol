// Components/ProgramContainer.js

import React from 'react';
import { Button, StyleSheet, View, TouchableOpacity, Text, FlatList, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import Dialog from "react-native-dialog";
import { connect } from 'react-redux';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import PlaylistItem from './PlaylistItem';


class PlaylistContainer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            playlistsList: [],
            brightness: 100,
            refreshingData: true,
            server_ip: false,
            ip_text: "",
            client: null,
            responseFromsServer: true
        }
        this.default_ip = "37"
    }

    storeData = async (item, value) => {
        try {
            await AsyncStorage.setItem(item, value.toString());
        } catch (e) {
            console.log(e)
        }
    }

    getMyStringValue = async (item) => {
        try {
            stringValue = await AsyncStorage.getItem(item)
            return stringValue != null ? stringValue : this.props.navigation.state.params.defaultValues[item]
        } catch (e) {
            console.log(e)
        }
    }

    _createNewPlaylist = () => {
        this.props.navigation.navigate("CreatePlaylist", { refreshPlaylists: this._loadPlaylistsList })
    }

    _stopProgram() {
        return this.state.client.post('/program/stop').then((reponse) => {
            const actionStop = { type: "STOP_PROGRAM" }
            this.props.dispatch(actionStop)
            Toast.show({
                type: 'success',
                visibilityTime: 2000,
                autoHide: true,
                position: 'bottom',
                text1: 'Arret du programme'
            });
        }).catch((error) => {
            Toast.show({
                type: 'error',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'Erreur : pas de réponse du serveur',
                text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K'
            });
            const actionStop = { type: "STOP_PROGRAM" }
            this.props.dispatch(actionStop)
        })
    }

    _turnOffLed() {
        return this.state.client.post('/programs/off').then((response) => {
            const actionStop = { type: "STOP_PROGRAM" }
            this.props.dispatch(actionStop)
            Toast.show({
                type: 'success',
                visibilityTime: 2000,
                autoHide: true,
                position: 'bottom',
                text1: 'Extinction des LEDs'
            });
        }).catch((error) => {
            Toast.show({
                type: 'error',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'Erreur : pas de réponse du serveur',
                text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K'
            });
            const actionStop = { type: "STOP_PROGRAM" }
            this.props.dispatch(actionStop)
        })
    }

    _loadPlaylistsList = async () => {
        return this.state.client.get('/playlists').then((response) => response.data).then((data) => {
            this.setState({
                playlistsList: data,
                refreshingData: false
            })
            Toast.show({
                type: 'success',
                visibilityTime: 1000,
                autoHide: true,
                position: 'bottom',
                text1: 'Chargement des playlists effectué'
            });
            const update_playlists = { type: "UPDATE_PLAYLISTS", value: this.state.playlistsList }
            this.props.dispatch(update_playlists)
        }).catch((error) => {
            this.setState({ responseFromsServer: false });
            Toast.show({
                type: 'error',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'Erreur : pas de réponse du serveur',
                text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K'
            });
            this.setState({
                refreshingData: false
            })
            const actionStop = { type: "STOP_PROGRAM", value: this.props.program.name }
            this.props.dispatch(actionStop)
        })
    }

    _askForServerIp() {
        if (!this.state.responseFromsServer) {
            return (
                <Dialog.Container visible={true}>
                    <Dialog.Title>Entrez l'IP du serveur</Dialog.Title>
                    <Dialog.Description>192.168.1. ??</Dialog.Description>
                    <Dialog.Input
                        placeholder="IP du server"
                        style={styles.text_input}
                        onChangeText={(text) => this.setState({ ip_text: text })}
                        keyboardType='numeric'
                    />
                    <Dialog.Button label="Valider" onPress={async () => {
                        this.setState({ responseFromsServer: true, client: axios.create({ baseURL: 'http://192.168.1.' + this.state.ip_text + ':8080', timeout: 2000 }) });
                        await this.storeData("@server_ip", this.state.ip_text);
                        this._loadProgramsList();
                    }
                    } />
                </Dialog.Container>
            )
        }
    }

    async componentDidMount() {
        let server_ip = await this.getMyStringValue("@server_ip") ?? this.default_ip;
        this.setState({ client: axios.create({ baseURL: 'http://192.168.1.' + server_ip + ':8080', timeout: 2000 }) });
        this._loadPlaylistsList();
    }

    render() {
        return (
            <View style={styles.main_container} >
                {this._askForServerIp()}
                <View style={styles.main_container}>
                    <View style={styles.top_buttons}>
                        <View style={styles.button_style}>
                            <TouchableOpacity style={styles.stop_button} onPress={() => this._stopProgram()} >
                                <Text>Arreter le programme</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.button_style}>
                            <TouchableOpacity style={styles.off_button} onPress={() => this._turnOffLed()}>
                                <Text>Eteindre les LEDs</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.top_buttons_container}>
                        <Button title='Creer une nouvelle playlist' color='green' onPress={() => { this._createNewPlaylist() }} />
                    </View>
                    <View style={styles.programlist_container}>
                        < FlatList style={styles.list_container}
                            refreshControl={<RefreshControl refreshing={this.state.refreshingData} onRefresh={() => { this._loadPlaylistsList() }} />}
                            data={Object.keys(this.state.playlistsList)}
                            keyExtractor={(item, index) => 'key' + index}
                            renderItem={({ item }) => (
                                <PlaylistItem
                                    refreshFunction={this._loadPlaylistsList}
                                    navigation={this.props.navigation}
                                    client={this.state.client}
                                    brightness={this.state.brightness}
                                    playlist={item}
                                    programsInPlaylist={this.props.playlistsGlobalList[item]} />)}
                        />
                    </View>
                    <View style={styles.slider}>
                        <Slider
                            minimumValue={0}
                            maximumValue={255}
                            value={100}
                            onValueChange={(value) => { this.setState({ brightness: parseInt(value) }) }} />
                    </View>
                </View>
                <Toast ref={(ref) => Toast.setRef(ref)} />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        marginTop: 10,
        marginBottom: 5
    },
    top_buttons_container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        justifyContent: 'center'
    },
    programlist_container: {
        flex: 10,
        backgroundColor: '#fff'
    },
    top_buttons: {
        flex: 1,
        flexDirection: 'row',
        marginLeft: 5,
        marginRight: 5,
        marginTop: 0,
        marginBottom: 10
    },
    button_style: {
        flex: 1,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 0,
        marginBottom: 10
    },
    stop_button: {
        alignItems: 'center',
        backgroundColor: 'yellow',
        padding: 10
    },
    off_button: {
        alignItems: 'center',
        backgroundColor: 'red',
        padding: 10
    },
    slider: {
        flex: 1,
        marginTop: 5,
        marginLeft: 5,
        marginRight: 5,
        borderWidth: 2,
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    list_container: {
        marginLeft: 10
    }
});

const mapStateToProps = (state) => {
    return {
        runningProgram: state.runningProgram,
        playlistsGlobalList: state.playlistsGlobalList
    }
}


export default connect(mapStateToProps)(PlaylistContainer)
