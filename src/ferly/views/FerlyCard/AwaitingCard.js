import React from 'react';
import CardForm from 'ferly/views/FerlyCard/CardForm';
import PrimaryButton from 'ferly/components/PrimaryButton';
import Theme from 'ferly/utils/theme';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {Alert, View, Text, Image, Dimensions} from 'react-native';
import {mailCard} from 'ferly/images/index';

export class AwaitingCard extends React.Component {
  static navigationOptions = {
    title: 'Ferly Card'
  };

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Awaiting Card'};
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
    const {width, height} = Dimensions.get('window');
    let imageHeight = height / 2;
    let imageWidth = width / 2;
    const {haveCard} = this.props;
    if (haveCard) {
      return <CardForm onPass={() => this.setState({passed: ''})} />;
    }

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
            Your card is on its way! Activate it below when it arrives.
          </Text>
        </View>
        <View style={{paddingBottom: 20}}>
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
            navigation={navigation}
            title="Activate Card"
            color={Theme.lightBlue}
            onPress={() => this.props.onPass()} />
        </View>
      </View>
    );
  }
}

let count = 0;

AwaitingCard.propTypes = {
  haveCard: PropTypes.bool,
  onPass: PropTypes.func.isRequired,
  navigation: PropTypes.object,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {haveCard, deviceToken} = state.settings;
  return {
    haveCard,
    deviceToken
  };
}

export default connect(mapStateToProps)(AwaitingCard);
