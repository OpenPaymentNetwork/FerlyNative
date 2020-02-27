import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {Notifications} from 'expo';
import {setInitialExpoToken} from 'ferly/store/settings';
import {View, Text, Image, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {envId} from 'ferly/utils/fetch';
import {
  tutorialTwo,
  tutorialThree,
  tutorialSix
} from 'ferly/images/index';

export class LandingPage extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      time: 0,
      page: 0,
      // expoToken: '',
      dataSource: [
        {
          title: 1
        }, {
          title: 2
        }
      ]
    };
  }

  componentDidMount () {
    this.getToken().then((response) => {
      this.props.dispatch(setInitialExpoToken(response));
    })
      .catch((error) => {
        console.log('Unable to get expo token', error);
      });
    interval = setInterval(() => {
      this.setState({
        page: this.state.page === this.state.dataSource.length ? 0 : this.state.page + 1,
        time: this.state.time + 1
      });
    }, 5000);
  }

  componentWillUnmount () {
    clearInterval(interval);
  }

  async getToken () {
    try {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );

      let finalStatus = existingStatus;
      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt a second time.
      if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        let token = await Notifications.getExpoPushTokenAsync();
        expoToken = token;
        return token;
      }
    } catch (error) {
      console.log('Unable to get expo token');
    }
  }

  versionCode () {
    const {version} = Constants.manifest;
    if (envId === 's') {
      return (
        <Text style={{alignSelf: 'flex-end'}}>
          {`${version}/${envId}`}
        </Text>
      );
    } else {
      return null;
    }
  }

  renderDots () {
    const {page} = this.state;
    let dots = [];
    for (let i = 0; i < 3; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.circle,
            {backgroundColor: i === page ? Theme.lightBlue : 'white'}
          ]} />
      );
    }
    return dots;
  }

  render () {
    const {navigation} = this.props;
    const {page} = this.state;

    const passParams = {
      expoToken: expoToken
    };

    const images = [
      tutorialTwo,
      tutorialSix,
      tutorialThree
    ];

    const descriptions = [
      'Buy gift value anytime, anywhere, perfect for that last minute gift.',
      'Easily send gifts to friends and family, even those far away.',
      'Have real time access to gift card balances.'
    ];

    return (
      <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: Theme.darkBlue}}>
        <View style={styles.container}>
          <Text style={[styles.text, {fontSize: width > 600 ? 22 : 18}]}>
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
            onPress={() => navigation.navigate('SignUp', passParams)} />
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <Text style={[styles.text, {paddingBottom: 30, fontSize: width > 600 ? 22 : 18}]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('RecoveryChannel', passParams)}>
              <Text style={{
                color: Theme.lightBlue, fontSize: width > 600 ? 22 : 18, paddingLeft: 10
              }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
          {this.versionCode()}
        </View>
      </View>
    );
  }
}

let interval = 0;
let {width} = Dimensions.get('window');
let expoToken = '';

LandingPage.propTypes = {
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: 'space-around'
  },
  image: {height: width > 600 ? 350 : 220, resizeMode: 'contain'},
  text: {textAlign: 'center', color: 'white'},
  dots: {flexDirection: 'row', justifyContent: 'space-between', width: width > 600 ? 140 : 120},
  circle: {width: 12, height: 12, borderRadius: 6}
});

function mapStateToProps (state) {
  const {initialExpoToken} = state.settings;
  return {
    initialExpoToken
  };
}

export default connect(mapStateToProps)(LandingPage);
