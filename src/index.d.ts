declare module 'ultra-exact-ncst' {
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

  export function getKakaoNcst({
    x,
    y,
    kakaoKey,
    ncstKey,
  }: GetNcstRequestTypes): Promise<GetNcstResponseTypes | undefined>;
}
