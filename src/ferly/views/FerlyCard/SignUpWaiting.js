import React from 'react';
import {View, Text, Image, Dimensions} from 'react-native';
import {mailCard} from 'ferly/images/index';
import PrimaryButton from 'ferly/components/PrimaryButton';
import Theme from 'ferly/utils/theme';
import PropTypes from 'prop-types';

export default class SignUpWaiting extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  render () {
    const {navigation} = this.props;
    const {width, height} = Dimensions.get('window');
    let imageHeight = height / 2;
    let imageWidth = width / 2;
    return (
      <View style={{flex: 1, justifyContent: 'space-between', backgroundColor: 'white'}}>
        <View style={{paddingVertical: 20, paddingTop: 30}} >
          <Text style={{
            paddingHorizontal: 15,
            fontSize: 20,
            textAlign: 'center',
            color: Theme.darkBlue
          }} >
            Your card is on its way! Activate it below when it arrives.
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
            onPress={() => navigation.navigate('Wallet')} />
        </View>
      </View>
    );
  }
}

SignUpWaiting.propTypes = {
  navigation: PropTypes.object.isRequired
};
