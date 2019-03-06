/* global __DEV__ */
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {Notifications, Permissions, Constants, Updates} from 'expo'
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native'

export class Settings extends React.Component {
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

  toggleDebug () {
    const {showDebug} = this.state
    this.setState({showDebug: !showDebug})
  }

  handleUpdateClick () {
    const buttons = [
      {text: 'No', onPress: null, style: 'cancel'},
      {text: 'Yes', onPress: () => Updates.reloadFromCache()}
    ]
    Alert.alert(
      'New version available',
      'Would you like to update to the newest version?',
      buttons
    )
  }

  render () {
    const {navigation, updateDownloaded} = this.props
    const {version, releaseChannel = 'default'} = Constants.manifest
    const envId = __DEV__ ? 'l' : releaseChannel.charAt(0)
    let debugInfo = (
      <View>
        <Text style={{fontSize: 12, color: 'lightgray'}}>
          did: {Constants.deviceId}
        </Text>
        <Text style={{fontSize: 12, color: 'lightgray'}}>
          pt: {this.state.expoToken.substring(18, 40)}
        </Text>
      </View>
    )

    const arrowIcon = (
      <Icon
        name="angle-right"
        color="gray"
        size={28} />
    )

    const updateIcon = (
      <Icon
        name="exclamation-circle"
        color="red"
        size={28} />
    )

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Recovery')}>
          <View style={styles.sectionContainer}>
            <View>
              <Text style={styles.title}>{'Account Recovery'}</Text>
              <Text style={styles.description}>
                {'Because you don\'t want to lose anything.'}
              </Text>
            </View>
            {arrowIcon}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          disabled={!updateDownloaded}
          onPress={this.handleUpdateClick.bind(this)}>
          <View style={styles.sectionContainer}>
            <View>
              <Text style={styles.title}>{'About'}</Text>
              <Text style={styles.description}>
                {`Version ${version}/${envId}`}
              </Text>
            </View>
            {updateDownloaded ? updateIcon : null}
          </View>
        </TouchableOpacity>
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
  navigation: PropTypes.object.isRequired,
  updateDownloaded: PropTypes.bool.isRequired
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
  },
  item: {
    height: 80
  }
})

function mapStateToProps (state) {
  const {updateDownloaded} = state.settings
  return {
    updateDownloaded
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
