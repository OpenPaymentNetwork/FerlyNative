/* global __DEV__ */
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import {Constants} from 'expo'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'

export default class Settings extends React.Component {
  static navigationOptions = {
    title: 'Settings'
  };

  renderItem (title, description, onPress = null) {
    let icon
    if (onPress) {
      icon = (
        <Icon
          name="angle-right"
          color="gray"
          size={28} />
      )
    }

    return (
      <TouchableOpacity
        style={{height: 80}}
        disabled={onPress === null}
        onPress={onPress}>
        <View style={styles.sectionContainer}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          {icon}
        </View>
      </TouchableOpacity>
    )
  }

  render () {
    const {navigation} = this.props
    const devFlag = __DEV__ ? 'd' : 'p'
    const version = `${Constants.manifest.version}/${devFlag}`
    return (
      <View>
        {
          this.renderItem(
            'Account Recovery',
            'Because you don\'t want to lose anything.',
            () => navigation.navigate('Recovery')
          )
        }
        {this.renderItem('About', `Version ${version}`)}
      </View>
    )
  }
}

Settings.propTypes = {
  navigation: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    fontSize: 20
  },
  description: {
    fontSize: 16,
    color: 'gray',
    paddingLeft: 20
  },
  sectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8
  }
})
