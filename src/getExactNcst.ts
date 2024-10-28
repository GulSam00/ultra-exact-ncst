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
  const url = ncstURL + '/getUltraSrtNcst';

  if (!x || !y) throw new Error('좌표값이 유효하지 않습니다.');
  if (!ncstKey) throw new Error('API 키가 필요합니다.');
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
    const data: GetNcstResponseTypes = result.data.response.body.items.item;
    return data;
  } catch (e) {
    let message;
    if (e instanceof Error) message = e.message;
    else message = String(e);
    console.error(message);
    return undefined;
  }
};

export const getKakaoLocal = async ({ x, y, kakaoKey }: GetNcstRequestTypes): Promise<ICodeCoordJson | undefined> => {
  const url = kakaoURL + '/geo/coord2regioncode';

  if (!kakaoKey) throw new Error('API 키가 필요합니다.');

  try {
    const result = await axios.get(url, {
      params: {
        x,
        y,
      },
      headers: {
        Authorization: `KakaoAK ${kakaoKey}`,
      },
    });

    const document = result.data.documents[1];
    const { code, region_3depth_name } = document;
    const parsedLocal = code_local.find(item => item.code === Number(code));
    if (!parsedLocal) {
      const depth3Local = code_local.find(item => item.depth3 === region_3depth_name);
      return depth3Local;
    }
    return parsedLocal;
  } catch (e) {
    let message;
    if (e instanceof Error) message = e.message;
    else message = String(e);
    console.error(message);
    return undefined;
  }
};

export const getKakaoNcst = async ({
  x,
  y,
  kakaoKey,
  ncstKey,
}: GetNcstRequestTypes): Promise<GetNcstResponseTypes | undefined> => {
  const local = await getKakaoLocal({ x, y, kakaoKey });

  if (!local) throw new Error('지역 정보를 가져올 수 없습니다.');
  if (!ncstKey) throw new Error('API 키가 필요합니다.');

  try {
    return getNcst({ x: local.x, y: local.y, ncstKey });
  } catch (e) {
    let message;
    if (e instanceof Error) message = e.message;
    else message = String(e);
    console.error(message);
    return undefined;
  }
};
