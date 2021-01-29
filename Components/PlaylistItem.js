// Components/ProgramItem.js

import React from 'react'
import { StyleSheet, View, Text, Button, ActivityIndicator, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux';
import Toast from 'react-native-toast-message';

class PlaylistItem extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            active: false
        }
    }

    _launchPlaylist() {
        const actionToggle = { type: "TOGGLE_PROGRAM", value: this.props.playlist }
        this.props.dispatch(actionToggle)
        let url = '/playlists/' + this.props.playlist + '/run?brightness=' + this.props.brightness + '&duration=20'
        this.props.client.post(url).then((response) => {
            Toast.show({
                type: 'success',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'La playlist ' + this.props.playlist + ' est lancée'
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
            const actionStop = { type: "STOP_PROGRAM", value: this.props.playlist }
            this.props.dispatch(actionStop)
        })
    }

    _deletePlaylist() {
        let url = '/playlists/' + this.props.playlist
        this.props.client.delete(url).then((response) => {
            Toast.show({
                type: 'success',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'La playlist ' + this.props.playlist + ' a été supprimée'
            })
            this.props.refreshFunction()
        }).catch((error) => {
            Toast.show({
                type: 'error',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'Erreur : pas de réponse du serveur',
                text2: 'Veuillez vérifier que vous êtes bien connecté au Wifi du 4K'
            });
            const actionStop = { type: "STOP_PROGRAM", value: this.props.playlist }
            this.props.dispatch(actionStop)
        })
    }

    _displayRunning() {
        if (this.props.runningProgram === this.props.playlist) {
            return (
                <View style={styles.loading_container}>
                    <ActivityIndicator size='large' color='blue' />
                </View>
            )
        }
    }

    _modifyPlaylist() {
        this.props.navigation.navigate("ModifyPlaylist",
        {playlistName:this.props.playlist,programsList:this.props.programsInPlaylist,refreshFunction:this.props.refreshFunction})
    }

    render() {
        return (
            <TouchableOpacity style={styles.main_container} onPress={() => { this._launchPlaylist() }}>
                <Text style={styles.program_name}>{this.props.playlist}</Text>
                <View style={styles.running_contaner}>
                    {this._displayRunning()}
                </View>
                <View style={styles.button_container} >
                    <View style={styles.small_buttons}>
                        <Button title="Modifier" color='green' onPress={() => { this._modifyPlaylist() }} />
                    </View>
                    <View style={styles.small_buttons}>
                        <Button title="supprimer" color='red' onPress={() => { this._deletePlaylist() }} />
                    </View>
                </View>
            </TouchableOpacity>
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
    running_contaner: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        justifyContent: 'center'
    },
    program_name: {
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
        justifyContent: 'center',
        flexDirection: 'column'
    },
    small_buttons: {
        flex: 1,
        justifyContent: 'center'
    }
})

const mapStateToProps = (state) => {
    return {
        runningProgram: state.runningProgram
    }
}

export default connect(mapStateToProps)(PlaylistItem)