import PropTypes from 'prop-types'
import React from 'react'
import Spinner from 'ferly/components/Spinner'
import {apiRequire} from 'ferly/store/api'
import {connect} from 'react-redux'
import {createUrl} from 'ferly/utils/fetch'
import {MapView} from 'expo'
import {View, Text, Button, StyleSheet, Platform, Linking} from 'react-native'

export class Locations extends React.Component {
  static navigationOptions = {
    title: 'Locations'
  };

  constructor (props) {
    super(props)
    this.state = {selectedLocation: null}
  }

  componentDidMount () {
    this.props.apiRequire(this.props.locationsUrl)
  }

  fitToMarkers = () => {
    const {locations} = this.props
    if (locations.length > 0) {
      this.mapview.fitToCoordinates(locations, {
        edgePadding: {top: 100, right: 100, bottom: 100, left: 100},
        animated: false
      })
    }
  }

  openMapApp = () => {
    const {selectedLocation} = this.state
    const {latitude, longitude, title} = selectedLocation
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q='
    const latLng = `${latitude},${longitude}`
    const url = Platform.select({
      ios: `${scheme}${title}@${latLng}`,
      android: `${scheme}${latLng}(${title})`
    })
    Linking.openURL(url)
  }

  render () {
    const {locations, loaded} = this.props
    const {selectedLocation} = this.state

    if (!loaded) {
      return <Spinner />
    }

    if (locations.length === 0) {
      return (
        <Text>There are no plottable locations to show</Text>
      )
    }

    let selectedDetails
    if (selectedLocation != null) {
      const {title, address} = selectedLocation
      selectedDetails = (
        <View style={{flexDirection: 'row'}}>
          <View style={styles.selectionDetails}>
            <Text style={{fontWeight: 'bold', fontSize: 18}}>{title}</Text>
            <Text>{address}</Text>
            <View style={{maxWidth: 140, borderRadius: 10}}>
              <Button title="Open in Maps" onPress={this.openMapApp} />
            </View>
          </View>
        </View>
      )
    }

    return (
      <View style={{flex: 1, flexDirection: 'column-reverse'}}>
        <MapView
          ref={ref => (this.mapview = ref)}
          style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0}}
          onMapReady={this.fitToMarkers}>
          {
            locations.map((location, index) => {
              return (
                <MapView.Marker
                  key={index}
                  coordinate={location}
                  onPress={
                    () => this.setState({selectedLocation: location})} />
              )
            })
          }
        </MapView>
        {selectedDetails}
      </View>
    )
  }
}

Locations.propTypes = {
  apiRequire: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  loaded: PropTypes.bool.isRequired,
  locations: PropTypes.array,
  locationsUrl: PropTypes.string.isRequired
}

const styles = StyleSheet.create({
  selectionDetails: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 4
  }
})

function mapStateToProps (state, props) {
  const {params} = props.navigation.state
  const {designId} = params
  const locationsUrl = createUrl('locations', {design_id: designId})
  const apiStore = state.api.apiStore
  const {locations} = apiStore[locationsUrl] || {}
  let locationCoordinates = []
  if (locations) {
    locations.forEach((location, index) => {
      if (location.latitude && location.longitude) {
        const coordinates = {
          address: location.address,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          title: location.title
        }
        locationCoordinates.push(coordinates)
      }
    })
  }
  return {
    loaded: locations !== undefined,
    locationsUrl,
    locations: locationCoordinates
  }
}

const mapDispatchToProps = {
  apiRequire
}

export default connect(mapStateToProps, mapDispatchToProps)(Locations)
