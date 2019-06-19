import React from 'react'
import PropTypes from 'prop-types'
import {View, Picker} from 'react-native'

export default class StatePicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      state: ''
    }
  }

  onValueChange = (state) => {
    this.setState({state: state})
    this.props.onStateChange(state)
  }

  render () {
    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID',
      'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS',
      'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK',
      'OR', 'PA', 'RI', 'SC', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI',
      'WY'
    ]
    return (
      <View>
        <Picker style={{width: 90, height: 21}}
          selectedValue={this.state.state || this.props.defaultState}
          onValueChange={this.onValueChange}>
          {
            states.map((item) => {
              return <Picker.Item label={item} value={item} key={item} />
            })
          }
        </Picker>
      </View>
    )
  }
}

StatePicker.propTypes = {
  onStateChange: PropTypes.func.isRequired,
  defaultState: PropTypes.string.isRequired
}
