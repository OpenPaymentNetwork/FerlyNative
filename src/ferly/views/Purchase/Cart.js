
import accounting from 'ferly/utils/accounting';
import Constants from 'expo-constants';
import Icon from 'react-native-vector-icons/FontAwesome';
import PrimaryButton from 'ferly/components/PrimaryButton';
import PropTypes from 'prop-types';
import React from 'react';
import Spinner from 'ferly/components/Spinner';
import TestElement from 'ferly/components/TestElement';
import Theme from 'ferly/utils/theme';
import {apiRequire, apiExpire, apiRefresh} from 'ferly/store/api';
import {connect} from 'react-redux';
import {createUrl, post, urls} from 'ferly/utils/fetch';
import {StackActions} from 'react-navigation';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  WebView
} from 'react-native';

export class Cart extends React.Component {
  static navigationOptions = {
    title: 'Cart'
  };

  constructor (props) {
    super(props);
    this.state = {selectedSource: null, cardLoaded: false};
  }

  componentDidMount () {
    this.props.apiRequire(this.props.sourcesUrl);
  }

  onSuccess (source) {
    const {navigation} = this.props;
    const params = navigation.state.params;
    const {design, amount} = params;

    const purchaseParams = {
      amount: amount,
      fee: design.fee,
      design_id: design.id.toString(),
      source_id: source
    };

    this.setState({submitting: true});
    post('purchase', this.props.deviceToken, purchaseParams)
      .then((response) => response.json())
      .then((responseJson) => {
        if (this.validate(responseJson)) {
          this.props.apiExpire(urls.history);
          this.props.apiExpire(urls.profile);
          const resetAction = StackActions.reset({
            index: 0,
            actions: [StackActions.push({routeName: 'Home'})]
          });
          navigation.dispatch(resetAction);
          const formatted = accounting.formatMoney(parseFloat(amount));
          const desc = `You added ${formatted} ${design.title} to your wallet.`;
          Alert.alert('Complete!', desc);
          this.props.apiExpire(this.props.sourcesUrl);
        }
      })
      .catch(() => {
        Alert.alert('Error trying to purchase!');
      });
  }

  validate (json) {
    if (json.invalid) {
      Alert.alert('Error', json.invalid[Object.keys(json.invalid)[0]]);
      this.setState({submitting: false});
      return false;
    } else if (!json.result) {
      Alert.alert('Error', 'There was a problem processing your credit card.');
      this.setState({submitting: false});
      return false;
    } else {
      return true;
    }
  }

  handleSubmitClick () {
    const {selectedSource} = this.state;
    if (selectedSource === 'new') {
      if (this.webview) {
        this.webview.injectJavaScript(
          "document.getElementById('submit-button').click()");
      }
    } else {
      this.onSuccess(selectedSource);
    }
  }

  receiveMessage (event) {
    const data = event.nativeEvent.data;
    if (data.startsWith('paymenttoken:')) {
      const token = data.substring(data.indexOf(':') + 1);
      this.onSuccess(token);
    } else if (data === 'error') {
      this.setState({submitting: false});
    }
  }

  handleRemoveClick (sourceId, card) {
    Alert.alert(
      'Confirm',
      `Are you sure you'd like to remove ${card}?`,
      [
        {text: 'No', onPress: null},
        {text: 'Yes', onPress: () => this.removeCard(sourceId)}
      ]
    );
  }

  removeCard (sourceId) {
    if (this.state.selectedSource === sourceId) {
      this.setState({selectedSource: null});
    }
    fetch(createUrl('delete-stripe-source', {source_id: sourceId}), {
      headers: {
        Authorization: 'Bearer ' + this.props.deviceToken
      }})
      .then((response) => response.json())
      .then((json) => {
        this.props.apiRefresh(this.props.sourcesUrl);
      })
      .catch(() => {
        Alert.alert('Error trying to delete!');
      });
  }

  renderBody () {
    const {selectedSource, cardLoaded, submitting} = this.state;
    const {sources} = this.props;
    if (!sources || submitting) {
      return <Spinner />;
    } else {
      const existingSources = sources.map((source) => {
        const {id, brand, lastFour} = source;
        const sourceStyles = [styles.source];
        if (selectedSource === id) {
          sourceStyles.push(styles.selectedSource);
        }
        const display = `${brand} ending in ${lastFour}`;
        return (
          <TestElement
            parent={TouchableOpacity}
            label='test-id-cart-card-box'
            key={id}
            style={sourceStyles}
            onPress={() => this.setState({selectedSource: id})}>
            <Text>{display}</Text>
            <TouchableOpacity
              style={styles.removeIconContainer}
              onPress={() => this.handleRemoveClick(id, display)}>
              <Icon
                style={{alignSelf: 'flex-start'}}
                name="times"
                color="lightcoral"
                size={18} />
            </TouchableOpacity>
          </TestElement>
        );
      });
      let newCard = (
        <TouchableOpacity
          style={styles.source}
          onPress={() => this.setState({selectedSource: 'new'})}>
          <Text>Pay with a new card</Text>
        </TouchableOpacity>
      );
      if (selectedSource === 'new') {
        const productionURI = 'https://ferlyapi.com/stripeform/production.html';
        const stagingURI = 'http://ferlystaging.us-east-2.elasticbeanstalk.com/stripeform/staging.html';
        const {releaseChannel} = Constants.manifest;
        const loadingSpinner = <View style={{height: 80}}><Spinner /></View>;
        newCard = (
          <View style={[styles.source, styles.selectedSource]}>
            <View style={{width: '100%', height: 80}}>
              {!cardLoaded ? loadingSpinner : null}
              <WebView
                ref={ref => (this.webview = ref)}
                onLoadEnd={() => this.setState({cardLoaded: true})}
                useWebKit={true}
                source={{uri: releaseChannel === 'production'
                  ? productionURI : stagingURI}}
                onMessage={this.receiveMessage.bind(this)}
                scrollEnabled={false} />
            </View>
          </View>
        );
      }
      return (
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior="padding"
          keyboardVerticalOffset={100}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            {existingSources}
            {newCard}
          </ScrollView>
        </KeyboardAvoidingView>
      );
    }
  }

  render () {
    count++;
    if (count < 2) {
      const text = {'text': 'Cart'};
      post('log-info', this.props.deviceToken, text)
        .then((response) => response.json())
        .then((responseJson) => {
        })
        .catch(() => {
          Alert.alert('Error please check internet connection!');
        });
    }
    const {params} = this.props.navigation.state;
    const {amount: amountString, design} = params;
    const convenienceFee = parseFloat(design.fee);
    const amountNumber = parseFloat(amountString);
    const total = amountNumber + convenienceFee;
    const {selectedSource, submitting} = this.state;
    const {title} = design;
    return (
      <View style={styles.page}>
        <TestElement
          parent={View}
          label='test-id-cart-header-box'
          style={styles.header}>
          <View style={{alignItems: 'center'}} >
          </View>
          <View style={styles.designContainer}>
            <View>
              <View style={{flexGrow: 1, flexWrap: 'wrap'}}>
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Purchase Summary</Text>
                  <View>
                    <View style={styles.functionRow}>
                      <Text style={styles.sectionText}>{title}</Text>
                      <Text style={[styles.sectionText,
                        {color: Theme.lightBlue}]}>
                        {accounting.formatMoney(amountNumber)}
                      </Text>
                    </View>
                    <View style={styles.functionRow}>
                      <Text style={styles.sectionText}>Online Fee</Text>
                      <Text style={[styles.sectionText,
                        {color: Theme.lightBlue}]}>
                        {accounting.formatMoney(convenienceFee)}
                      </Text>
                    </View>
                    <View style={[
                      styles.functionRow,
                      {borderBottomWidth: 0.5, borderColor: 'darkgray'}
                    ]}>
                      <Text style={styles.sectionText}>Tax</Text>
                      <Text style={[styles.sectionText,
                        {color: Theme.lightBlue}]}>
                        $0.00
                      </Text>
                    </View>
                    <View style={styles.functionRow}>
                      <Text style={styles.totalText}>Total</Text>
                      <Text style={[styles.sectionText,
                        {
                          color: Theme.lightBlue,
                          fontWeight: 'bold',
                          fontSize: 18}]}>
                        {accounting.formatMoney(total)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TestElement>
        {this.renderBody()}
        <PrimaryButton
          title="Confirm Purchase"
          disabled={!selectedSource || submitting}
          onPress={this.handleSubmitClick.bind(this)} />
      </View>
    );
  }
}

let count = 0;

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 10
  },
  designText: {
    flexShrink: 1,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    fontSize: 20
  },
  invalidText: {fontSize: 14, color: 'red', textAlign: 'right'},
  page: {flex: 1, flexDirection: 'column'},
  selectedSource: {borderColor: Theme.lightBlue, borderWidth: 2},
  source: {
    height: 90,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'lightgray',
    elevation: 1.8,
    shadowOffset: {width: 2, height: 2},
    shadowColor: 'lightgray',
    shadowOpacity: 1
  },
  removeIconContainer: {
    alignSelf: 'flex-end',
    position: 'absolute',
    height: 90,
    padding: 10
  },
  functionRow: {flexDirection: 'row', justifyContent: 'space-between'},
  section: {marginTop: 10, paddingHorizontal: 20},
  sectionHeader: {fontSize: 22, fontWeight: 'bold', marginVertical: 10, alignSelf: 'center'},
  sectionText: {color: 'darkgray', fontSize: 16},
  totalText: {fontSize: 18, fontWeight: 'bold'}
});

Cart.propTypes = {
  amounts: PropTypes.array,
  apiExpire: PropTypes.func.isRequired,
  apiRefresh: PropTypes.func.isRequired,
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  sources: PropTypes.array,
  sourcesUrl: PropTypes.string.isRequired,
  deviceToken: PropTypes.string.isRequired
};

function mapStateToProps (state) {
  const {deviceToken} = state.settings;
  const sourcesUrl = createUrl('list-stripe-sources');
  const apiStore = state.api.apiStore;
  const sourcesResponse = apiStore[sourcesUrl] || {};
  const {sources: sourcesList} = sourcesResponse;
  let sources;
  if (sourcesList) {
    sources = sourcesList.map((source) => {
      const {id, brand, last_four: lastFour} = source;
      return {id, brand, lastFour};
    });
  }

  return {
    sourcesUrl,
    sources,
    deviceToken
  };
}

const mapDispatchToProps = {
  apiExpire,
  apiRefresh,
  apiRequire
};

export default connect(mapStateToProps, mapDispatchToProps)(Cart);
