import Constants from 'expo-constants';
import PropTypes from 'prop-types';
import React from 'react';
import {apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {Notifications, Updates} from 'expo';
import {Platform, Alert, View, Text, Image} from 'react-native';
import { ConfirmDialog } from 'react-native-simple-dialogs';
import {updateDownloaded} from 'ferly/store/settings';
import {Present} from 'ferly/images/index';
import {urls} from 'ferly/utils/fetch';

class EventListener extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showDialog: false
    };
  }

  componentDidMount () {
    // Handle notifications that are received or selected while the app
    // is open. If the app was closed and then opened by tapping the
    // notification (rather than just tapping the app icon to open it),
    // this function will fire on the next tick after the app starts
    // with the notification data.
    this._notificationSubscription = (
      Notifications.addListener(this._handleNotification));

    // Create android notification channels.
    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('gift-received', {
        name: 'Gift Received',
        sound: true,
        vibrate: 750
      });
      Notifications.createChannelAndroidAsync('card-used', {
        name: 'Card Used',
        sound: true,
        vibrate: 500
      });
    }

    // Handle events related to downloading updates.
    this._updateSubscription = (
      Updates.addListener(this._handleUpdates));
  }

  _handleNotification = (notification) => {
    if (notification.data && notification.data.type === 'receive') {
      message = notification.data.message;
      amount = notification.data.amount;
      title = notification.data.title;
      sender = notification.data.from;
      this.setState({showDialog: true});
    }
    if (notification.data && notification.data.type === 'redemption_error') {
      Alert.alert('Oops!', 'An attempt to use your Ferly Card was unsuccessful.');
    }
    if (notification.data && notification.data.type === 'add') {
      title = notification.data.Titles[0];
      title2 = notification.data.Titles[1];
      amount = notification.data.amounts[0];
      reward = notification.data.amounts[1];
      if (!reward) {
        Alert.alert('Added!', `You added $${amount} of ${title} to your wallet.`);
      } else {
        Alert.alert('Added!', `You added $${amount} of ${title} to your wallet and earned ` +
        `$${reward} ${title2}.`);
      }
    }
    this.props.apiRefresh(urls.profile);
    this.props.apiRefresh(urls.history);
  };

  _handleUpdates = (event) => {
    if (event.type === Updates.EventType.DOWNLOAD_FINISHED) {
      if (event.manifest.version !== Constants.manifest.version) {
        this.props.updateDownloaded();
      }
    }
  }

  onClickOk () {
    this.setState({showDialog: false});
  }

  render () {
    if (this.state.showDialog) {
      return (
        <ConfirmDialog
          visible={this.state.showDialog}
          onTouchOutside={() => this.setState({showDialog: false})}
          positiveButton={{
            title: 'OK',
            onPress: () => this.onClickOk()
          }}>
          <View style={{alignItems: 'center'}}>
            <Image style={{height: 140, width: 140, marginBottom: 20}} source={Present}/>
            <Text style={{marginBottom: 10, fontSize: 22, fontWeight: 'bold'}}>
              Congrats!
            </Text>
            <Text style={{marginBottom: 10, fontSize: 16, color: 'gray'}}>
              {`${sender} gifted you ${amount} of ${title}.`}
            </Text>
            <Text style={{color: 'gray'}}>
              {!message ? null : '"' + message + '"'}
            </Text>
          </View>
        </ConfirmDialog>
      );
    } else {
      return this.props.children;
    }
  }
}

let reward = '';
let title2 = '';
let message = '';
let amount = '';
let title = '';
let sender = '';

EventListener.propTypes = {
  deviceToken: PropTypes.string,
  navigation: PropTypes.object,
  apiRefresh: PropTypes.func.isRequired,
  children: PropTypes.object.isRequired,
  updateDownloaded: PropTypes.func.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;

  return {
    deviceToken
  };
}

const mapDispatchToProps = {
  apiRefresh,
  updateDownloaded
};

export default connect(mapStateToProps, mapDispatchToProps)(EventListener);
