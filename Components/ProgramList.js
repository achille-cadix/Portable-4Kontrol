// Components/ProgramList.js

import React from 'react'
import { StyleSheet, View, Text, Image, FlatList } from 'react-native'
import ProgramItem from './ProgramItem'

class ProgramList extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            < FlatList style={styles.list_container}
                data={this.props.programs}
                keyExtractor={(item, index) => 'key' + index}
                renderItem={({ item }) => (<ProgramItem brightness={this.props.brightness} program={item} />)}
            />)
    }

}

const styles = StyleSheet.create({
    list_container: {
        marginLeft: 10
    }
})

export default ProgramList