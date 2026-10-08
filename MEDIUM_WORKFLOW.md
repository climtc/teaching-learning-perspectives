# GitHub와 Medium의 작업 흐름

GitHub는 코드·자료·출처·버전과 조작 가능한 실험의 1차 저장소로 유지한다. Medium에는 저자가 공개를 결정한 글과 사례 링크를 둔다. 작업 중인 글과 자료는 로컬에서 관리한다.

## 확인한 환경

GitHub Pages 링크는 Medium에서 제목·설명·주소를 가진 미리보기 카드로 표시된다. 독자가 카드를 눌러 GitHub의 조작 가능한 실험을 열도록 연결한다.

Medium의 [공식 임베딩 안내](https://help.medium.com/hc/en-us/articles/214981378-Using-embeds)에 따르면 새 줄에 URL을 붙여 넣고 Enter를 누른다. 지원되는 제공자는 임베드로, 지원되지 않는 제공자는 미리보기 카드로 표시된다. iframe 임베드 코드와 임의 스크립트 삽입은 지원하지 않는다. GitHub Gist의 코드 표시와 GitHub Pages 웹 앱의 실행은 구별해야 한다.

## 검증된 게시 구성

1. Medium 본문에서 사례가 답하는 질문과 도식을 설명한다.
2. 새 줄에 아래의 공개 사례 URL을 넣어 카드로 변환한다.
3. ‘조건을 바꾸어 직접 확인하기’라는 안내로 독자가 GitHub 페이지를 열게 한다.
4. 실험 결과를 해석하는 본문과 자료의 범위·출처를 이어 쓴다.

썸네일을 사용할 경우 GitHub에 보관한 도식 또는 확인 화면의 이미지와 실험 링크를 함께 둔다. 카드가 로딩되지 않아도 링크 텍스트로 이동할 수 있게 한다. 코드와 원자료의 수정은 GitHub에서 추적하고, Medium에는 게시 시점의 커밋·자료 버전을 표기한다. 이미 게시한 글의 문장을 자동 갱신하는 기능은 이 작업에서 만들지 않았다.

## 이번 단계에서 연결할 URL

- **국가 지표 — 시간축을 펼치기**: https://climtc.github.io/teaching-learning-perspectives/gapminder-time.html
- **교실 창문 — 시선의 높이와 방향**: https://climtc.github.io/teaching-learning-perspectives/classroom-window.html
- **개념공간 — 축과 관점의 선택**: https://climtc.github.io/teaching-learning-perspectives/conceptual-lenses.html
- **구면 삼각형 — 안에서 측정하는 곡률**: https://climtc.github.io/teaching-learning-perspectives/spherical-triangle.html
- **연속과 표본 — 같아 보이는 다른 신호**: https://climtc.github.io/teaching-learning-perspectives/sampling-aliasing.html

GitHub를 유지한 채 Medium 본문 안의 완전한 상호작용이 꼭 필요해지면, Medium이 지원하는 별도 제공자에서 실험을 충실하게 재현할 수 있는지 다음 단계에서 비교한다. 현재 작업은 링크 카드 방식을 검증했고, 지원 제한을 우회하거나 CSP·sandbox를 해제하지 않았다.
