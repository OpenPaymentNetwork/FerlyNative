import ProfileDisplay from 'ferly/components/ProfileDisplay'
import PropTypes from 'prop-types'
import React from 'react'
import {DrawerItems} from 'react-navigation'
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'

class DrawerContent extends React.Component {
  // constructor (props) {
  //   super(props)
  //   // the drawer and wallet page both load at once, so don't double require
  //   // unless we have a 'fetching' status in the api store meta
  //   props.apiRequire(props.walletUrl)
  // }

  render () {
    const {items, ...otherProps} = this.props
    const {navigation, title, profileImage} = this.props
    const filteredItems = items.filter(item => item.key !== 'Profile')
    return (
      <ScrollView>
        <SafeAreaView
          style={styles.container}
          forceInset={{ top: 'always', horizontal: 'never' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <ProfileDisplay
              name={title}
              url={profileImage} />
          </TouchableOpacity>
          <DrawerItems items={filteredItems} {...otherProps} />
        </SafeAreaView>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

DrawerContent.propTypes = {
  items: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  profileImage: PropTypes.string,
  title: PropTypes.string
}

function mapStateToProps (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.apiStore
  const myWallet = apiStore[walletUrl] || {}
  const {title, profileImage} = myWallet

  return {
    walletUrl,
    title,
    profileImage
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent)
