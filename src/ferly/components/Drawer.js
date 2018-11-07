import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import UserAvatar from 'ferly/components/UserAvatar'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {DrawerItems} from 'react-navigation'
import {logoHorizontal} from 'ferly/images/index'
import {
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  View
} from 'react-native'

class DrawerContent extends React.Component {
  // constructor (props) {
  //   super(props)
  //   // the drawer and wallet page both load at once, so don't double require
  //   // unless we have a 'fetching' status in the api store meta
  //   props.apiRequire(props.walletUrl)
  // }

  render () {
    const {items, ...otherProps} = this.props
    const {navigation, firstName, lastName, profileImage} = this.props
    const filteredItems = items.filter(item => item.key !== 'Profile')
    return (
      <ScrollView>
        <SafeAreaView
          style={styles.container}
          forceInset={{ top: 'always', horizontal: 'never' }}>
          <View style={styles.innerContainer}>
            <Image source={logoHorizontal} style={styles.image} />
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <UserAvatar
                firstName={firstName}
                lastName={lastName}
                profileImage={profileImage} />
              <Text style={styles.text}>{`${firstName} ${lastName}`}</Text>
            </TouchableOpacity>
          </View>
          <DrawerItems items={filteredItems} {...otherProps} />
        </SafeAreaView>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  image: {width: 90, height: 32, marginTop: 40, marginBottom: 18},
  text: {color: 'white', fontSize: 24, paddingVertical: 18},
  innerContainer: {backgroundColor: Theme.darkBlue, paddingHorizontal: 18}
})

DrawerContent.propTypes = {
  firstName: PropTypes.string,
  items: PropTypes.array.isRequired,
  lastName: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  profileImage: PropTypes.string
}

function mapStateToProps (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.apiStore
  const myWallet = apiStore[walletUrl] || {}
  const {profileImage} = myWallet
  const firstName = myWallet.first_name || ''
  const lastName = myWallet.last_name || ''

  return {
    walletUrl,
    firstName,
    lastName,
    profileImage
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent)
