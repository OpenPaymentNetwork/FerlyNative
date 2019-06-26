import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native'
import {
  tutorialOne,
  tutorialTwo,
  tutorialThree,
  tutorialFour,
  tutorialFive,
  tutorialSix
} from 'ferly/images/index'

export default class Tutorial extends React.Component {
  constructor (props) {
    super(props)
    this.state = {page: 0}
  }

  exit = () => {
    this.props.navigation.navigate('Wallet')
  }

  nextPage = () => {
    this.setState({page: this.state.page + 1})
  }

  renderDots = () => {
    const {page} = this.state
    let dots = []
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={{
            borderRadius: 8,
            backgroundColor: i === page ? Theme.darkBlue : 'darkgray',
            height: i === page ? 13 : 10,
            width: i === page ? 13 : 10
          }} />
      )
    }
    return dots
  }

  renderPageControls () {
    let rightText = 'Next'
    let leftText = 'Skip'
    let onRightPress = this.nextPage
    const {page} = this.state
    if (page >= 5) {
      rightText = 'Got It'
      leftText = ''
      onRightPress = this.exit
    }
    return (
      <View style={{height: 50, flexDirection: 'row'}}>
        <TouchableOpacity
          style={styles.button}
          onPress={this.exit}>
          <Text style={styles.buttonText}>
            {leftText}
          </Text>
        </TouchableOpacity>
        <View style={styles.dots}>
          {this.renderDots()}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={onRightPress}>
          <Text style={[styles.buttonText, {position: 'absolute', right: 20}]}>
            {rightText}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  render () {
    const {page} = this.state

    const images = [
      tutorialOne,
      tutorialTwo,
      tutorialThree,
      tutorialFour,
      tutorialFive,
      tutorialSix
    ]

    const titles = [
      'Simplify the way you buy, give, and use gift cards.',
      'Buy Gift Value',
      'View & Manage Balances',
      'Activate the Ferly Card',
      'Use Your Ferly Card',
      'Send Gifts to Family & Friends'
    ]

    const descriptions = [
      '',
      'Purchase gift value anytime, anywhere from the in-app marketplace. ' +
      'Perfect for when stores are closed or for that last minute gift.',
      'Enjoy the convenience of managing your gift value balances in real ' +
      'time using a mobile app. Always know what brands you hold gift value ' +
      'for and how much.',
      'Pick up a Ferly Card at the many participating brands and activate ' +
      'it in your account from the Ferly Card menu option. Activation ' +
      'is simple and takes only a few minutes.',
      'Use your activated Ferly Card for any brand you hold gift value for, ' +
      'either in stores or online just like you would a regular debit card.',
      'Make their day special! Send the gift of their favorite brand ' +
      'along with a personalized message.'
    ]

    return (
      <View style={{
        flex: 1,
        backgroundColor: 'white'}}>
        <View style={styles.container}>
          <Image style={styles.image} source={images[page]} />
          <Text style={[
            styles.text, {
              marginBottom: 30,
              fontSize: 22,
              fontWeight: 'bold'}]}>
            {titles[page]}
          </Text>
          <Text style={[styles.text, {fontSize: 18}]}>
            {descriptions[page]}
          </Text>
        </View>
        {this.renderPageControls()}
      </View>
    )
  }
}

Tutorial.propTypes = {
  navigation: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    alignItems: 'center'
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'white',
    flexDirection: 'row',
    height: 50,
    flex: 1,
    paddingHorizontal: 20
  },
  buttonText: {
    color: Theme.darkBlue,
    fontSize: 20,
    fontWeight: 'bold'
  },
  image: {marginBottom: 65, height: 220, resizeMode: 'contain'},
  text: {textAlign: 'center', color: Theme.darkBlue}
})
