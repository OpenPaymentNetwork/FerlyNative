import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {Alert, View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {
  tutorialFour,
  tutorialFive
} from 'ferly/images/index';

export class Tutorial extends React.Component {
  static navigationOptions = {
    title: 'Tutorial'
  };

  constructor (props) {
    super(props);
    this.state = {page: 0};
  }

  nextPage = () => {
    timeout = setTimeout(() => {
      this.setState({page: this.state.page === 0 ? +1 : 0});
    }, 5000);
  }

  componentWillUnmount () {
    clearInterval(timeout);
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
    count++;
    if (count < 2) {
      const text = {'text': 'Tutorial'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    if (count >= 2) {
      count = 0;
    }
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
          <View style={{justifyContent: 'center'}}>
            <Text style={[styles.text, {fontSize: 20}]}>
              Already have a Ferly Card?
            </Text>
            <TouchableOpacity
              style={{alignItems: 'center'}} onPress={() => navigation.navigate('NewCardForm')}>
              <Text style={{color: Theme.darkBlue, fontSize: 18, paddingBottom: 20}}>
                Activate It
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

let timeout = 0;
let count = 0;

Tutorial.propTypes = {
  navigation: PropTypes.object.isRequired,
  deviceToken: PropTypes.string.isRequired
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

function mapStateToProps (state) {
  const {initialExpoToken, deviceToken} = state.settings;
  return {
    initialExpoToken,
    deviceToken
  };
}

export default connect(mapStateToProps)(Tutorial);
