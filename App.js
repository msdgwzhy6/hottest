/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  StyleSheet,
  Platform,
  Text,
  View,
  Alert,
  TouchableOpacity,
  DeviceEventEmitter,
  Linking,
} from 'react-native';

import {
  isFirstTime,
  isRolledBack,
  packageVersion,
  currentVersion,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess,
} from 'react-native-update';

import _updateConfig from './update.json';
const { appKey } = _updateConfig[Platform.OS];
console.log(appKey)
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0
    };

  }
  componentDidMount() {
    if (isFirstTime) {
      Alert.alert('提示', '这是当前版本第一次启动,是否要模拟启动失败?失败将回滚到上一版本', [
        { text: '是', onPress: () => { throw new Error('模拟启动失败,请重启应用') } },
        { text: '否', onPress: () => { markSuccess() } },
      ]);
    } else if (isRolledBack) {
      Alert.alert('提示', '刚刚更新失败了,版本被回滚.');
    }
    DeviceEventEmitter.addListener('progress', (pro) => {
      console.log('Progress' + pro.progress)
      this.setState({ progress: pro.progress })
    });
  }
  componentWillUnmount() {
    //DeviceEventEmitter.removeListener('progress', this.wxresult);

  }
  doUpdate = async (info) => {
    try {
      const hash = await downloadUpdate(info);
      Alert.alert('提示', '下载完毕,是否重启应用?', [
        { text: '是', onPress: () => { switchVersion(hash); } },
        { text: '否', },
        { text: '下次启动时', onPress: () => { switchVersionLater(hash); } },
      ]);
    } catch (err) {
      Alert.alert('提示', '更新失败.');
    }
  };
  checkUpdate = async () => {
    if (__DEV__) {
      // 开发模式不支持热更新，跳过检查
      return;
    }
    let info;
    try {
      info = await checkUpdate(appKey);
    } catch (err) {
      console.warn(err);
      return;
    }
    if (info.expired) {
      Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
        { text: '确定', onPress: () => { info.downloadUrl && Linking.openURL(info.downloadUrl) } },
      ]);
    } else if (info.upToDate) {
      Alert.alert('提示', '您的应用版本已是最新.');
    } else {
      Alert.alert('提示', '检查到新的版本' + info.name + ',是否下载?\n' + info.description, [
        { text: '是', onPress: () => { this.doUpdate(info) } },
        { text: '否', },
      ]);
    }
  };
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          欢迎使用热更新服务
        </Text>
        <Text style={styles.instructions}>
          这是版本一 {'\n'}
          当前包版本号: {packageVersion}{'\n'}
          当前版本Hash: {currentVersion || '(空)'}{'\n'}
        </Text>
        <TouchableOpacity onPress={this.checkUpdate}>
          <Text style={styles.instructions}>
            点击这里检查更新2.1
          </Text>
        </TouchableOpacity>
        <Text style={styles.welcome}>
          更新进度{this.state.progress}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default App;
