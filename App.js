// https://12factor.net/config
//urllib3.readthedocs.io/en/latest/advanced-usage.html#ssl-warnings);
// https://reactnavigation.org/docs/en/navigating.html
// https://facebook.github.io/react-native/docs/navigation
// https://docs.expo.io/versions/latest/
// API-KEY: 46f40e9f3d52bf495492b21a9a860e5e402a22e590b65443fb62ba634ede9348
//TODO: https://www.npmjs.com/package/react-native-pin-code
//TODO: https://github.com/brix/crypto-js + in Kombination mit der PIN wird die DB verschlüsselt?
//TODO: https://github.com/instea/react-native-popup-menu/blob/master/doc/examples.md
import React from 'react';
import Expo, { SQLite } from 'expo';
import { Vibration, StyleSheet, Alert, FlatList, ActivityIndicator, Button, View, Text, TextInput, TouchableHighlight } from 'react-native';
import { createStackNavigator } from 'react-navigation';
import t from 'tcomb-form-native';

const styles = StyleSheet.create({
  container: {
    padding: 1,
    alignItems: 'center'
  },
  button: {
    marginBottom: 10,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    padding: 20,
    color: 'white'
  }
});

const db = SQLite.openDatabase('harbor.db');
const Form = t.form.Form;
const t_HarborHost = t.struct({
  harbor_uri: t.String,
  api_key: t.String,
  description: t.String
});


class HomeScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>HomeScreen</Text>
        <Button title="Hosts"
          onPress={() => this.props.navigation.navigate('Hosts')}
        />
        <Button title="Settings"
          onPress={() => this.props.navigation.navigate('Settings')}
        /> 
        <Button title="Harbor hosts"
          onPress={() => this.props.navigation.navigate('HarborHosts')}
        /> 
      </View>
    );
  }
}

class HostsScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {isLoading: true}
  }
  componentDidMount(){
    return fetch('https://harbor-zdf.zwackl.de/api/v1/hosts', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'API-KEY': '46f40e9f3d52bf495492b21a9a860e5e402a22e590b65443fb62ba634ede9348'
      }
    })
    .then((response) => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json()
    })
    .then((responseJson) => {
      this.setState({
        isLoading: false,
        hosts: responseJson,
      }, function(){
        // und nu!?
      });
    })
    .catch((error) => {
//      console.error(JSON.stringify(error));
      Alert.alert('Verbindungsfehler!')
    });
  }
  _keyExtractor = (item, index) => item.host;
  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>HostsScreen</Text>
        <Button title="Go to Home"
          onPress={() => this.props.navigation.navigate('Home')}
        />
        <FlatList
          data={this.state.hosts} keyExtractor={this._keyExtractor}
          renderItem={({item}) => 
            <Button title={item.host + "(" + item.type + ")"} 
              onPress={() => this.props.navigation.navigate('HostContainers', {host: item.host})}
            /> 
          }
        />
      </View>
    );
  }
}

class HostContainersScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLoading: true,
      host: this.props.navigation.getParam('host', 'SoEinKack')
    }
  }
  componentDidMount(){
    return fetch('https://harbor-zdf.zwackl.de/api/v1/hosts/' + this.state.host + '/containers', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'API-KEY': '46f40e9f3d52bf495492b21a9a860e5e402a22e590b65443fb62ba634ede9348'
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        isLoading: false,
        hostContainers: responseJson,
      }, function(){
        // und nu!?
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }
  _keyExtractor = (item, index) => item.container_name;
  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}> 
        <Button
          title="< Hosts"
          onPress={() => this.props.navigation.navigate('Hosts')}
        />
        <Text>Containers on host: {this.state.host}</Text>
        <FlatList data={this.state.hostContainers} keyExtractor={this._keyExtractor}
          renderItem={({item}) => 
            <Button title={item.container_name + " (" + item.container_state + ")"} 
              onPress={() => this.props.navigation.navigate('ContainerDetails', {container_href: item.href})}
            />
          }
        />
      </View>
    );
  }
}

class ContainerDetailsScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLoading: true,
      container_href: this.props.navigation.getParam('container_href', 'SoEinKack')
    }
  }
  componentDidMount(){
    return fetch(this.state.container_href, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'API-KEY': '46f40e9f3d52bf495492b21a9a860e5e402a22e590b65443fb62ba634ede9348'
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({
        isLoading: false,
        container: responseJson,
      }, function(){
        // und nu!?
      });
    })
    .catch((error) =>{
      console.error(error);
    });
  }
      
  render() {
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, padding: 20}}>
          <ActivityIndicator/>
        </View>
      )
    }
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}> 
        <Text>{JSON.stringify(this.state.container)}</Text>
      </View>
    );
  }
}

class SettingsScreen extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>TODO: Settings</Text>
        <Button title="< Home"
          onPress={() => this.props.navigation.navigate('Home')}
        />
      </View>
    );
  }
}

class AddHarborHostScreen extends React.Component { 
  handleSubmit(){
    const add_form = this._form.getValue();
    db.transaction(
      tx => {
        tx.executeSql(
          'insert into harbor_hosts (harbor_uri, api_key, description) values (?,?,?)', 
          [add_form.harbor_uri, add_form.api_key, add_form.description]
        );
      },
      null,
      this.update
    );
  } 
 
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Add HARBOR host</Text>
        <Form type={t_HarborHost} 
          ref={c => this._form = c}
        />
        <Button title="Create"
          onPress={() => {
            this.handleSubmit()
            this.props.navigation.navigate('HarborHosts')
          }}
        />
      </View>
    );
  }
}

//https://12factor.net/config
class HarborHostsScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isLoading: true
    }
  }
  componentDidMount(){
    db.transaction(
      tx => {
        tx.executeSql('select * from harbor_hosts', [], (_, { rows }) =>
          this.setState({
            isLoading: false,
            harbor_hosts: rows._array
          }, function(){
            // und nu!?
          })
        );
      },
      null,
      this.update
    );
  }
  _onPress = (item) => {
    Alert.alert('Harbor host pressed: ' + item['harbor_uri'])
  };
  //TODO: popup-menu
  render() {
    return (
      <View style={styles.container}>
        <Button title="Add HARBOR Host"
          onPress={() => {
            Vibration.vibrate(10000)
            this.props.navigation.navigate('AddHarborHost')
          }}
        />
        <Text>HARBOR Hosts:</Text>
        <FlatList data={this.state.harbor_hosts} keyExtractor={(item, index) => item.harbor_uri}
          renderItem={({item}) => (
            <TouchableHighlight onPress={() => this._onPress(item)} onLongPress={() => {Alert.alert('long!')}}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>
                  {item.harbor_uri}
                </Text>
              </View>
            </TouchableHighlight>
          )}
        /> 
      </View>
    );
  }
}

const RootStack = createStackNavigator(
  {
    Home: HomeScreen,
    Settings: SettingsScreen,
    HarborHosts: HarborHostsScreen,
    AddHarborHost: AddHarborHostScreen,
    Hosts: HostsScreen,
    HostContainers: HostContainersScreen,
    ContainerDetails: ContainerDetailsScreen
  },
  {
    initialRouteName: 'Home',
  }
);

// Main Class
export default class App extends React.Component {
  componentDidMount() {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists harbor_hosts (harbor_uri text primary key not null, api_key text, description text);'
      );
    });
  }

  render() { 
    return <RootStack />;
  }
}

