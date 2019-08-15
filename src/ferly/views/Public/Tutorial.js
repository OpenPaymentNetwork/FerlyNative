import PropTypes from 'prop-types'
import React from 'react'
import Theme from 'ferly/utils/theme'
import AppIntroSlider from 'react-native-app-intro-slider'
import {View, Text, Image, StyleSheet} from 'react-native'
import {
  tutorialOne,
  tutorialTwo,
  tutorialThree,
  tutorialFour,
  tutorialFive,
  tutorialSix
} from 'ferly/images/index'

const slides = [
  {
    key: 'slide1',
    title: 'Welcome to Ferly',
    text: 'Simplify the way you buy, give, and use gift cards.',
    image: tutorialOne
  },
  {
    key: 'slide2',
    title: 'Buy Gift Value',
    text:
      'Purchase gift value anytime, anywhere from the in-app marketplace. ' +
      'Perfect for when stores are closed or for that last minute gift.',
    image: tutorialTwo
  },
  {
    key: 'slide3',
    title: 'Send Gifts to Others',
    text:
      'Make their day special! Send the gift of their favorite brand ' +
      'along with a personalized message.',
    image: tutorialSix
  },
  {
    key: 'slide4',
    title: 'View & Manage Balances',
    text:
      'Enjoy the convenience of managing your gift value balances in real ' +
      'time using a mobile app. Always know what brands you hold gift value ' +
      'for and how much.',
    image: tutorialThree
  },
  {
    key: 'slide5',
    title: 'Activate the Ferly Card',
    text:
      'Use the Ferly Card option in the menu and let us know where to mail ' +
      'your card. Activate your card when it arrives and create a PIN.',
    image: tutorialFour
  },
  {
    key: 'slide6',
    title: 'Use Your Ferly Card',
    text:
      'Use your activated Ferly Card for any brand you hold gift value for, ' +
      'just like you would a regular debit card.',
    image: tutorialFive
  }
]

export default class Tutorial extends React.Component {
  constructor (props) {
    super(props)
    this.state = {page: 0}
  }

  onDone = () => {
    this.props.navigation.navigate('Wallet')
  }

  renderItem = (item) => {
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <Image style={styles.image} source={item.item.image} />
          <Text style={[styles.text, {fontSize: 24, fontWeight: 'bold'}]}>
            {item.item.title}
          </Text>
          <Text style={[styles.description, {fontSize: 18}]}>
            {item.item.text}
          </Text>
          <View style={{flexGrow: 0.1}} />
        </View>
      </View>
    )
  }

  render () {
    return (
      <AppIntroSlider
        renderItem={this.renderItem}
        slides={slides}
        onDone={this.onDone}/>
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
  description: {textAlign: 'center', color: 'lightgray'},
  text: {textAlign: 'center', color: 'white'},
  dots: {flexDirection: 'row', justifyContent: 'space-between', width: 120},
  circle: {width: 12, height: 12, borderRadius: 6}
})
