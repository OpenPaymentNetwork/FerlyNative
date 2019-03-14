import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {Constants} from 'expo'
import {CreateAuthSwitch} from 'ferly/navigation'
import {createUrl} from 'ferly/utils/fetch'
import {logoWhite} from 'ferly/images/index'
import {View, Text, Image} from 'react-native'

export class AppEntry extends React.Component {
  componentDidMount () {
    this.props.apiRequire(this.props.isUserUrl)
  }

  render () {
    const {auth, hasError} = this.props
    let errorMessage
    if (hasError) {
      errorMessage = <Text style={{color: 'red'}}>Connection Error</Text>
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
  hasError: PropTypes.bool,
  isUserUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const {releaseChannel = 'staging'} = Constants.manifest
  const isUserUrl = createUrl('is-user', {'expected_env': releaseChannel})
  const apiStore = state.api.apiStore
  const isUser = apiStore[isUserUrl] || {}
  const {is_user: auth} = isUser
  const hasError = JSON.stringify(isUser) !== '{}'

  return {
    auth,
    hasError,
    isUserUrl
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(AppEntry)
