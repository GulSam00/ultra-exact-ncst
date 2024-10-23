import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance } from 'axios';

const kakaoURL = 'http://dapi.kakao.com/v2/local';
const ncstURL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

export const hello = () => {
  console.log('Hello World!');
};
