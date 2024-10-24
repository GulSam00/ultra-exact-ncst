import axios from 'axios';
import { format, getMinutes, subHours } from 'date-fns';
import _code_local from './short_api_code.json';

interface ICodeCoordJson {
  code: number;
  depth1: string;
  depth2: string;
  depth3: string;
  x: number;
  y: number;
}

export interface getKakaoLocalResponseTypes {
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

const getNcst = async ({ x, y, ncstKey }: GetNcstRequestTypes): Promise<GetNcstResponseTypes | undefined> => {
  const url = ncstURL + '/getUltraSrtNcst';
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

export const getKakaoLocal = async ({
  x,
  y,
  kakaoKey,
}: GetNcstRequestTypes): Promise<getKakaoLocalResponseTypes | undefined> => {
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

    const documents = result.data.documents;
    const localeCode = documents[1].code;
    const parsedLocal = code_local.find(item => item.code === Number(localeCode));
    if (!parsedLocal) throw new Error('지역 코드를 찾을 수 없습니다.');

    const { x: nx, y: ny } = parsedLocal;
    return { x: nx, y: ny };
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
