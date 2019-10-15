import Constants from 'expo-constants';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {CreateAuthSwitch} from 'ferly/navigation';
import {createUrl} from 'ferly/utils/fetch';
import {logoWhite} from 'ferly/images/index';
import {View, Text, Image, AsyncStorage} from 'react-native';
import {setPassword} from 'ferly/store/settings';

export class AppEntry extends React.Component {
  componentDidMount () {
    this.props.dispatch(apiRequire(this.props.isCustomerUrl));
    this.retrieveData().then((password2) => {
      if (password2 === '') {
        AsyncStorage.setItem('password', device);
        password2 = device;
      }
      try {
        this.props.dispatch(setPassword(password2));
      } catch (error) {
      }
    });
  }

  retrieveData = async () => {
    try {
      const password = await AsyncStorage.getItem('password') || '';
      if (password !== '') {
        password2 = password;
      }
      return password2;
    } catch (error) {
    }
  }

  render () {
    let errorMessage;
    const {auth, hasError} = this.props;
    if (hasError) {
      errorMessage = <Text style={{color: 'red'}}>Connection Error</Text>;
    }
    if (auth === undefined) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Theme.darkBlue
          }}>
          <Image source={logoWhite} style={{height: 140, width: 150}}/>
          {errorMessage}
        </View>
      );
    }
    const Layout = CreateAuthSwitch(auth);
    return <Layout />;
  }
}

var password2 = '';
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
  auth: PropTypes.bool,
  hasError: PropTypes.bool,
  isCustomerUrl: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {password} = state.settings;
  const {releaseChannel = 'staging'} = Constants.manifest;
  const isCustomerUrl =
      createUrl('is-customer', {'expected_env': releaseChannel});
  const apiStore = state.api.apiStore;
  const isCustomer = apiStore[isCustomerUrl] || {};
  const {is_customer: auth} = isCustomer;
  const hasError = isCustomer === 'TypeError: Network request failed';
  return {
    auth,
    hasError,
    isCustomerUrl,
    idFound: true,
    password
  };
}

export default connect(mapStateToProps)(AppEntry);
