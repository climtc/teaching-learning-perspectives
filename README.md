# 차원 압축과 펼침 실험

[전체 사례 탐색](https://climtc.github.io/teaching-learning-perspectives/geometry-lab.html) · [라캉의 세 질문](https://climtc.github.io/teaching-learning-perspectives/lacan-problems.html)

[출발 사례: 가르치다와 배우다](https://climtc.github.io/teaching-learning-perspectives/) · [관련 강연](https://www.youtube.com/watch?v=cvE8M0FkCFc)

## 저장소 개요

**차원 압축과 펼침 실험**은 임완철이 책에서 제안한 **차원증감법**을 바탕으로, 평면의 작품·도식과 조작 가능한 디지털 표현을 비교하는 프로젝트다. 원근법과 회화, 표면과 매듭, 단면과 4차원 도형, 실제 고차원 데이터까지 긴 시간축에서 탐색한다. 각 사례는 상단의 비교 실험과 하단에서 독립적으로 스크롤하는 읽을 자료, 원작이나 재도식의 출처를 제공한다.

대상의 물리적 깊이, 곡면 자체의 차원, 데이터의 변수 수, 시점과 조작의 자유도를 구별한다. 차원을 더할 때 확인하게 되는 관계와 압축 과정에서 잃는 정보를 함께 검토한다. 기존 라캉 연구는 경계·반복·전체 결속이라는 문제와 그 적용 조건을 설명하는 이론 자료로 연결했다. 프로젝트 이름과 메뉴는 확장했으며 기존 페이지 URL을 유지한다.

## 출발 사례 — 가르치다와 배우다

가르치는 사람이 의도한 것과 배우는 사람이 배운 것은 같은 것일까? 출발 사례는 그 물음을 두 구의 공간 배치와 시선에 따른 투영으로 탐구하는 인터랙티브 시각화다. 파란 구는 ‘가르치다’, 주황 구는 ‘배우다’를 나타낸다. 두 구의 거리를 유지한 채 시선을 바꾸면, 공간에서의 관계는 그대로인데 평면에 겹쳐 보이는 모습은 달라진다. 이를 통해 관계 자체와 관계를 표현하는 기호, 그리고 그 기호를 바라보는 관점을 함께 생각할 수 있다.

이 탐구의 바탕은 임완철의 『읽는다는 것의 미래: 책이 생각하게 되면 우리는 무엇을 읽어야 할까?』에 있다. 이 책은 단어와 수업, 학습이라는 장치가 교육을 이해하는 방식에 어떻게 관여하는지 살핀다. ‘가르쳤다’는 말이 곧바로 ‘배웠다’는 사실을 보증하지 않으며, 가르침에서 의도한 ‘무엇’과 배움에서 일어난 ‘무엇’을 동일하게 놓을 수 있는지도 다시 물어야 한다. 변화하는 과정을 하나의 단어와 그림에 고정하면 생각하기는 쉬워지지만, 그 표현이 드러내지 못하는 과정과 경계도 생긴다.[1]

벤다이어그램에 차원을 더하는 구체적인 발상은 같은 저자의 『가르치는 인공지능은 가능한가?: 장치의 교육학을 위한 시론』에서 확인된다. 이 책은 가르침과 배움을 나타내는 원을 3차원 공간의 구로 상상하거나, 서로 다른 평면 위에 놓인 원으로 생각해 보자고 제안한다. 한 방향에서 겹쳐 보이던 것이 다른 방향에서는 떨어져 보일 수 있다는 발견은, 기호 자체를 탐구의 대상으로 삼게 한다.[2] 이 시각화는 그 제안 중 ‘두 구’의 경우를 조작 가능한 모형으로 구현했다.

여기서 겹침은 교육의 성과를 계산하는 지표가 아니다. 두 구는 관계를 생각하기 위한 기하학적 모형이며, 동일한 반지름을 선택한 것 또한 구현상의 가정이다. 실제 집합의 교집합은 관찰자의 시선만으로 바뀌지 않는다. 화면은 **공간에서 구들이 공유하는 부피**와 **평면에 투영되어 겹쳐 보이는 면적**을 따로 표시해 이 차이를 드러낸다. 학생과 교사의 시선은 강연을 설명하기 위한 예시이며, 모든 학생과 교사를 일정한 관점으로 분류하지 않는다.

## 사용 방법

1. ‘시선의 주인’ 또는 ‘시선의 방향’을 바꾸며 오른쪽 투영을 비교한다. 거리를 그대로 두었다면 왼쪽의 실제 교집합 부피는 변하지 않는다.
2. ‘두 구의 중심 간 거리’를 바꾸어 실제 공간의 관계가 바뀌는 경우와 비교한다. 거리는 구의 반지름을 단위로 표시한다.
3. 왼쪽 배치 그림을 드래그하거나 시점 메뉴를 바꿔 두 구가 공간에 놓인 모습을 살핀다. 이 배치 그림의 회전과 오른쪽 투영을 정하는 시선의 방향은 별개의 조작이다.
4. 상단 시각화를 보면서 하단의 ‘읽을 자료’를 스크롤해 설명과 출처를 읽는다. 읽기 영역은 키보드로 초점을 옮겨 스크롤할 수도 있다.

표시되는 부피 비율은 ‘공유 부피 ÷ 구 하나의 부피’, 면적 비율은 ‘투영의 겹친 면적 ÷ 원 하나의 면적’이다. 어느 비율도 학습률, 수업 효과, 통계적 상관계수 또는 인과관계의 추정치가 아니다.

## 책 출처

**[1]** 임완철. (2019). *읽는다는 것의 미래: 책이 생각하게 되면 우리는 무엇을 읽어야 할까?* 지식노마드. ISBN 979-11-87481-52-2. 제2장 「교육 문제를 다룰 때 작동하는 우리 생각의 기초들」, 특히 「단어: 변화를 시공간에 고정시키는 장치」(54–57쪽), 「수업: 알고 있는 것과 알고 있지 않은 것 사이의 경계를 다루는 장치」(58–62쪽), 「학습: ‘가르치다’의 결과로서 배치된 개념 장치」(63–65쪽). [도서 정보](https://www.yes24.com/product/goods/69288352)

**[2]** 임완철. (2020). *가르치는 인공지능은 가능한가?: 장치의 교육학을 위한 시론*. 새물결. ISBN 978-89-5559-427-0. 제7장 「교육장치의 디지털전환」 중 「16. 5. 차원을 높여 생각하는 방법」. [도서 정보](https://m.yes24.com/Goods/Detail/94158747)

‘가르침과 배움을 동일하게 놓을 수 있는가’라는 문제의 바탕은 [1]에, ‘원을 구로 바꾸어 차원을 더하자’는 직접적인 벤다이어그램 설명은 [2]에 있다. 저장소 개요와 페이지의 읽을 글은 두 책의 해당 논의를 바탕으로 새로 작성한 해설이다. 원문을 그대로 전재하거나 원본 원고 파일을 공개하지 않는다.

## 보로메오 고리와 라캉

[보로메오 고리 시각화와 읽을 자료](https://climtc.github.io/teaching-learning-perspectives/borromean-rings.html)

상단에서 세 타원형 고리를 회전하고 하나를 제거한 뒤 남은 둘을 분리할 수 있다. 하단의 읽을 글은 라캉의 실재·상징·상상, 매듭을 글쓰기로 다루는 문제, 세미나 XXIII의 생톰과 결속의 교정을 설명한다. 읽기 영역은 시각화와 독립적으로 스크롤된다. A=실재 R, B=상징 S, C=상상 I라는 대응과 색상은 이 페이지의 설명을 위한 선택이다. 고리 제거는 수학적 연결 조건을 살피는 조작이며 정신분석적 진단을 뜻하지 않는다.

원전은 세미나 XX *Encore*의 1973년 5월 15일 강의, 세미나 XXII *R.S.I.*의 1974년 12월 10일과 17일 강의, 세미나 XXIII *Le sinthome*의 1975년 12월 9일과 1976년 2월 17일 강의다. 페이지의 문헌란에 공개 프랑스어 전사본의 PDF 쪽수와 링크를 제공하며, 전사본·연구용 번역·정식 출판본을 구분한다. 개념 설명에는 Adrian Johnston의 [Stanford Encyclopedia of Philosophy 해설](https://plato.stanford.edu/entries/lacan/)을, 수학적 성질에는 Eric W. Weisstein의 [MathWorld 설명](https://mathworld.wolfram.com/BorromeanRings.html)을 참고했다.

상단에는 라캉의 『앙코르』 강의 전사본에 수록된 정지 도식과 조작 가능한 입체 모형을 나란히 배치했다. 도식은 1973년 5월 15일 강의의 STAFERLA 프랑스어 전사본 **PDF 140쪽**에서 캡처했으며, ‘캡처한 페이지 전체 보기’ 버튼으로 본문과 쪽수를 함께 확인할 수 있다. 자필 원고의 사진이 아닌 **전사본의 편집 도식**이다. [캡처 출처 PDF](http://staferla.free.fr/S20/S20%20ENCORE.pdf#page=140)

비교 해설은 평면에서 교차를 기록하는 방식과 디지털 공간에서 시점 및 제거·분리 조건을 바꾸는 방식을 연결한다. ‘설명량의 증가’는 독자가 구별하고 시험할 수 있는 관계와 조건의 범위가 넓어지는 것으로 설명하고, 가르침과 배움의 3차원 벤다이어그램 사례로 이어진다. 하단 제목은 스크롤 밖에 유지되며 본문만 독립적으로 스크롤된다.

## 구성과 게시

- `index.html`: 시각화와 독립적으로 스크롤되는 읽기 영역을 함께 제공하는 정적 페이지.
- `borromean-rings.html`: 보로메오 고리의 시각화와 라캉에 관한 읽을 자료.
- `.nojekyll`: GitHub Pages에서 파일을 그대로 제공하기 위한 설정.
- `README.md`: 저장소 개요, 사용 방법, 책 출처.

시각화는 `sandbox="allow-scripts"`인 iframe 안에서 실행된다. 기존 페이지와 iframe의 Content Security Policy를 보존했다. `main` 브랜치의 루트를 GitHub Pages로 게시한다.


## 개별 사례와 원전 안내

[전체 개별 사례 탐색](https://climtc.github.io/teaching-learning-perspectives/geometry-lab.html) · [라캉 원전 읽기 안내](https://climtc.github.io/teaching-learning-perspectives/lacan-atlas.html)

세미나 IX에서 XXIII까지의 토러스, 뫼비우스의 띠, 끈의 고리, 세잎매듭, 생톰을 새 페이지로 구현했다. 각 페이지는 원문 도식과 회전·조건 변경이 가능한 모형을 상단에 배치하고, 고정된 읽기 제목 아래의 본문만 독립적으로 스크롤한다.

- [토러스 — 두 종류의 순환](https://climtc.github.io/teaching-learning-perspectives/torus.html) — 세미나 IX, 1962년 3월 7일, STAFERLA PDF 110쪽.
- [뫼비우스의 띠 — 표면과 방향](https://climtc.github.io/teaching-learning-perspectives/mobius-strip.html) — 세미나 IX, 1962년 5월 23일, STAFERLA PDF 202쪽.
- [끈의 고리 — 닫힘과 절단](https://climtc.github.io/teaching-learning-perspectives/rings-and-cuts.html) — 세미나 XX, 1973년 5월 15일, STAFERLA PDF 139쪽.
- [세잎매듭 — 한 줄과 교차](https://climtc.github.io/teaching-learning-perspectives/trefoil-knot.html) — 세미나 XXIII, 1976년 2월 10일, STAFERLA PDF 64쪽.
- [생톰 — 오류와 교정의 자리](https://climtc.github.io/teaching-learning-perspectives/sinthome.html) — 세미나 XXIII, 1976년 2월 17일, STAFERLA PDF 72쪽.

[선정과 구현 계획](LACAN_ATLAS_PLAN.md) · [출처와 원본 해시](lacan-atlas-sources.json)

캡처는 STAFERLA 작업 전사본의 편집 도식이며 라캉 자필 원고로 표시하지 않는다. Hopf 링크는 비교용 수학 사례이며, 생톰 모형은 교정의 자리라는 질문을 다루는 재구성이다. 전체 도식과의 위상적 동등성을 증명했다고 주장하지 않는다.

토러스와 뫼비우스의 띠 자체는 2차원 표면이다. 3차원 좌표와 상호작용은 독자가 확인할 수 있는 시점과 조건을 늘린다. 평면 도식 자체의 수학적 표현 능력과 구별하여 설명한다.

책과의 연결: 임완철, 『읽는다는 것의 미래』(2019), 제2장 「교육 문제를 다룰 때 작동하는 우리 생각의 기초들」; 『가르치는 인공지능은 가능한가?』(2020), 제7장 중 「16. 5. 차원을 높여 생각하는 방법」. 이번 글은 연구용 해설이며 책의 단원 전체를 전재한 것이 아니다. 이 여섯 사례는 전체 목록에서 각자 하나의 항목으로 관리하며, 라캉은 문헌의 출처로 기록한다. 다른 텍스트의 사례와 이론 모형은 아래의 확장 단계에 정리했다.

## 시각화 확장과 이론 모형 — 차원 압축과 펼침 실험

[차원 압축과 펼침 실험](https://climtc.github.io/teaching-learning-perspectives/geometry-lab.html)

첫 방향은 라캉 밖의 원전에서 선정한 [플랫랜드의 단면](https://climtc.github.io/teaching-learning-perspectives/flatland-slices.html), [오일러의 다리](https://climtc.github.io/teaching-learning-perspectives/euler-bridges.html), [로렌츠의 상태 공간](https://climtc.github.io/teaching-learning-perspectives/lorenz-flow.html)이다. 각각 평면 도식, 조작 가능한 모형, 독립적으로 스크롤하는 해설과 출처를 제공한다.

두 번째 방향은 [라캉의 세 질문과 분석 모형](https://climtc.github.io/teaching-learning-perspectives/lacan-problems.html)이다. 경계, 반복, 전체 결속의 원문 문제를 재구성하고, `M=(X,R,O,T,I,E)`로 대상·관계·관찰·조작·보존 성질·근거를 기록하는 분석 틀을 제시한다. 페이지에서 적용 조건과 해석의 한계를 설명한다. 라캉의 매듭 자체를 통상의 모형으로 부르지 않는 원문상의 제한과 프로젝트의 분석 모형을 구별한다. 교육 효과나 정신 상태의 측정식으로 사용하지 않는다.

플랫랜드는 원전 삽화, 로렌츠는 논문 그림 2의 일부, 오일러는 출처 상태를 명시한 재도식을 사용한다. [계획과 실행 범위](NEXT_STAGE_PLAN.md), [출처와 원본 해시](geometry-lab-sources.json)에서 근거를 확인할 수 있다.

## 차원 압축과 펼침 실험 — 역사와 데이터의 확장

사용자가 선택한 프로젝트 이름이다. 임완철의 **차원증감법**을 핵심 개념으로 삼고, 2차원 기록과 조작 가능한 디지털 표현을 비교한다. 『가르치는 인공지능은 가능한가?』(새물결, 2020), 제7장 16.6절의 ‘차원증감법’. 『읽는다는 것의 미래』(지식노마드, 2019), 제2장 출간본 54–65쪽의 관계 도식과 연결한다.

[전체 탐색 화면](https://climtc.github.io/teaching-learning-perspectives/geometry-lab.html)에서 시대와 문제를 선택한다. 이번 확장은 다음 일곱 페이지이다.

- [구면을 평면에 펼치기](https://climtc.github.io/teaching-learning-perspectives/stereographic-projection.html)
- [원근법 — 눈과 그림 평면](https://climtc.github.io/teaching-learning-perspectives/perspective.html)
- [물감의 요철 — 빛에 따라 달라지는 표면](https://climtc.github.io/teaching-learning-perspectives/impasto-light.html)
- [세잔과 큐비즘 — 여러 시점의 재배치](https://climtc.github.io/teaching-learning-perspectives/cezanne-cubism.html)
- [테서랙트 — 4차원 회전과 투영](https://climtc.github.io/teaching-learning-perspectives/hypercube.html)
- [고차원 데이터 — 13개 변수를 펼쳐 보기](https://climtc.github.io/teaching-learning-perspectives/pca-vectors.html)
- [단어 벡터 — 의미의 배치와 투영의 손실](https://climtc.github.io/teaching-learning-perspectives/word-vector-projections.html)

세잔을 큐비즘 창시자로 기술하지 않는다. 물감 모형은 원작 높이의 복원이 아니다. 물리 차원, 내재 차원, 변수 수와 관찰 자유도를 구별한다. 각 페이지에 원작 또는 재도식, 조작에 따른 보존 성질과 손실, 출처와 범위를 기록했다. 와인 데이터는 CC BY 4.0이며, 단어 데모는 원시 벡터를 재배포하지 않고 계산한 좌표와 선정 표본 간 거리만 포함한다. 외부 실행 코드 없이 기존 CSP와 iframe sandbox를 유지한다.

[선정과 실행 계획](DIMENSION_HISTORY_PLAN.md) · [출처와 해시](dimension-history-sources.json). 기존 URL과 라캉 해설는 계속 사용할 수 있다.

## 시간과 관찰 조건의 추가 실험

국가 지표, 교실 창문, 개념 좌표, 구면 삼각형과 샘플링을 비교하는 다섯 실험을 제공한다.

- [국가 지표 — 시간축을 펼치기](https://climtc.github.io/teaching-learning-perspectives/gapminder-time.html)
- [교실 창문 — 시선의 높이와 방향](https://climtc.github.io/teaching-learning-perspectives/classroom-window.html)
- [개념공간 — 축과 관점의 선택](https://climtc.github.io/teaching-learning-perspectives/conceptual-lenses.html)
- [구면 삼각형 — 안에서 측정하는 곡률](https://climtc.github.io/teaching-learning-perspectives/spherical-triangle.html)
- [연속과 표본 — 같아 보이는 다른 신호](https://climtc.github.io/teaching-learning-perspectives/sampling-aliasing.html)

Gapminder의 12개국·1990–2010년 252행을 고정 버전에서 결합했다. GDP는 2015년 고정 US$, 기대수명은 IHME 보관 지표이며 최신 통계와 구별한다. 창문 모형은 경로의 대칭과 바라보는 방향을 분리한다. 개념공간의 점수는 가상 값이다. 구면의 수학적 곡률은 사회적 비유와 구별하고, 코사인 별칭 비교를 일반 신호의 유한 표본 복원으로 설명하지 않는다.

[공개 자료 출처](experiment-sources.json) · [실험 자료](manuscript-case-data.json) · [GitHub–Medium 작업 흐름](MEDIUM_WORKFLOW.md). GitHub를 코드·자료·실험의 1차 저장소로, Medium을 향후 원고와 사례 링크의 게시 공간으로 사용한다. 현재 Medium 편집기에서 GitHub Pages는 링크 카드로 변환되는 것을 확인했다. 임의 iframe·스크립트의 직접 삽입은 지원하지 않는다.

## 공개 범위

이 저장소는 시각화 코드, 실험 사용법과 공개 자료의 출처를 제공한다. 미출간 원고와 작업 중인 글, 그 제목·발췌·해시·연결 기록은 로컬에만 보관한다. 원고 공개는 저자가 별도로 결정한다.

## 사례 관리

현재 전체 목록은 **29개 개별 사례**이다. 토러스, 뫼비우스의 띠, 끈의 고리, 보로메오 고리, 세잎매듭, 생톰도 다른 사례와 같은 단위로 표시한다. 저자별 카테고리를 만들지 않으며, 시대와 표현의 문제를 공통 태그로 사용한다.

[사례 관리 규칙](CASE_MANAGEMENT.md) · [사례 등록부](cases.json). 목록은 등록부로부터 정적으로 생성하므로 기존 CSP를 변경하거나 실행 중 자료 요청을 추가하지 않는다. 변경 후 `python3 add_model_expansion.py`, `python3 manage_cases.py --write`, `python3 manage_cases.py --check`를 순서대로 실행한다.

## 수학 공식과 물리 법칙의 추가 실험

- [오일러 공식 — 회전을 각도로 펼치기](https://climtc.github.io/teaching-learning-perspectives/euler-formula.html): 복소평면의 회전과 각도 나선을 비교한다. `e^(iθ)=cosθ+i sinθ`, 특히 `e^(iπ)=−1`을 확인한다. 높이는 복소수의 새 성분이 아니라 각도의 기록이다.
- [뉴턴의 중력 — 공식에서 궤도로](https://climtc.github.io/teaching-learning-perspectives/newton-orbits.html): 고정된 중심체와 작은 물체의 타원 궤도, 에너지와 각운동량을 비교한다.
- [전자기파 — 두 장과 전파 방향](https://climtc.github.io/teaching-learning-perspectives/electromagnetic-wave.html): 진공 평면파의 전기장·자기장·전파 방향을 구별하고 파장과 편광을 바꾼다.
- [로런츠 변환 — 같은 사건의 다른 좌표](https://climtc.github.io/teaching-learning-perspectives/lorentz-transform.html): 2+1차원 시공간에서 좌표와 불변 간격을 비교한다. 기존 Lorenz 시스템 사례와 구별한다.
- [푸리에 급수 — 합을 성분으로 펼치기](https://climtc.github.io/teaching-learning-perspectives/fourier-series.html): 사각파의 유한 부분합과 홀수 조화 성분을 비교한다. 깊이는 성분 순서다.
- [블로흐 구 — 양자 상태와 측정 축](https://climtc.github.io/teaching-learning-perspectives/bloch-sphere.html): 단일 큐비트의 순수 상태와 X·Y·Z 측정 확률을 연결한다. 구 위의 점은 입자의 실제 위치가 아니다.
- [미분과 기울기 — 평면의 벡터와 함수의 높이](https://climtc.github.io/teaching-learning-perspectives/gradient-surface.html): 등고선, 기울기와 접평면을 비교한다. 높이는 함수값이다.

평면 도식은 공개 수학 관계를 바탕으로 새로 작성한 SVG다. 문헌 원본의 캡처와 구별한다. [공개 출처 목록](formula-sources.json)은 NIST DLMF, Caltech의 Feynman Lectures, MIT OpenCourseWare와 IBM Quantum 문헌으로 연결한다. 계산과 시각화는 페이지에 내장되어 외부 실행 서비스 없이 동작한다.

`python3 build_formula_cases.py`로 일곱 페이지를 다시 생성한 뒤 공통 확대 기능과 목록을 갱신한다. `node verify_formula_models.js`는 지수함수의 독립적인 급수 계산, 궤도의 보존량과 운동 방정식, 진공파의 관계, 로런츠 변환의 역변환·간격, 푸리에 계수 적분, 양자 상태의 Born 확률과 유한 차분의 미분값을 검사한다.

## 모든 사례의 확대와 복원

모든 29개 사례에 **시각화 확대** 버튼을 제공한다. 화면 크기로 늘린 상태에서도 회전·매개변수·재생 등 원래의 조작이 가능하다. **확대 닫기** 또는 **Escape**로 비교 화면으로 돌아와도 조작 상태가 유지된다. iframe을 옮기거나 새로 만들지 않으며, sandbox와 CSP도 유지한다. 모형 안의 **+ / −**는 시각화 자체의 배율을 바꾼다. 읽을 자료는 원래 비교 화면에서 독립적으로 스크롤한다.

이 확대·배율 기능은 앞으로 등록하는 모든 사례에도 적용하는 필수 규칙이다. 공통 소스를 정적으로 내장하는 생성기와 `manage_cases.py`의 검사를 함께 사용하고, 공개 전에 실제 조작과 상태 보존을 브라우저에서 확인한다.
