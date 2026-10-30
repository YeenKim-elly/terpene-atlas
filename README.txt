TERPENE ATLAS
=============

테르펜을 배우고 분자 구조를 편리하게 탐색하는 한국어·영어 사이트입니다.
구조 모음, 경로 지도, 나란히 구조 비교와 연습 기능으로 화학을 익힙니다.

주요 기능
---------

- 분자 111개, 전구체 17개, 골격·고리 참고 항목 42개, 모티프 37개, 효소 반응 59개
- 전구체·C10·C15·C20·C40·골격과 고리를 살펴보는 여섯 탭과 열네 지도
- C10·C15·C20 전구체–효소–골격 분기와 C40 말단 고리 개요
- 라이브러리와 Structure web의 C10·C15·C20·C40 골격 모음과 공통 고리 필터
- 관련 경로에 연결되는 iridoid·artemisinin·kaurane·gibberellin·taxane 예시
- C40 기하배열·고리 변형과 C40 유래 C15 apocarotenoid 구분
- Diterpenoid 전구체 골격·전체 경로 지도와 C20 고리 융합·재배열·clerodane 유형 보기
- Iridoid·artemisinin·gibberellin·식물 poly-cis·astaxanthin ester·ABA 절단 경로
- C40 유래 C15 apocarotenoid 구분과 NCED의 C25 공동 생성물 표시
- 연결망 전체화면, 확대·축소, 전체 맞춤(Fit), Esc로 닫기
- 객관식과 직접 입력 방식의 연습, 힌트와 복습
- 정렬된 구조 비교 18개
- 한국어·영어 인터페이스
- 항목별 출처와 입체화학 범위, 그림의 저작자와 이용 조건 표시

항목 수에는 대체 데이터베이스 표현과 부분적인 입체배열 모형이 포함됩니다.
구조 비교 화면에서는 분자 참고 기록 2개를 추가로 사용합니다.

로컬 실행
---------

Node.js 22 이상과 npm이 필요합니다.
패키지를 설치하거나 빌드할 필요 없이 저장소 폴더에서 실행합니다.

    npm start

기본 주소: http://127.0.0.1:5173
다른 포트 사용: npm start -- --port 8080

검증:

    npm run check

npm 없이 실행하려면 다음 명령을 사용할 수 있습니다.

    node scripts/serve.mjs
    node scripts/check.mjs

HTML 파일을 직접 여는 대신 표시된 HTTP 주소를 사용하세요.

파일 구성
---------

index.html   시작 페이지
src/         화면, 공통 구성 요소, 퀴즈와 연결선 로직
styles/      화면별 스타일
data/        구조, 반응, 문제, 연결망, 참고문헌
assets/      로고와 구조 그림
scripts/     로컬 실행과 검증
tests/       데이터와 주요 동작 확인
docs/        앱 구성과 데이터 형식

자세한 설명: README.md
자료별 출처와 이용 조건: THIRD_PARTY_NOTICES.md

참고 사항
---------

구조의 유사성만으로 생합성 전환이나 물질의 동정을 확정할 수는 없습니다.
항목별 출처와 반응의 적용 범위, 입체화학의 한계를 함께 확인하세요.
