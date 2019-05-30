import PropTypes from 'prop-types'
import React from 'react'
import TestElement from 'ferly/components/TestElement'
import Theme from 'ferly/utils/theme'
import Avatar from 'ferly/components/Avatar'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {DrawerItems} from 'react-navigation'
import {logoHorizontal} from 'ferly/images/index'
import {urls} from 'ferly/utils/fetch'
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
              <Avatar
                size={100}
                firstWord={firstName}
                secondWord={lastName}
                pictureUrl={profileImage} />
              <Text style={styles.text}>{`${firstName} ${lastName}`}</Text>
            </TouchableOpacity>
          </View>
          <TestElement
            parent={DrawerItems}
            label='test-id-drawer-items'
            items={filteredItems}
            {...otherProps} />
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
  const apiStore = state.api.apiStore
  const {
    profile_image_url: profileImage,
    first_name: firstName = '',
    last_name: lastName = ''
  } = apiStore[urls.profile] || {}

  return {
    firstName,
    lastName,
    profileImage
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerContent)
