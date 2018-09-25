import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import {CreateAuthSwitch} from 'ferly/navigation'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import Theme from 'ferly/utils/theme'
import {StyleSheet, View, Text, Image} from 'react-native'
import {logoWhite} from 'ferly/images/index'

export class AppEntry extends React.Component {
  componentDidMount () {
    this.props.apiRequire(this.props.isUserUrl)
  }

  render () {
    const auth = this.props.auth
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
  isUserUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const isUserUrl = createUrl('is-user')
  const apiStore = state.apiStore
  const myWallet = apiStore[isUserUrl] || {}
  const isUser = myWallet.is_user

  let auth
  if (Object.keys(myWallet).length !== 0) {
    auth = isUser
  }

  return {
    auth,
    isUserUrl
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(AppEntry)
