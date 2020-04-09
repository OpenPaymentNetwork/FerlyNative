import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {StackActions} from 'react-navigation';
import {connect} from 'react-redux';
import {post} from 'ferly/utils/fetch';
import {View, Text, Image, StyleSheet, Dimensions, Alert} from 'react-native';
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
      accountNumber: '',
      time: 0,
      page: 0,
      dataSource: [
        {
          title: 1
        }, {
          title: 2
        }, {
          title: 3
        }
      ]
    };
  }

  componentDidMount () {
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

  renderDots () {
    const {page} = this.state;
    let dots = [];
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={{
            backgroundColor: i === page ? Theme.darkBlue : Theme.lightBlue,
            width: i === page ? 12 : 10,
            height: i === page ? 12 : 10,
            borderRadius: i === page ? 6 : 4
          }} />
      );
    }
    return dots;
  }

  render () {
    const {page} = this.state;
    let sub1 = '';
    let sub2 = '';
    let sub3 = '';
    let sub4 = '';
    post('get-ach', this.props.deviceToken)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({accountNumber: responseJson[0].account_number});
      })
      .catch(() => {
        Alert.alert('Error please check internet connection!');
        const resetAction = StackActions.reset({
          index: 0,
          actions: [
            StackActions.push({routeName: 'Menu'})
          ]
        });
        this.props.navigation.dispatch(resetAction);
        this.props.navigation.navigate('Home');
      });
    sub1 = this.state.accountNumber.substring(0, 4);
    sub2 = this.state.accountNumber.substring(4, 8);
    sub3 = this.state.accountNumber.substring(8, 12);
    sub4 = this.state.accountNumber.substring(12, 17);
    const images = [
      Why,
      DirectDeposit,
      FerlyCash,
      FerlyRewards
    ];

    const step = [
      'Why do we use direct deposit?',
      'Step 1',
      'Step 2',
      'Step 3'
    ];

    const descriptions = [
      `We understand direct deposit is an extra step, BUT it reduces fraud and eliminates ` +
      `credit card fees so we can pass the savings along to you!`,
      'Set up direct deposit using the routing and accout number below to buy Ferly Cash.',
      'On payday, Ferly Cash is immediately available in your wallet.',
      'Earn 5% (yes 5%!) for all Ferly Cash purchased.'
    ];

    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <View style={styles.container}>
          <Image style={styles.image} source={images[page]} />
          <Text style={[styles.text, {
            fontSize: width > 600 ? 25 : 18 && width < 350 ? 16 : 18,
            paddingVertical: width < 350 ? 10 : 15 && width > 600 ? 25 : 15,
            fontWeight: 'bold'
          }]}>
            {step[page]}
          </Text>
          <Text style={[styles.text, {
            height: 105,
            fontSize: width > 600 ? 25 : 18 && width < 350 ? 16 : 18,
            paddingBottom: width < 350 ? 10 : 15 && width > 600 ? 25 : 15
          }]}>
            {descriptions[page]}
          </Text>
          <View style={styles.dots}>
            {this.renderDots()}
          </View>
        </View>
        <View style={{
          borderBottomWidth: 1,
          borderBottomColor: Theme.lightBlue,
          paddingTop: width < 350 ? 15 : 20 && width > 600 ? 25 : 20,
          paddingBottom: 5
        }}>
          <Text style={{
            paddingHorizontal: 10,
            fontSize: width > 600 ? 25 : 18 && width < 350 ? 16 : 18,
            color: Theme.darkBlue
          }}>
            Direct Deposit Information
          </Text>
        </View>
        <View style={{paddingTop: 10}}>
          <Text style={{
            paddingHorizontal: 10,
            fontSize: width > 600 ? 25 : 18 && width < 350 ? 16 : 18,
            color: Theme.darkBlue
          }}>
            Use this information on a direct deposit form to add Ferly Cash to your wallet.
          </Text>
        </View>
        <View style={{paddingTop: width < 350 ? 15 : 20 && width > 600 ? 25 : 20}}>
          <Text style={{
            paddingHorizontal: 10,
            fontSize: width > 600 ? 26 : 18 && width < 350 ? 16 : 18,
            color: Theme.darkBlue
          }}>
            Routing Number
          </Text>
          <Text style={{
            paddingHorizontal: 10,
            fontSize: width > 600 ? 25 : 20 && width < 350 ? 18 : 20,
            color: Theme.darkBlue,
            fontWeight: 'bold'
          }}>
            073923059
          </Text>
        </View>
        <View style={{paddingTop: 10}}>
          <Text style={{
            paddingHorizontal: 10,
            fontSize: width > 600 ? 25 : 18 && width < 350 ? 16 : 18,
            color: Theme.darkBlue
          }}>
            Account Number
          </Text>
          <Text style={{
            paddingHorizontal: 10,
            paddingBottom: width < 350 ? 10 : 15 && width > 600 ? 25 : 15,
            fontSize: width > 600 ? 26 : 20 && width < 350 ? 18 : 20,
            color: Theme.darkBlue,
            fontWeight: 'bold'
          }}>
            {sub1 + ' - ' + sub2 + ' - ' + sub3 + ' - ' + sub4}
          </Text>
        </View>
      </View>
    );
  }
}

let interval = 0;
let {width} = Dimensions.get('window');

LoadingInstructions.propTypes = {
  deviceToken: PropTypes.string,
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: width < 350 ? 15 : 20 && width > 600 ? 25 : 20,
    paddingHorizontal: 10
  },
  image: {
    height: width > 600 ? 250 : 175 && width < 350 ? 100 : 175,
    resizeMode: 'contain',
    paddingBottom: width < 350 ? 15 : 20 && width > 600 ? 25 : 20
  },
  text: {
    textAlign: 'center',
    color: Theme.darkBlue
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width > 600 ? 120 : 100 && width < 350 ? 80 : 100,
    paddingTop: width < 350 ? 10 : 15 && width > 600 ? 25 : 15
  }
});

function mapStateToProps (state) {
  const {deviceToken} = state.settings;

  return {
    deviceToken
  };
}

export default connect(mapStateToProps)(LoadingInstructions);
