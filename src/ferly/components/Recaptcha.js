import PropTypes from 'prop-types';
import React from 'react';
import ReCaptcha from 'react-native-recaptcha-v3';
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

  render () {
    const {sitekey, action, bypass} = this.props;
    if (!sitekey || bypass) {
      return null;
    }
    return (
      <ReCaptcha
        recaptchaType='invisible'
        containerStyle={{}} // Empty overrides default style
        action={action}
        // On some iOS versions, this opens the url in the browser. Broken.
        // react-native-recaptcha-v3/index.js line 85. version 0.0.16
        // the slash at the end prevents this
        url="http://ferlyapi.com/"
        siteKey={sitekey}
        onExecute={(response) => this.onExecute(response)}
      />
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
