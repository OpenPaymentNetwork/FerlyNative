import PropTypes from 'prop-types'
import React from 'react'
import {apiRefresh} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {Notifications} from 'expo'

class EventListener extends React.Component {
  // state = {
  //   notification: {}
  // };

  componentDidMount () {
    // make sure we have permission to show notifications

    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = (
      Notifications.addListener(this._handleNotification))
  }

  _handleNotification = (notification) => {
    // this.setState({notification: notification})
    if (notification.origin === 'received') {
      this.props.apiRefresh(createUrl('wallet'))
      this.props.apiRefresh(createUrl('history'))
    }
  };

  render () {
    return this.props.children
  }
}

EventListener.propTypes = {
  apiRefresh: PropTypes.func.isRequired,
  children: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {}
}

const mapDispatchToProps = {
  apiRefresh
}

export default connect(mapStateToProps, mapDispatchToProps)(EventListener)
