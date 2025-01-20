export interface ICodeCoordJson {
  code: number;
  address_name: string;
  depth1: string;
  depth2: string;
  depth3: string;
  x: number;
  y: number;
}

export interface GetParamsByCodeRequest {
  code: number;
  dong?: string;
}

export interface GetNcstRequest {
  x: number;
  y: number;
  ncstKey: string;
}

export interface GetKakaoNcstRequest {
  x: number;
  y: number;
  kakaoKey: string;
  ncstKey?: string;
}

interface WeatherData {
  baseDate: string; // 예: '20241023'
  baseTime: string; // 예: '2100'
  category: string; // 예: 'PTY', 'REH', 'RN1', 'T1H', 'UUU', 'VEC', 'VVV', 'WSD'
  nx: number; // 예: 56
  ny: number; // 예: 112
  obsrValue: string; // 예: '62', '-1.1', '2.6'
}

export type GetNcstResponseTypes = WeatherData[];
