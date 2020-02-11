import PropTypes from 'prop-types';
import React from 'react';
import ConfirmGoogleCaptcha from 'react-native-google-recaptcha-v2';
import {View} from 'react-native';
import {apiRequire} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl} from 'ferly/utils/fetch';

export class Recaptcha extends React.Component {
  componentDidMount () {
    const {apiRequire, recaptchaUrl, bypass, onExecute} = this.props;
    apiRequire(recaptchaUrl);
    if (onExecute && bypass) {
      onExecute(bypass);
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const {bypass, onExecute} = this.props;
    if (!prevProps.bypass && bypass) {
      onExecute(bypass);
    }
  }

  onExecute (response) {
    this.props.onExecute(this.props.bypass || response);
  }

  onMessage = event => {
    if (event && event.nativeEvent.data) {
      if (['cancel', 'error', 'expired'].includes(event.nativeEvent.data)) {
        this.captchaForm.hide();
      } else {
        this.onExecute(event.nativeEvent.data);
      }
    }
  };

  render () {
    const {sitekey, bypass} = this.props;
    if (!sitekey || bypass) {
      return null;
    }
    return (
      <View>
        <ConfirmGoogleCaptcha
          // eslint-disable-next-line no-return-assign
          ref={_ref => this.captchaForm = _ref}
          siteKey={sitekey}
          baseUrl='https://ferlyapi.bridge.opn.bank/'
          languageCode='en'
          onMessage={this.onMessage}
        />
      </View>
    );
  }
}

Recaptcha.propTypes = {
  action: PropTypes.string.isRequired,
  apiRequire: PropTypes.func.isRequired,
  bypass: PropTypes.string,
  onExecute: PropTypes.func.isRequired,
  recaptchaUrl: PropTypes.string.isRequired,
  sitekey: PropTypes.string
};

function mapStateToProps (state) {
  const recaptchaUrl = createUrl('recaptcha-sitekey');
  const apiStore = state.api.apiStore;
  const recaptchaInfo = apiStore[recaptchaUrl] || {};
  const {sitekey} = recaptchaInfo;
  const bypass = recaptchaInfo.captcha_bypass;

  return {
    recaptchaUrl,
    sitekey,
    bypass
  };
}

const mapDispatchToProps = {
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Recaptcha);
