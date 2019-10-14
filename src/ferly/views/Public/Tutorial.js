import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {
  tutorialFour,
  tutorialFive
} from 'ferly/images/index';

export default class LandingPage extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  constructor (props) {
    super(props);
    this.state = {page: 0};
  }

  nextPage = () => {
    setTimeout(() => {
      this.setState({page: this.state.page === 0 ? +1 : 0});
    }, 5000);
  }

  renderDots = () => {
    const {page} = this.state;
    let dots = [];
    for (let i = 0; i < 2; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.circle,
            {backgroundColor: i === page ? Theme.darkBlue : 'gray'}
          ]} />
      );
    }
    return dots;
  }

  render = () => {
    const {navigation} = this.props;
    const {page} = this.state;

    const images = [
      tutorialFour,
      tutorialFive
    ];

    const descriptions = [
      'Use the Ferly Card to spend the gift value in your wallet. ',
      'Select "Debit" when using your card and enter your personal PIN.'
    ];

    return (
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <View style={styles.container}>
          {this.nextPage()}
          <Text style={[styles.text, {fontSize: 22}]}>
            {descriptions[page]}
          </Text>
          <Image style={styles.image} source={images[page]} />
          <View style={styles.dots}>
            {this.renderDots()}
          </View>
        </View>
        <View style={{paddingVertical: 20, backgroundColor: Theme.yellow}}>
          <PrimaryButton
            title="Get a Ferly Card"
            color={Theme.lightBlue}
            onPress={() => navigation.navigate('AddressForm')} />
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={[styles.text, {paddingBottom: 30, fontSize: 20}]}>
              Already have a Ferly Card?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('NewCardForm')}>
              <Text style={{color: Theme.darkBlue, fontSize: 18, paddingLeft: 10}}>
                Activate It
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <Text style={{color: Theme.lightBlue, fontSize: 18, paddingLeft: 10}}>
                Skip
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    );
  }
}

LandingPage.propTypes = {
  navigation: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.yellow,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-around'
  },
  image: {height: 220, resizeMode: 'contain'},
  text: {textAlign: 'center'},
  dots: {flexDirection: 'row', justifyContent: 'space-around', width: 120},
  circle: {width: 12, height: 12, borderRadius: 6}
});
