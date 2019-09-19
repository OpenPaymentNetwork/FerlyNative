import PrimaryButton from 'ferly/components/PrimaryButton'
import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native'
import {
  tutorialTwo,
  tutorialThree,
  tutorialSix
} from 'ferly/images/index'

export default class LandingPage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      page: 0,
      isMounted: false,
      dataSource: [
        {
          title: 1
        }, {
          title: 2
        }
      ]
    }
  }

  componentDidMount () {
    this.interval = setInterval(() => {
      this.setState({
        page: this.state.page === this.state.dataSource.length ? 0 : this.state.page + 1
      })
    }, 5000)
  }

  componentWillUnmount () {
    this.interval && clearInterval(this.interval)
    this.interval = false
  }

  renderDots = () => {
    const {page} = this.state
    let dots = []
    for (let i = 0; i < 3; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.circle,
            {backgroundColor: i === page ? Theme.lightBlue : 'white'}
          ]} />
      )
    }
    return dots
  }

  render = () => {
    const {navigation} = this.props
    const {page} = this.state

    const images = [
      tutorialTwo,
      tutorialSix,
      tutorialThree
    ]

    const descriptions = [
      'Buy gift value anytime, anywhere, perfect for that last minute gift.',
      'Easily send gifts to friends and family, even those far away.',
      'Have real time access to gift card balances.'
    ]

    return (
      <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: Theme.darkBlue}}>
        <View style={styles.container}>
          <Text style={[styles.text, {fontSize: 18}]}>
            {descriptions[page]}
          </Text>
          <Image style={styles.image} source={images[page]} />
          <View style={styles.dots}>
            {this.renderDots()}
          </View>
        </View>
        <View style={{paddingVertical: 20}}>
          <PrimaryButton
            title="Sign Up"
            color={Theme.lightBlue}
            onPress={() => navigation.navigate('SignUp')} />
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={[styles.text, {paddingBottom: 30, fontSize: 18}]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecoveryChannel')}>
              <Text style={{color: Theme.lightBlue, fontSize: 18, paddingLeft: 10}}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

LandingPage.propTypes = {
  navigation: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-around'
  },
  image: {height: 220, resizeMode: 'contain'},
  text: {textAlign: 'center', color: 'white'},
  dots: {flexDirection: 'row', justifyContent: 'space-between', width: 120},
  circle: {width: 12, height: 12, borderRadius: 6}
})
