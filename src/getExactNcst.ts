import axios from 'axios';
import { format, getMinutes, subHours } from 'date-fns';
import _code_local from './short_api_code.json' assert { type: 'json' };

interface ICodeCoordJson {
  code: number;
  address_name: string;
  depth1: string;
  depth2: string;
  depth3: string;
  x: number;
  y: number;
}

export interface GetNcstRequestTypes {
  x: number;
  y: number;
  kakaoKey?: string;
  ncstKey?: string;
}

export interface WeatherData {
  baseDate: string; // 예: '20241023'
  baseTime: string; // 예: '2100'
  category: string; // 예: 'PTY', 'REH', 'RN1', 'T1H', 'UUU', 'VEC', 'VVV', 'WSD'
  nx: number; // 예: 56
  ny: number; // 예: 112
  obsrValue: string; // 예: '62', '-1.1', '2.6'
}

export type GetNcstResponseTypes = WeatherData[];

const code_local = _code_local as ICodeCoordJson[]; // 타입 정의는 유지

const kakaoURL = 'http://dapi.kakao.com/v2/local';
const ncstURL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

export const getNcst = async ({ x, y, ncstKey }: GetNcstRequestTypes): Promise<GetNcstResponseTypes | undefined> => {
  try {
    if (typeof x !== 'number' || typeof y !== 'number') throw new Error('x, y 자료형이 number가 아닙니다.');
    if (!ncstKey) throw new Error('ncstKey가 필요합니다.');

    const url = ncstURL + '/getUltraSrtNcst';
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

    const result = await axios.get(url, { params });
    // API키 오류 시 result에서 어떻게 구분할까
    const data: GetNcstResponseTypes = result.data?.response?.body?.items?.item;
    if (!data || data.length === 0) {
      throw new Error('API 요청이 실패했습니다.');
    }
    return data;
  } catch (e) {
    console.error('getNcst error');
    console.error(e);
    return undefined;
  }
};

export const getKakaoLocal = async ({ x, y, kakaoKey }: GetNcstRequestTypes): Promise<ICodeCoordJson | undefined> => {
  try {
    if (typeof x !== 'number' || typeof y !== 'number') throw new Error('x, y 자료형이 number가 아닙니다.');
    if (!kakaoKey) throw new Error('kakaoKey가 필요합니다.');
    const url = kakaoURL + '/geo/coord2regioncode';
    const result = await axios.get(url, {
      params: {
        x,
        y,
      },
      headers: {
        Authorization: `KakaoAK ${kakaoKey}`,
      },
    });

    const document = result?.data?.documents[1];
    if (!document) throw new Error('API 요청이 실패했습니다.');

    const { code, region_3depth_name } = document;
    const parsedLocal = code_local.find(item => item.code === Number(code));
    if (!parsedLocal) {
      const depth3Local = code_local.find(item => item.depth3 === region_3depth_name);
      if (!depth3Local) throw new Error('해당 지역 정보를 찾을 수 없습니다.');
      return depth3Local;
    }
    return parsedLocal;
  } catch (e) {
    console.error('getKakaoLocal error');
    console.error(e);
    return undefined;
  }
};

export const getKakaoNcst = async ({
  x,
  y,
  kakaoKey,
  ncstKey,
}: GetNcstRequestTypes): Promise<GetNcstResponseTypes | undefined> => {
  try {
    if (typeof x !== 'number' || typeof y !== 'number') throw new Error('x, y 자료형이 number가 아닙니다.');

    if (!ncstKey) throw new Error('ncstKey가 필요합니다.');
    if (!kakaoKey) throw new Error('kakaoKey가 필요합니다.');

    const local = await getKakaoLocal({ x, y, kakaoKey });
    if (!local) throw new Error('지역 정보를 가져올 수 없습니다.');
    return getNcst({ x: local.x, y: local.y, ncstKey });
  } catch (e) {
    console.error('getKakaoNcst error');
    console.error(e);
    return undefined;
  }
};
