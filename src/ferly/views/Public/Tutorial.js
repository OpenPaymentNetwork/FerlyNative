import PrimaryButton from 'ferly/components/PrimaryButton'
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
          style={[
            styles.circle,
            {backgroundColor: i === page ? 'white' : 'darkgray'}
          ]} />
      )
    }
    return dots
  }

  renderButtons () {
    const {page} = this.state
    if (page >= 5) {
      return (
        <PrimaryButton
          title="GET STARTED"
          color={Theme.lightBlue}
          onPress={this.exit} />
      )
    } else {
      return (
        <View style={{height: 50, flexDirection: 'row'}}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              backgroundColor: Theme.lightBlue,
              flexDirection: 'row',
              height: 50,
              flex: 1,
              justifyContent: 'center'
            }}
            onPress={this.exit}>
            <Text style={{color: 'white', fontSize: 20}}>SKIP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              backgroundColor: Theme.lightBlue,
              flexDirection: 'row',
              height: 50,
              flex: 1,
              justifyContent: 'center'
            }}
            onPress={this.nextPage}>
            <Text style={{color: 'white', fontSize: 20}}>NEXT</Text>
          </TouchableOpacity>
        </View>
      )
    }
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
      'Welcome to Ferly',
      'Buy Gift Value',
      'View & Manage Balances',
      'Activate the Ferly Card',
      'Use Your Ferly Card',
      'Send Gifts to Family & Friends'
    ]

    const descriptions = [
      'Simplify the way you buy, give, and use gift cards.',
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
      <View style={styles.page}>
        <View style={styles.container}>
          <Image style={styles.image} source={images[page]} />
          <Text style={[styles.text, {fontSize: 26, fontWeight: 'bold'}]}>
            {titles[page]}
          </Text>
          <Text style={[styles.text, {fontSize: 18}]}>
            {descriptions[page]}
          </Text>
          <View style={{flexGrow: 0.2}} />
          <View style={styles.dots}>
            {this.renderDots()}
          </View>
        </View>
        {this.renderButtons()}
      </View>
    )
  }
}

Tutorial.propTypes = {
  navigation: PropTypes.object.isRequired
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: Theme.darkBlue
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Theme.darkBlue,
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-around'
  },
  image: {height: 220, resizeMode: 'contain'},
  text: {textAlign: 'center', color: 'white'},
  dots: {flexDirection: 'row', justifyContent: 'space-between', width: 120},
  circle: {width: 12, height: 12, borderRadius: 6}
})
