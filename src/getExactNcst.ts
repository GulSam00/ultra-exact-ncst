import axios from 'axios';
import { format, getMinutes, subHours } from 'date-fns';

import _code_local from './parse_api_code.js';
import { ICodeCoordJson, GetNcstRequestTypes, GetNcstResponseTypes } from './types';

const code_local = _code_local as ICodeCoordJson[]; // 타입 정의는 유지
const ncstURL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';

export const getParamsByCode = (code: number, dong?: string) => {
  const parsedLocal = code_local.find(item => item.code === Number(code));
  if (!parsedLocal) {
    if (!dong) throw new Error('해당 지역 정보를 찾을 수 없습니다.');
    const depth3Local = code_local.find(item => item.depth3 === dong);
    if (!depth3Local) throw new Error('해당 지역 정보를 찾을 수 없습니다.');
    return depth3Local;
  }
  return parsedLocal;
};

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
