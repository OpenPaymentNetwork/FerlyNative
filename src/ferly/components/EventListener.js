import PropTypes from 'prop-types'
import React from 'react'
import {apiRefresh} from 'ferly/store/api'
import {connect} from 'react-redux'
import {urls} from 'ferly/utils/fetch'
import {Notifications, Updates, Constants} from 'expo'
import {Platform} from 'react-native'
import {updateDownloaded} from 'ferly/store/settings'

class EventListener extends React.Component {
  componentDidMount () {
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = (
      Notifications.addListener(this._handleNotification))

    // Create android notification channels.
    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('gift-received', {
        name: 'Gift Received',
        sound: true,
        vibrate: 750
      })
      Notifications.createChannelAndroidAsync('card-used', {
        name: 'Card Used',
        sound: true,
        vibrate: 500
      })
    }

    // Handle events related to downloading updates.
    this._updateSubscription = (
      Updates.addListener(this._handleUpdates))
  }

  _handleNotification = (notification) => {
    if (notification.origin === 'received') {
      this.props.apiRefresh(urls.profile)
      this.props.apiRefresh(urls.history)
    }
  };

  _handleUpdates = (event) => {
    if (event.type === Updates.EventType.DOWNLOAD_FINISHED) {
      if (event.manifest.version !== Constants.manifest.version) {
        this.props.updateDownloaded()
      }
    }
  }

  render () {
    return this.props.children
  }
}

EventListener.propTypes = {
  apiRefresh: PropTypes.func.isRequired,
  children: PropTypes.object.isRequired,
  updateDownloaded: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {}
}

const mapDispatchToProps = {
  apiRefresh,
  updateDownloaded
}

export default connect(mapStateToProps, mapDispatchToProps)(EventListener)
