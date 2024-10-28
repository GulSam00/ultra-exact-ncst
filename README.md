<h1 align="center">ultra-exact-ncst 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/ultra-exact-ncst" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/ultra-exact-ncst.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

* [카카오 local API](https://developers.kakao.com/docs/latest/ko/local/dev-guide#address-coord)와 공공데이터 포털이 제공하는 [기상청 API](https://www.data.go.kr/data/15084084/openapi.do)를 연동할 수 있는 라이브러리입니다.

### 🏠 [Homepage](https://github.com/GulSam00/ultra-exact-ncst)

## Usage

사용하기 위해선 직접 카카오 API의 REST API 키와 공공데이터 포털의 개인 API 키를 발급 받아야 합니다.
- [카카오 API키 신청하기](https://developers.kakao.com/console/app)
- [공공데이터 포털 API키 신청하기](https://www.data.go.kr/index.do)
  
### 사용 예제
> 이 패키지는 TypeScript를 지원합니다. 별도의 설정 없이 타입 정의 파일이 포함되어 있어, 자동으로 타입 정보를 제공받을 수 있습니다.

```js
import { getKakaoNcst, getKakaoLocal, getNcst } from 'ultra-exact-ncst';
import dotenv from 'dotenv';
dotenv.config();

const kakaoKey = process.env.KAKAO_KEY;
const ncstKey = process.env.NCST_KEY;


const kakaoLocalResult = await getKakaoLocal({ x: 126.65955373649118, y: 37.42760161347335, kakaoKey });
const kakaoNcstResult = await getKakaoNcst({ x: 126.65955373649118, y: 37.42760161347335, kakaoKey, ncstKey });

const ncstResult = await getNcst({x : 54, y : 124, ncstKey});

console.log("kakaoLocalResult", kakaoLocalResult);
console.log("kakaoNcstResult", kakaoNcstResult);
console.log("ncstResult", ncstResult);
```

## Install

```sh
npm i ultra-exact-ncst
```

## Author

👤 **GulSam00**

* Website: https://github.com/GulSam00
* Github: [@GulSam00](https://github.com/GulSam00)
* LinkedIn: [@SangJoon  Ham]([https://linkedin.com/in/SangJoon Ham](https://www.linkedin.com/in/sang-joon-ham-b53805220/))

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/GulSam00/ultra-exact-ncst). 

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_