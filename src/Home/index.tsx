import { useEffect, useState } from "react";
import { Camera, CameraType, FaceDetectionResult } from "expo-camera";
import { Image, ImageSourcePropType, View } from "react-native";
import { styles } from "./styles";
import * as FaceDetector from 'expo-face-detector';
import { useSharedValue, useAnimatedStyle } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import neutral2 from "../assets/neutral2.png"
import smileImg from "../assets/smile.png"
import winkingImg from "../assets/winking.png"
import sleepingImg from "../assets/sleeping.png"
import poutingImg from "../assets/pouting.png"
const Home = () => {
  const [faceDetected, setFaceDetected] = useState(false)
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutral2);

  useEffect(() => {
    requestPermission();
  }, []);


  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0
  })
  const handleFacesDetected = ({ faces }: FaceDetectionResult) => {
    console.log(faces)
    const face = faces[0] as any;

    if (face) {
      const { size, origin } = face.bounds;

      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y

      }
      setFaceDetected(true)

      if (face.smilingProbability > 0.5) {
        setEmoji(smileImg)
      } else if (face.leftEyeOpenProbability > 0.5 && face.rightEyeOpenProbability < 0.5) {
        setEmoji(winkingImg)
      }
      else if (face.leftEyeOpenProbability < 0.2 && face.rightEyeOpenProbability < 0.2) {
        setEmoji(sleepingImg)
      } else if (face.emotions?.angry > 0.5) { 
        setEmoji(poutingImg);
 
      }

      else {
        setEmoji(neutral2)
      }

    } else {
      setFaceDetected(false)
    }

  }


  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 20,
    // flex:1,
    objectFit: 'contain',
    width: faceValues.value.width,
    height: faceValues.value.height,
    transform: [
      { translateX: faceValues.value.x },
      { translateY: faceValues.value.y },
    ],
    // borderColor: 'blue',
    // borderWidth: 6
  }))



  if (!permission?.granted) {
    return;
  }
  return (
    <View style={styles.container}>
      {faceDetected && <Animated.Image style={animatedStyle} source={emoji} />}
      <Camera style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
};

export default Home;
