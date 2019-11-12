import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {CreateAuthSwitch} from 'ferly/navigation';
import {Alert, AsyncStorage} from 'react-native';
import {setDeviceToken} from 'ferly/store/settings';
import { setIsCustomer } from '../store/settings';

export class AppEntry extends React.Component {
  componentDidMount () {
    this.retrieveData().then((deviceToken2) => {
      if (deviceToken2 === '') {
        AsyncStorage.setItem('deviceToken', device);
        deviceToken2 = device;
      }
      try {
        this.props.dispatch(setDeviceToken(deviceToken2));
      } catch (error) {
      }
    }).catch((error) => {
      Alert.alert('Oops!', error);
    });
    this.retrieveIsCustomer();
  }

  retrieveData = async () => {
    try {
      const deviceToken = await AsyncStorage.getItem('deviceToken') || '';
      if (deviceToken !== '') {
        deviceToken2 = deviceToken;
      }
      return deviceToken2;
    } catch (error) {
      console.log('error', error);
    }
  }

  retrieveIsCustomer = async () => {
    try {
      const isCustomer = await AsyncStorage.getItem('isCustomer') || '';
      if (isCustomer === 'true') {
        this.props.dispatch(setIsCustomer(true));
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  render () {
    const {isCustomer} = this.props;
    const Layout = CreateAuthSwitch(isCustomer);
    return <Layout />;
  }
}

var deviceToken2 = '';
let device = makeid(32);
function makeid (length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

AppEntry.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isCustomer: PropTypes.bool,
  auth: PropTypes.bool,
  hasError: PropTypes.bool
};

function mapStateToProps (state) {
  const {deviceToken, isCustomer} = state.settings;
  return {
    idFound: true,
    deviceToken,
    isCustomer
  };
}

export default connect(mapStateToProps)(AppEntry);
