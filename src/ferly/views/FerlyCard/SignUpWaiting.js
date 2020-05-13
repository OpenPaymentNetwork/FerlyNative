import React from 'react';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {setDoneTutorial} from 'ferly/store/settings';
import {Alert, AsyncStorage, View, Text, Image, Dimensions} from 'react-native';
import {mailCard} from 'ferly/images/index';
import PrimaryButton from 'ferly/components/PrimaryButton';
import Theme from 'ferly/utils/theme';
import PropTypes from 'prop-types';

export class SignUpWaiting extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  async storage () {
    AsyncStorage.setItem('codeRedeemed', 'needed').then(() => {
      AsyncStorage.setItem('doneTutorial', '').then(() => {
        try {
          this.props.dispatch(setDoneTutorial(''));
        } catch (error) {
          Alert.alert('error', error);
        }
      });
    });
  }

  handleSubmit () {
    this.storage().then((response) => {
    })
      .catch(() => {
        Alert.alert('Error trying to add card!');
      });
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Sign Up Waiting'};
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
    const {width, height} = Dimensions.get('window');
    let imageHeight = height / 2;
    let imageWidth = width / 2;
    return (
      <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: 'white'}}>
        <View style={{paddingVertical: 20, paddingTop: 30}} >
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 15,
              fontSize: 20,
              textAlign: 'center',
              color: Theme.darkBlue
            }} >
            Your card is on its way! Make sure you activate it when it arrives.
          </Text>
        </View>
        <View style={{paddingBottom: 20}} >
          <Image
            resizeMode='contain'
            style={{
              alignSelf: 'center',
              height: imageHeight,
              maxWidth: imageWidth
            }}
            source={mailCard} />
        </View>
        <View>
          <PrimaryButton
            title="Wallet"
            color={Theme.lightBlue}
            onPress={() => this.handleSubmit()} />
        </View>
      </View>
    );
  }
}

let count = 0;

SignUpWaiting.propTypes = {
  dispatch: PropTypes.func.isRequired,
  navigation: PropTypes.object,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(SignUpWaiting);
