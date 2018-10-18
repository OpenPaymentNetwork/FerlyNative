import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {View, Text, Image, StyleSheet} from 'react-native'

class Profile extends React.Component {
  static navigationOptions = {
    title: 'Profile'
  };

  componentDidMount () {
    this.props.apiRequire(this.props.walletUrl)
  }

  renderAvatar () {
    const {title, profileImage} = this.props

    if (profileImage) {
      return (
        <Image style={styles.avatarContainer} source={{uri: profileImage}} />)
    } else {
      return (
        <View style={[styles.avatarContainer, styles.profileText]}>
          <Text style={{fontSize: 34, color: 'gray'}}>
            {title.charAt(0) + title.charAt(title.indexOf(' ') + 1)}
          </Text>
        </View>
      )
    }
  }

  render () {
    const {title} = this.props

    return (
      <View style={{flex: 1}}>
        <View style={styles.topView}>
          <View></View>
          {this.renderAvatar()}
          <Text style={styles.name}>{title}</Text>
        </View>
        <View style={{flex: 1, backgroundColor: 'white'}}>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70
  },
  profileText: {
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center'
  },
  topView: {
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: Theme.darkBlue,
    alignItems: 'center'
  },
  name: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white'
  }
})

Profile.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  profileImage: PropTypes.string,
  title: PropTypes.string,
  walletUrl: PropTypes.string.isRequired
}

function mapStateToProps (state) {
  const walletUrl = createUrl('wallet')
  const apiStore = state.apiStore
  const myWallet = apiStore[walletUrl] || {}
  const {amounts, title, profileImage} = myWallet

  return {
    walletUrl,
    amounts,
    title,
    profileImage
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
