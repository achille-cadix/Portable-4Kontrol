// Components/CreatePlaylist.js

import React from 'react';
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';
import Dialog from "react-native-dialog";
import { connect } from 'react-redux';
import { ListItem } from 'react-native-elements';
import axios from 'axios';
import Toast from 'react-native-toast-message';

class CreatePlaylist extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            newPlaylistname: "",
            isNameGiven: false,
            checkedItems: []
        }
    }

    _cancelPlaylistCreation = () => {
        this.props.navigation.navigate("PlaylistContainer")
    }

    _validateName() {
        var regExp = /^[A-Za-z0-9]+$/;
        if (!this.state.newPlaylistname.match(regExp)) {
            return true
        }
        else {
            return false
        }

    }

    _invalidNameMessage() {
        if (this._validateName() && this.state.newPlaylistname != 0) {
            return (
                <Text style={styles.invalid_text}>
                    Format de texte invalide, utilisez des caractères alphanumériques
                </Text>
            )
        }
    }

    _promptNewPlaylistName(isNameGiven) {
        if (!isNameGiven) {
            return (
                <Dialog.Container visible={true}>
                    <Dialog.Title>Entrez le nom de la nouvelle playlist</Dialog.Title>
                    <Dialog.Input
                        placeholder="Nom de votre playlist"
                        style={styles.text_input}
                        onChangeText={(text) => this.setState({ newPlaylistname: text })}
                    />
                    <View>
                        {this._invalidNameMessage()}
                    </View>
                    <Dialog.Button label="Annuler" onPress={() => { this._cancelPlaylistCreation() }} />
                    <Dialog.Button label="Suivant" disabled={this._validateName()} onPress={() => { this.setState({ isNameGiven: true }) }} />
                </Dialog.Container>
            )
        }
    }

    _selectItem(itemName) {
        let duplicateList = this.state.checkedItems.slice()
        if (duplicateList.includes(itemName)) {
            duplicateList.pop(itemName)
            this.setState({
                checkedItems: duplicateList
            })
        }
        else {
            duplicateList.push(itemName)
            this.setState({
                checkedItems: duplicateList
            })
        }
    }

    _renderRow(data) {
        return (
            <View>
                <ListItem style={styles.program_container} onPress={() => { this._selectItem(data) }}>
                    <ListItem.Content>
                        <ListItem.Title>{data}</ListItem.Title>
                    </ListItem.Content>
                    <ListItem.CheckBox
                        checked={this.state.checkedItems.includes(data)}
                        onPress={() => { this._selectItem(data) }}
                    />
                </ListItem>
            </View>
        )
    }

    _createPlaylist() {
        let url = 'http://192.168.1.37:8080/playlists/' + this.state.newPlaylistname
        let body = { "programs": this.state.checkedItems }
        return axios({
            method: 'post',
            url: url,
            data: body
        }).then((response) => response.data).then((data) => {
            this.setState({
                programsList: data
            })
            Toast.show({
                type: 'success',
                visibilityTime: 1000,
                autoHide: true,
                position: 'bottom',
                text1: 'La playlist a été créée'
            });
            this.props.navigation.state.params.refreshPlaylists()
            this.props.navigation.navigate("PlaylistContainer")
        }).catch((error) => {
            Toast.show({
                type: 'error',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'Erreur : pas de réponse du serveur',
                text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K'
            });
        })
    }

    render() {
        return (
            <View style={styles.main_container} >
                { this._promptNewPlaylistName(this.state.isNameGiven)}
                < View style={styles.list_container} >
                    <FlatList
                        data={this.props.programsGlobalList}
                        keyExtractor={(item, index) => 'key' + index}
                        renderItem={({ item }) => (this._renderRow(item))}
                    />
                </View>
                <View style={styles.validation_button}>
                    <Button color="green" title="Creer la playlist" onPress={() => this._createPlaylist()} />
                </View>
            </View >
        )
    }
}

const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        marginTop: 5,
        marginBottom: 0
    },
    text_input: {
        borderWidth: 1
    },
    list_container: {
        flex: 10
    },
    validation_button: {
        flex: 1,
        marginLeft: 5,
        marginRight: 5
    },
    invalid_text: {
        color: "red",
    },
    program_container: {
        marginTop: 2
    }
})

const mapStateToProps = (state) => {
    return {
        runningProgram: state.runningProgram,
        programsGlobalList: state.programsGlobalList,
        playlistsGlobalList: state.playlistsGlobalList
    }
}

export default connect(mapStateToProps)(CreatePlaylist)
