import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance } from 'axios';
import { format, getMinutes, subHours } from 'date-fns';

import _code_local from './short_api_code.json';
const code_local = _code_local as ICodeCoordJson[];

const kakaoURL = 'http://dapi.kakao.com/v2/local';
const ncstURL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

interface ICodeCoordJson {
  code: number;
  depth1: string;
  depth2: string;
  depth3: string;
  x: number;
  y: number;
}

export interface IRegion {
  address_name: string;
  code: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
  region_4depth_name: string;
  region_type: string;
  x: number;
  y: number;
}

interface getNcstTypes {
  x: number;
  y: number;
}

// config 파일 읽는 함수
const loadConfig = () => {
  const configPath = path.resolve(process.cwd(), 'config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error('config.json 파일을 찾을 수 없습니다. API 키를 설정하세요.');
  }

  const configData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configData);
};

const getNcst = async ({ x, y }: getNcstTypes): Promise<any> => {
  const config = loadConfig();
  const url = ncstURL + '/getUltraSrtNcst';

  const ncstKey = config.ncstKey;
  const params = {
    serviceKey: ncstKey,
    dataType: 'JSON',
    base_date: '',
    base_time: '',
    numOfRows: '1000',
    nx: 0,
    ny: 0,
  };

  let base_date = new Date();
  const date = format(base_date, 'yyyyMMdd');
  if (getMinutes(base_date) <= 10) base_date = subHours(base_date, 1);
  const hour = format(base_date, 'HH');
  params.base_date = date;
  params.base_time = hour + '00';
  params.nx = x;
  params.ny = y;

  try {
    const result = await axios.get(url, { params });
    const data = result.data.response.body.items.item;
    console.log('ncst result', data);

    return data;
  } catch (e) {
    let message;
    if (e instanceof Error) message = e.message;
    else message = String(e);
    console.error(message);
    return undefined;
  }
};

export const getKakaoNcst = async ({ x, y }: getNcstTypes): Promise<any> => {
  const config = loadConfig();
  const url = kakaoURL + '/geo/coord2regioncode';
  try {
    const result = await axios.get(url, {
      params: {
        x,
        y,
      },
      headers: {
        Authorization: `KakaoAK ${config.kakaoKey}`,
      },
    });

    console.log('kakao result', result);
    const documents = result.data.documents as IRegion[];
    const localeCode = documents[1].code;
    const parsedLocal = code_local.find(item => item.code === Number(localeCode));
    if (!parsedLocal) throw new Error('지역 코드를 찾을 수 없습니다.');

    const { x: nx, y: ny } = parsedLocal;

    return getNcst({ x: nx, y: ny });
  } catch (e) {
    let message;
    if (e instanceof Error) message = e.message;
    else message = String(e);
    console.error(message);
    return undefined;
  }
};
