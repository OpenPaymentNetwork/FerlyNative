import PropTypes from 'prop-types'
import React from 'react'
import ReCaptcha from 'react-native-recaptcha-v3'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

export class Recaptcha extends React.Component {
  componentDidMount () {
    this.props.apiRequire(this.props.recaptchaUrl)
  }

  onExecute (response) {
    this.props.onExecute(this.props.bypass || response)
  }

  render () {
    const {sitekey} = this.props
    if (!sitekey) {
      return null
    }

    return (
      <ReCaptcha
        recaptchaType='invisible'
        containerStyle={{}} // Empty overrides default style
        action="wallet"
        url="http://ferly.com"
        siteKey={sitekey}
        onExecute={(response) => this.onExecute(response)}
      />
    )
  }
}

Recaptcha.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  bypass: PropTypes.string,
  onExecute: PropTypes.func.isRequired,
  recaptchaUrl: PropTypes.string.isRequired,
  sitekey: PropTypes.string
}

function mapStateToProps (state) {
  const recaptchaUrl = createUrl('recaptcha-sitekey')
  const apiStore = state.apiStore
  const recaptchaInfo = apiStore[recaptchaUrl] || {}
  const {sitekey} = recaptchaInfo
  const bypass = recaptchaInfo.captcha_bypass

  return {
    recaptchaUrl,
    sitekey,
    bypass
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Recaptcha)
