import PropTypes from 'prop-types'
import React from 'react'
import {apiRefresh} from 'ferly/store/api'
import {updateDownloaded} from 'ferly/store/settings'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {Notifications, Updates, Constants} from 'expo'

class EventListener extends React.Component {
  componentDidMount () {
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = (
      Notifications.addListener(this._handleNotification))

    // Handle events related to downloading updates.
    this._updateSubscription = (
      Updates.addListener(this._handleUpdates))
  }

  _handleNotification = (notification) => {
    if (notification.origin === 'received') {
      this.props.apiRefresh(createUrl('wallet'))
      this.props.apiRefresh(createUrl('history'))
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
