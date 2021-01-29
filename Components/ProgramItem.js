// Components/ProgramItem.js

import React from 'react'
import { StyleSheet, View, Text, Button, ActivityIndicator, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

class ProgramItem extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            active: false,
            selectedWheel: 'defaultWheel.py'
        }
    }

    _launchProgram() {
        const actionToggle = { type: "TOGGLE_PROGRAM", value: this.props.program }
        this.props.dispatch(actionToggle)
        let url = '/program?name=' + this.props.program.replace('.py', '') + '&brightness=' + this.props.brightness + '&wheel=' + this.state.selectedWheel.replace('.py', '');
        console.log(url)
        this.props.client.post(url).then((response) => {
            Toast.show({
                type: 'success',
                visibilityTime: 3000,
                autoHide: true,
                position: 'bottom',
                text1: 'Le programme ' + this.props.program.replace('.py', '') + ' est lancé'
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
            const actionStop = { type: "STOP_PROGRAM", value: this.props.program }
            this.props.dispatch(actionStop)
        })
    }

    _displayRunning() {
        if (this.props.runningProgram === this.props.program) {
            return (
                <View style={styles.loading_container}>
                    <ActivityIndicator size='large' color='blue' />
                </View>
            )
        }
    }

    _getWheels = () => {
        return this.props.wheelsList?.map((item) => {
            return (
                <Picker.Item label={item} value={item} key={item} />
            )
        })

    }

    render() {

        return (
            <TouchableOpacity style={styles.main_container} onPress={() => { this._launchProgram() }}>
                <Text style={styles.program_name}>{this.props.program.replace('.py', '')}</Text>
                <View style={styles.running_contaner}>
                    {this._displayRunning()}
                </View>
                <View style={styles.button_container} >
                    <Picker selectedValue={this.state.selectedWheel} onValueChange={(itemValue, itemIndex) => this.setState({ selectedWheel: itemValue })}>
                        {this._getWheels()}
                    </Picker>
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
        flex: 6,
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

export default connect(mapStateToProps)(ProgramItem)