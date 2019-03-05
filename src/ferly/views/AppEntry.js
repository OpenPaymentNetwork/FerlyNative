import PropTypes from 'prop-types'
import React from 'react'
import {CreateAuthSwitch} from 'ferly/navigation'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import Theme from 'ferly/utils/theme'
import {View, Text, Image} from 'react-native'
import {logoWhite} from 'ferly/images/index'

export class AppEntry extends React.Component {
  componentDidMount () {
    this.props.apiRequire(this.props.isUserUrl)
  }

  render () {
    const auth = this.props.auth
    let errorMessage
    if (this.props.error) {
      errorMessage = <Text style={{color: 'red'}}>{this.props.error}</Text>
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
      )
    }
    const Layout = CreateAuthSwitch(auth)
    return <Layout />
  }
}

AppEntry.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  auth: PropTypes.bool,
  error: PropTypes.string,
  isUserUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const isUserUrl = createUrl('is-user')
  const apiStore = state.api.apiStore
  const myWallet = apiStore[isUserUrl] || {}
  const auth = myWallet.is_user

  const errorString = JSON.stringify(myWallet)
  const error = errorString === '{}' ? '' : 'Connection Error'

  return {
    auth,
    error,
    isUserUrl
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(AppEntry)
