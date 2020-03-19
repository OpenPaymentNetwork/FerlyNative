import PropTypes from 'prop-types';
import React from 'react';
import Theme from 'ferly/utils/theme';
import {connect} from 'react-redux';
import {View, Text, Image, StyleSheet, Dimensions, ScrollView} from 'react-native';
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

    const images = [
      DirectDeposit,
      FerlyCash,
      FerlyRewards,
      Why
    ];

    const step = [
      'Step 1',
      'Step 2',
      'Step 3',
      'Why do we use direct deposit?'
    ];

    const descriptions = [
      'Set up direct deposit using the routing and accout number below to buy Ferly Cash.',
      'On payday Ferly Cash is immediately available in your wallet.',
      'Earn 5% (yes 5%!) for all Ferly Cash purchased.',
      `We understand direct deposit is an extra step, BUT it reduces fraud and eliminates ` +
      `credit card fees so we can pass the savings along to you!`
    ];

    return (
      <ScrollView style={{backgroundColor: 'white'}}>
        <View style={{flex: 1, justifyContent: 'space-between'}}>
          <View style={styles.container}>
            <Image style={styles.image} source={images[page]} />
            <Text style={[styles.text, {
              fontSize: width > 600 ? 22 : 18 && width < 350 ? 16 : 18,
              paddingVertical: 10,
              fontWeight: 'bold'
            }]}>
              {step[page]}
            </Text>
            <Text style={[styles.text, {
              fontSize: width > 600 ? 22 : 18 && width < 350 ? 16 : 18,
              paddingBottom: 10
            }]}>
              {descriptions[page]}
            </Text>
            <View style={styles.dots}>
              {this.renderDots()}
            </View>
          </View>
          <View>
            <View style={{
              borderBottomWidth: 1,
              borderBottomColor: Theme.lightBlue,
              paddingTop: 10,
              paddingBottom: 5
            }}>
              <Text style={{
                paddingHorizontal: 10,
                fontSize: width > 600 ? 20 : 18 && width < 350 ? 16 : 18,
                color: Theme.darkBlue
              }}>
                Direct Deposit Information
              </Text>
            </View>
            <View style={{paddingTop: 10}}>
              <Text style={{
                paddingHorizontal: 10,
                fontSize: width > 600 ? 20 : 18 && width < 350 ? 16 : 18,
                color: Theme.darkBlue
              }}>
                Use this information on a direct deposit form to add Ferly Cash to your wallet.
              </Text>
            </View>
            <View style={{paddingTop: 15}}>
              <Text style={{
                paddingHorizontal: 10,
                fontSize: width > 600 ? 20 : 18 && width < 350 ? 16 : 18,
                color: Theme.darkBlue
              }}>
                Routing Number
              </Text>
              <Text style={{
                paddingHorizontal: 10,
                fontSize: width > 600 ? 22 : 20 && width < 350 ? 18 : 20,
                color: Theme.darkBlue,
                fontWeight: 'bold'
              }}>
                073923059
              </Text>
            </View>
            <View style={{paddingTop: 10}}>
              <Text style={{
                paddingHorizontal: 10,
                fontSize: width > 600 ? 20 : 18 && width < 350 ? 16 : 18,
                color: Theme.darkBlue
              }}>
                Account Number
              </Text>
              <Text style={{
                paddingHorizontal: 10,
                paddingBottom: 10,
                fontSize: width > 600 ? 22 : 20 && width < 350 ? 18 : 20,
                color: Theme.darkBlue,
                fontWeight: 'bold'
              }}>
                2344 - 5678 - 3390 - 7651
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

let interval = 0;
let {width} = Dimensions.get('window');

LoadingInstructions.propTypes = {
  navigation: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'space-between'
  },
  image: {
    height: width > 600 ? 300 : 200 && width < 350 ? 170 : 200,
    resizeMode: 'contain',
    paddingBottom: 15
  },
  text: {textAlign: 'center', color: Theme.darkBlue},
  dots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width > 600 ? 120 : 100 && width < 350 ? 80 : 100,
    paddingTop: 5
  }
});

function mapStateToProps (state) {
  return {
  };
}

export default connect(mapStateToProps)(LoadingInstructions);
