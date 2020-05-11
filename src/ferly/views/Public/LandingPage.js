import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import Swiper from 'react-native-swiper';
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
  componentDidMount () {
    this.getToken().then((response) => {
      this.props.dispatch(setInitialExpoToken(response));
    })
      .catch((error) => {
        console.log('Unable to get expo token', error);
      });
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

  render () {
    const {navigation} = this.props;

    const passParams = {
      expoToken: expoToken
    };

    return (
      <View style={{flex: 1, backgroundColor: Theme.darkBlue}}>
        <Swiper
          dot={
            <View style={{
              backgroundColor: 'white',
              width: width < 350 ? 8 : 10 && width > 600 ? 16 : 10,
              height: width < 350 ? 8 : 10 && width > 600 ? 16 : 10,
              borderRadius: width > 600 ? 8 : 5,
              marginLeft: 8,
              marginRight: 8,
              marginTop: 3,
              marginBottom: 3
            }} />
          }
          activeDot={
            <View style={{
              backgroundColor: Theme.lightBlue,
              width: width < 350 ? 10 : 12 && width > 600 ? 20 : 12,
              height: width < 350 ? 10 : 12 && width > 600 ? 20 : 12,
              borderRadius: width > 600 ? 10 : 6,
              marginLeft: 8,
              marginRight: 8,
              marginTop: 3,
              marginBottom: 3
            }} />
          }
          horizontal={true}
          autoplay={true}
          autoplayTimeout={10}
          style={{height: height > 750 ? 600 : 400}}
        >
          <View style={styles.container}>
            <View style={{
              paddingTop: height > 750 ? height / 12 : height / 25
            }}>
              <Text style={[styles.text, {
                fontSize: height / 35
              }]}>
                Buy gift value anytime, anywhere, perfect for that last minute gift.
              </Text>
            </View>
            <View style={{
              paddingTop: height > 750 ? height / 15 : height / 20
            }}>
              <Image style={styles.image} source={tutorialTwo} />
            </View>
          </View>
          <View style={styles.container}>
            <View style={{
              paddingTop: height > 750 ? height / 12 : height / 25
            }}>
              <Text style={[styles.text, {
                fontSize: height / 35
              }]}>
                Easily send gifts to friends and family, even those far away.
              </Text>
            </View>
            <View style={{
              paddingTop: height > 750 ? height / 15 : height / 20
            }}>
              <Image style={styles.image} source={tutorialSix} />
            </View>
          </View>
          <View style={styles.container}>
            <View style={{
              paddingTop: height > 750 ? height / 10 : height / 25
            }}>
              <Text style={[styles.text, {
                fontSize: height / 35
              }]}>
                Have real time access to gift card balances.
              </Text>
            </View>
            <View style={{
              paddingTop: height > 750 ? height / 15 : height / 20
            }}>
              <Image style={styles.image} source={tutorialThree} />
            </View>
          </View>
        </Swiper>
        <View style={{paddingVertical: 5}}>
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
                color: Theme.lightBlue,
                fontSize: width > 600 && height > 745 ? 22 : width < 400 && height < 745 ? 16 : 18,
                paddingLeft: 10
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

let {width, height} = Dimensions.get('window');
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
    paddingHorizontal: 20
  },
  image: {
    height: height > 550 ? height / 2.5 : height / 3,
    resizeMode: 'contain'},
  text: {textAlign: 'center', color: 'white'}
});

function mapStateToProps (state) {
  const {initialExpoToken} = state.settings;
  return {
    initialExpoToken
  };
}

export default connect(mapStateToProps)(LandingPage);
