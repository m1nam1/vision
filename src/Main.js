import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Button,
    Alert,
    Vibration,
    ToastAndroid,
    Dimensions
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Camera from 'react-native-camera';
import { API_KEY } from '../config.js';

export default class Vision extends Component {
    constructor(props) {
        super(props);
        this.state = {
            camera_type: 'back'
        };
    }

    takePicture() {
        console.info('takePicture');
        this.camera.capture()
            .then(data => {
                console.log('data:', data);
                Vibration.vibrate();
                ToastAndroid.show('Analyzing...', ToastAndroid.SHORT);
                const feature_type = 'LABEL_DETECTION';
                this.detectImage(data.data, feature_type)
                    .then(responses => {
                        ToastAndroid.show('Complete!', ToastAndroid.SHORT);
                        let msg = '';
                        for (let i = 0; i < responses[0].labelAnnotations.length; i++) {
                            msg += `${i+1}: ${responses[0].labelAnnotations[i].description}\n`;
                        };
                        Alert.alert(feature_type, msg);
                    });
            })
            .catch(err => console.error(err));
    }

    switchCameraType() {
        const camera_type = this.state.camera_type;
        switch (camera_type) {
            case 'front':
                this.setState({camera_type: 'back'});
                break;
            case 'back':
                this.setState({camera_type: 'front'});
                break;
            default:
                console.error(`Invalid camera_type: ${camera_type}`);
        }
    }

    /**
     * 画像を解析
     * Google Cloud Vision API
     * @param {string} image_data - 画像データ (base64 encoded)
     * @param {string} feature_type - 検出タイプ
     * @return {promise} 解析結果
     */
    detectImage(image_data, feature_type) {
        console.info('detectImage');
        const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
        console.log(url);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'requests': [{
                    'image': {
                        'content': image_data
                    },
                    'features': [{
                        'type': feature_type,
                        'maxResults': 20
                    }]
                }]
            })
        })
            .then(response => {
                if (!response.ok) throw Error(response.statusText);
                return response.json();
            })
            .then(json => {
                const responses = json.responses;
                console.log('responses:', responses);
                return responses;
            })
            .catch(err => console.error(err));
    }

    render() {
        return (
            <View style={styles.container}>
                <Camera
                    ref={cam => this.camera = cam}
                    style={styles.preview}
                    captureTarget={Camera.constants.CaptureTarget.memory}
                    type={this.state.camera_type}
                    playSoundOnCapture={false}
                >
                    <View style={styles.btn}>
                        <Button title="Capture" onPress={this.takePicture.bind(this)}></Button>
                    </View>
                    <View style={styles.option_area}>
                        <View style={styles.option_btn}>
                            <Button title="Switch" onPress={this.switchCameraType.bind(this)}></Button>
                        </View>
                        <View style={styles.option_btn}>
                            <Button title="Setting" onPress={() => Actions.settings()}></Button>
                        </View>
                    </View>
                </Camera>
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
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    btn: {
        width: 100,
        marginBottom: 40
    },
    option_area: {
        flexDirection: 'row',
    },
    option_btn: {
        width: 100,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 40
    }
});
