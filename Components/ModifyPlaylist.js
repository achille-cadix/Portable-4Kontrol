// Component/ModifyPlaylist.js

import React from 'react';
import { Button, StyleSheet, View, TouchableOpacity, Text, Easing, Animated, LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { connect } from 'react-redux';
import axios from 'axios';
import DraggableFlatList from "react-native-draggable-flatlist";

LogBox.ignoreLogs(['Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`']);

class Row extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            active: false,
            disabledButton: false
        }
    }

    _handleDelete(program) {
        this.props.deleteFunction(program)
        this.setState({
            disabledButton: true
        })
    }

    render() {
        return (
            <TouchableOpacity
                style={styles.row}
                onLongPress={this.props.drag}
                delayLongPress={200}
            >
                <Text style={styles.rowText} >
                    {this.props.programName.replace('.py', '')}
                </Text>
                <Button title="supprimer" color="red" style={styles.rowButton} disabled={this.state.disabledButton} onPress={() => { this._handleDelete(this.props.programName) }} />
            </TouchableOpacity>
        );
    };
}


class ModifyPlaylist extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            playlistName: this.props.navigation.state.params.playlistName,
            programsList: this.props.navigation.state.params.programsList,
            programsOrder: [],
            toDeleteList: []
        }
    }

    _updatePlaylist() {
        let url = 'http://192.168.1.37:8080/playlists/' + this.state.playlistName
        let newPlaylist = this.state.programsList.filter(x => !this.state.toDeleteList.includes(x))
        let body = { "name": this.state.playlistName, "programs": newPlaylist }
        console.log(body)
        return axios({
            method: 'put',
            url: url,
            data: body
        }).then((response) => response.data).then((data) => {
            Toast.show({
                type: 'success',
                visibilityTime: 1000,
                autoHide: true,
                position: 'bottom',
                text1: 'La playlist a été modifiée'
            })
            this.props.navigation.state.params.refreshFunction()
            const update_playlists = { type: "UPDATE_PLAYLISTS", value: data }
            this.props.dispatch(update_playlists)
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


    _deleteProgram = (programToDelete) => {
        console.log(programToDelete)
        let newToDelete = this.state.toDeleteList.slice()
        newToDelete.push(programToDelete)
        this.setState({
            toDeleteList: newToDelete
        })
    }

    renderItem = ({ item, index, drag, isActive }) => {
        return (
            <Row
                programName={item}
                index={index}
                drag={drag}
                deleteFunction={this._deleteProgram}
            />
        )
    }

    render() {
        return (
            <View style={styles.main_container}>
                <DraggableFlatList
                    style={styles.programs_list}
                    data={this.state.programsList}
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => `draggable-item-${item}`}
                    onDragEnd={({ data }) => { this.setState({ programsList: data }) }}
                />
                <View style={styles.validate_button_container}>
                    <Button title="valider la playlist" color="green" onPress={() => { this._updatePlaylist() }} />
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    main_container: {
        flex: 1,
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        flexDirection: 'column'
    },
    programs_list: {
        marginBottom: 5,
        flex: 10
    },
    validate_button_container: {
        marginTop: 5,
        marginBottom: 5,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        height: 70,
        flex: 1,
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 4,
        marginLeft: 5,
        marginRight: 5,
        flexDirection: 'row'
    },
    rowText: {
        flex: 4
    },
    rowButton: {
        flex: 3
    }
})

const mapStateToProps = (state) => {
    return {
        runningProgram: state.runningProgram,
        programsGlobalList: state.programsGlobalList,
        playlistsGlobalList: state.playlistsGlobalList
    }
}

export default connect(mapStateToProps)(ModifyPlaylist)