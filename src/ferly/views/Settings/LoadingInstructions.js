import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import Swiper from 'react-native-swiper';
import {StackActions} from 'react-navigation';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {View, Text, Image, StyleSheet, Dimensions, Alert, ScrollView} from 'react-native';
import {
  DirectDeposit,
  FerlyCash,
  FerlyRewards,
  Why
} from 'ferly/images/index';

export class LoadingInstructions extends React.Component {
  static navigationOptions = {
    title: 'Add Ferly Cash'
  };

  constructor (props) {
    super(props);
    this.state = {
      accountNumber: ''
    };
  }

  componentDidMount () {
    post('get-ach', this.props.deviceToken)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({accountNumber: responseJson[0].account_number});
      })
      .catch(() => {
        Alert.alert('Error', 'Please check internet connection!');
        const resetAction = StackActions.reset({
          index: 0,
          actions: [
            StackActions.push({routeName: 'Menu'})
          ]
        });
        this.props.navigation.dispatch(resetAction);
        this.props.navigation.navigate('Home');
      });
  }

  render () {
    let sub1 = '';
    let sub2 = '';
    let sub3 = '';
    let sub4 = '';
    sub1 = this.state.accountNumber.substring(0, 4);
    sub2 = this.state.accountNumber.substring(4, 8);
    sub3 = this.state.accountNumber.substring(8, 12);
    sub4 = this.state.accountNumber.substring(12, 17);

    return (
      <ScrollView style={{flex: 1, backgroundColor: 'white'}}>
        <Swiper
          dot={
            <View style={{
              backgroundColor: Theme.lightBlue,
              width: width < 350 ? 8 : 10,
              height: width < 350 ? 8 : 10,
              borderRadius: 5,
              marginLeft: 5,
              marginRight: 5,
              marginTop: 3,
              marginBottom: 3
            }} />
          }
          activeDot={
            <View style={{
              backgroundColor: Theme.darkBlue,
              width: width < 350 ? 10 : 12,
              height: width < 350 ? 10 : 12,
              borderRadius: 6,
              marginLeft: 5,
              marginRight: 5,
              marginTop: 3,
              marginBottom: 3
            }} />
          }
          autoplay={true}
          autoplayTimeout={10}
          style={{height: width < 350 ? 300 : width > 600 ? 600 : 400}}
        >
          <View style={styles.container}>
            <Image style={styles.image} source={Why} />
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingVertical: width < 350 ? 10 : width > 600 ? 25 : 15,
                fontWeight: 'bold'
              }]}>
              Why do we use direct deposit?
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                height: height < 600 && width < 350 ? 125 : 105,
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingBottom: width < 350 ? 10 : width > 600 ? 25 : 15
              }]}>
              {`We understand direct deposit is an extra step, BUT it reduces fraud and ` +
              `eliminates credit card fees so we can pass the savings along to you!`}
            </Text>
          </View>
          <View style={styles.container}>
            <Image style={styles.image} source={DirectDeposit} />
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingVertical: width < 350 ? 10 : width > 600 ? 25 : 15,
                fontWeight: 'bold'
              }]}>
              Step 1
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                height: height < 600 && width < 350 ? 125 : 105,
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingBottom: width < 350 ? 10 : width > 600 ? 25 : 15
              }]}>
              Set up direct deposit using the routing and accout number below to buy Ferly Cash.
            </Text>
          </View>
          <View style={styles.container}>
            <Image style={styles.image} source={FerlyCash} />
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingVertical: width < 350 ? 10 : width > 600 ? 25 : 15,
                fontWeight: 'bold'
              }]}>
              Step 2
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                height: height < 600 && width < 350 ? 125 : 105,
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingBottom: width < 350 ? 10 : width > 600 ? 25 : 15
              }]}>
              On payday, Ferly Cash is immediately available in your wallet.
            </Text>
          </View>
          <View style={styles.container}>
            <Image style={styles.image} source={FerlyRewards} />
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingVertical: width < 350 ? 10 : width > 600 ? 25 : 15,
                fontWeight: 'bold'
              }]}>
              Step 3
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.text, {
                height: height < 600 && width < 350 ? 125 : 105,
                fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
                paddingBottom: width < 350 ? 10 : width > 600 ? 25 : 15
              }]}>
              Earn 5% (yes 5%!) for all Ferly Cash purchased.
            </Text>
          </View>
        </Swiper>
        <View style={{
          borderBottomWidth: 1,
          borderBottomColor: Theme.lightBlue,
          paddingTop: width < 350 ? 15 : width > 600 ? 25 : 20,
          paddingBottom: 5
        }}>
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 10,
              fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
              color: Theme.darkBlue
            }}>
            Direct Deposit Information
          </Text>
        </View>
        <View style={{paddingTop: 10}}>
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 10,
              fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
              color: Theme.darkBlue
            }}>
            Use this information on a direct deposit form to add Ferly Cash to your wallet.
          </Text>
        </View>
        <View style={{paddingTop: width < 350 ? 15 : width > 600 ? 25 : 20}}>
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 10,
              fontSize: width > 600 ? 26 : width < 350 ? 16 : 18,
              color: Theme.darkBlue
            }}>
            Routing Number
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 10,
              fontSize: width > 600 ? 25 : width < 350 ? 18 : 20,
              color: Theme.darkBlue,
              fontWeight: 'bold'
            }}>
            073923059
          </Text>
        </View>
        <View style={{paddingTop: 10}}>
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 10,
              fontSize: width > 600 ? 25 : width < 350 ? 16 : 18,
              color: Theme.darkBlue
            }}>
            Account Number
          </Text>
          <Text
            allowFontScaling={false}
            style={{
              paddingHorizontal: 10,
              paddingBottom: width < 350 ? 10 : width > 600 ? 25 : 15,
              fontSize: width > 600 ? 26 : width < 350 ? 18 : 20,
              color: Theme.darkBlue,
              fontWeight: 'bold'
            }}>
            {sub1 + ' - ' + sub2 + ' - ' + sub3 + ' - ' + sub4}
          </Text>
        </View>
      </ScrollView>
    );
  }
}

let {width, height} = Dimensions.get('window');

LoadingInstructions.propTypes = {
  deviceToken: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: width < 350 ? 15 : width > 600 ? 25 : 20,
    paddingHorizontal: 10
  },
  image: {
    height: width > 600 ? 250 : width < 350 ? 100 : 175,
    resizeMode: 'contain',
    paddingBottom: width < 350 ? 15 : width > 600 ? 25 : 20
  },
  text: {
    textAlign: 'center',
    color: Theme.darkBlue
  }
});

function mapStateToProps (state) {
  const {deviceToken} = state.settings;

  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(LoadingInstructions);
