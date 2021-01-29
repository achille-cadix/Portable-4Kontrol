// Componenents/AddToPlaylist.js

import React from 'react';
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { connect } from 'react-redux';

class AddToPlaylist extends React.Component {

    constructor(props) {
        super(props)

    }

    _addToPlaylist(playlistName) {
        let url = 'http://192.168.1.37:8080/playlists/' + playlistName
        let newPlaylist = this.props.playlistsGlobalList[playlistName].slice()
        newPlaylist.push(this.props.navigation.state.params.program)
        let body = { "name": playlistName, "programs": newPlaylist }
        return axios({
            method: 'put',
            url: url,
            data: body
        }).then((response) => response.data).then((data) => {
            this.setState({
                playlists: data
            })
            Toast.show({
                type: 'success',
                visibilityTime: 1000,
                autoHide: true,
                position: 'bottom',
                text1: 'La playlist a été modifiée'
            });
            this.props.navigation.navigate("ProgramContainer")
            const update_programs = { type: "UPDATE_PLAYLISTS", value: this.state.playlists }
            this.props.navigation.state.params.refreshFunction()
            this.props.dispatch(update_programs)

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

    _renderPlaylist(item) {
        return (
            <View style={styles.main_container}>
                <Text style={styles.playlist_name}>{item.item}</Text>
                <View style={styles.button_container} >
                    <Button title="Ajouter à cette playlist" onPress={(item) => { this._addToPlaylist(item.item) }} />
                </View>
            </View>
        )
    }

    render() {
        return (
            <View>
                <FlatList
                    data={Object.keys(this.props.playlistsGlobalList)}
                    keyExtractor={(item, index) => 'key' + index}
                    renderItem={(item) => (
                        <View style={styles.main_container}>
                            <Text style={styles.playlist_name}>{item.item}</Text>
                            <View style={styles.button_container} >
                                <Button title="Ajouter à cette playlist" onPress={() => { this._addToPlaylist(item.item) }} />
                            </View>
                        </View>
                    )
                    }
                />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    main_container: {
        height: 90,
        flexDirection: 'row',
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        borderWidth: 2
    },
    playlist_name: {
        fontWeight: 'bold',
        fontSize: 17,
        marginLeft: 10,
        flex: 5,
        textAlignVertical: 'center'
    },
    button_container: {
        flex: 5,
        marginRight: 10,
        width: 30,
        justifyContent: 'center'
    }
})

const mapStateToProps = (state) => {
    return {
        runningProgram: state.runningProgram,
        programsGlobalList: state.programsGlobalList,
        playlistsGlobalList: state.playlistsGlobalList
    }
}

export default connect(mapStateToProps)(AddToPlaylist)