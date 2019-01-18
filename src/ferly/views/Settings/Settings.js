/* global __DEV__ */
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import {Notifications, Permissions, Constants} from 'expo'
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'

export default class Settings extends React.Component {
  static navigationOptions = {
    title: 'Settings'
  };

  constructor (props) {
    super(props)
    this.state = {
      expoToken: '',
      showDebug: false
    }
  }

  componentDidMount () {
    this.getToken()
  }

  async getToken () {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    )

    if (existingStatus === 'granted') {
      let token = await Notifications.getExpoPushTokenAsync()
      this.setState({expoToken: token})
    }
  }

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

  toggleDebug () {
    const {showDebug} = this.state
    this.setState({showDebug: !showDebug})
  }

  render () {
    const {navigation} = this.props
    const devFlag = __DEV__ ? 'd' : 'p'
    const version = `${Constants.manifest.version}/${devFlag}`

    let debugInfo = (
      <View>
        <Text style={{fontSize: 12, color: 'lightgray'}}>
          did: {Constants.deviceId}
        </Text>
        <Text style={{fontSize: 12, color: 'lightgray'}}>
          et: {this.state.expoToken}
        </Text>
      </View>
    )

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        {
          this.renderItem(
            'Account Recovery',
            'Because you don\'t want to lose anything.',
            () => navigation.navigate('Recovery')
          )
        }
        {this.renderItem('About', `Version ${version}`)}
        <View style={{flexGrow: 1}} />
        <View style={{height: 40, flexDirection: 'row'}}>
          {this.state.showDebug ? debugInfo : null}
          <View style={{flexGrow: 1}} />
          <TouchableOpacity
            style={{width: 40, backgroundColor: 'white'}}
            onPress={() => this.toggleDebug()} />
        </View>
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
