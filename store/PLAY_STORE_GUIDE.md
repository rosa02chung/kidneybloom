# My Beanie — Google Play 등록 가이드 (2026.09)

이 문서 하나로 등록을 끝낼 수 있게 순서대로 정리했습니다. 소요: 계정 개설 30분 + 패키지 생성 10분 + 스토어 등록 1시간 + 심사·테스트 기간 2~4주.

---

## 0. 준비물 체크

| 항목 | 상태 |
|---|---|
| 앱 주소 `https://app.kidneybloom.com` HTTPS 동작 | ✅ |
| 매니페스트(id·아이콘 512·maskable·스크린샷·카테고리) | ✅ v0.6에 반영 |
| 개인정보처리방침 URL `https://kidneybloom.com/privacy.html` | ✅ v0.6에 반영 (영문 `/en/privacy.html`) |
| 스토어 아이콘 512×512 PNG | ✅ `app/store/icon-512.png` |
| 피처 그래픽 1024×500 PNG | ✅ `app/store/feature-1024x500.png` |
| 폰 스크린샷 1080×1920 (한 8장 / 영 8장) | ✅ `app/store/ko/`, `app/store/en/` |
| Google 계정 (Play Console용) | 지원님 준비 — 개인 Gmail 가능. 법인 설립 후 이전 가능 |
| 등록비 US$25 (1회) · 해외결제 가능한 카드 | 지원님 준비 |
| 신원 확인용 신분증 · 주소 증빙 | 지원님 준비 (개인 개발자 계정 필수) |
| 테스터 12명 이상 (14일 비공개 테스트) | 지원님 준비 — 지인·가족 Gmail 주소 |

---

## 1. Play Console 계정 만들기 (지원님)

1. `play.google.com/console` → **계정 만들기** → **개인** 선택 (법인 설립 전이므로)
2. 개발자 이름: `Root to Life` (나중에 변경 가능)
3. 연락처 이메일: 공개용 주소 (hello@kidneybloom.com 개설 후 그걸로, 아니면 우선 Gmail)
4. 등록비 US$25 결제
5. **신원 확인** — 신분증 사진 + 주소 증빙 업로드. 승인까지 1~3일
6. 2024년 이후 신규 개인 계정은 **비공개 테스트 요건**이 있습니다: 테스터 12명이 14일 이상 앱을 설치한 뒤에야 "프로덕션 출시 신청" 버튼이 열립니다. 이걸 먼저 알고 일정을 잡으세요.

---

## 2. 안드로이드 패키지 만들기 — PWABuilder (10분)

이 작업환경에서는 안드로이드 빌드 도구를 내려받을 수 없어, 마이크로소프트가 운영하는 무료 도구를 씁니다. 코드 지식 불필요.

1. 브라우저에서 `https://www.pwabuilder.com` 접속
2. 입력창에 `https://app.kidneybloom.com` 입력 → **Start**
3. 점수 화면이 나오면 (매니페스트·서비스워커 항목이 초록이어야 함) 오른쪽 위 **Package for stores** 클릭
4. **Android** 카드의 **Generate package** 클릭 → 옵션 화면에서 아래처럼 입력

| 옵션 | 값 |
|---|---|
| Package ID | `com.kidneybloom.mybeanie` |
| App name | `My Beanie` |
| Short name | `My Beanie` |
| Version | `1.0.0` |
| Version code | `1` |
| Host | `app.kidneybloom.com` |
| Start URL | `/` |
| Theme color | `#FF7B8E` |
| Background color | `#F7FAFB` |
| Display mode | `standalone` |
| Signing key | **Create new** (처음이므로) |
| Key alias / passwords | 아무 값이나 정하되 **반드시 메모** — 업데이트 때마다 같은 키가 필요 |

5. **Download package** → zip 하나가 내려옵니다. 안에 든 것:
   - `app-release-bundle.aab` ← Play Console에 올릴 파일
   - `app-release-signed.apk` ← 테스트용 (휴대폰에 직접 설치 가능)
   - `signing.keystore` + `signing-key-info.txt` ← **분실하면 앱 업데이트 불가. 두 곳 이상에 백업**
   - `assetlinks.json` ← 다음 단계에서 씀

---

## 3. assetlinks.json 올리기 — 주소창 없이 앱처럼 열리게 (5분)

이걸 안 하면 앱 위에 브라우저 주소창이 뜹니다.

1. PWABuilder zip 안의 `assetlinks.json`을 열어 `sha256_cert_fingerprints` 값(콜론으로 구분된 긴 16진수)을 복사
2. 저장소의 `app/.well-known/assetlinks.json` 파일에서 `REPLACE_WITH_SHA256_FROM_PWABUILDER_OR_PLAY_CONSOLE` 자리에 붙여넣기 (GitHub 웹에서 파일 클릭 → 연필 아이콘 → 수정 → Commit)
3. **Play 앱 서명을 켤 경우** (권장, 4단계에서 설정) Play Console → 앱 → 설정 → **앱 무결성** → "앱 서명 키 인증서"의 SHA-256도 **추가**해야 합니다. 배열이라 두 개를 나란히 넣으면 됩니다:
   ```json
   "sha256_cert_fingerprints": ["PWABUILDER_키_SHA256", "PLAY_앱서명_키_SHA256"]
   ```
4. 확인: `https://app.kidneybloom.com/.well-known/assetlinks.json` 을 브라우저에서 열어 값이 보이면 됨 (Vercel 배포 후 1분)

---

## 4. Play Console에서 앱 만들기 (1시간)

**앱 만들기**
- 앱 이름 `My Beanie` · 기본 언어 **한국어** · 앱/게임: 앱 · 무료
- 선언 체크 후 **앱 만들기**

**대시보드의 "앱 설정" 항목 채우기** (순서대로 초록 체크가 됩니다)

| 항목 | 답 |
|---|---|
| 개인정보처리방침 | `https://kidneybloom.com/privacy.html` |
| 앱 액세스 권한 | "모든 기능을 특별한 액세스 권한 없이 사용할 수 있음" |
| 광고 | 광고 없음 |
| 콘텐츠 등급 | 설문 → 카테고리 "유틸리티·생산성·커뮤니케이션·기타" → 폭력·성적·약물·도박 등 전부 "아니요" → 등급 "전체이용가" |
| 타겟층 | 18세 이상 (13세 미만 대상 아님) |
| 뉴스 앱 | 아니요 |
| 코로나19 접촉 추적 | 아니요 |
| **데이터 보안** | 아래 "데이터 보안 답변" 그대로 |
| 정부 앱 | 아니요 |
| 금융 기능 | 없음 |
| **건강 앱** | "건강 관련 기능 포함" → 유형: **개인 건강 기록 관리** (의료기기·임상 아님) |

**데이터 보안 답변** (2026년 기준 항목)
- 앱이 필수 사용자 데이터를 수집하거나 공유하나요? → **아니요**
  - 근거: 모든 기록은 기기의 브라우저 저장소에만 있으며 개발자 서버로 전송되지 않음. 분석 SDK·광고 SDK 없음.
- 암호화: 전송 중 데이터 암호화 → 예 (HTTPS) — 다만 수집이 "아니요"면 이 문항은 표시되지 않을 수 있음
- 삭제 요청 방법 제공 → 예 (앱 내 "모든 기록 삭제")
- 주의: Play가 "사용자가 입력한 건강 정보를 앱이 처리하지 않나요?"라고 되물으면, **기기 내 처리(on-device)만 하며 개발자에게 전송되지 않는 데이터는 '수집'에 해당하지 않는다**는 Play 정책 정의를 따르므로 "아니요"가 맞습니다.

**스토어 등록정보 (기본 · 한국어)** — `store/LISTING_KO.md` 복사
**스토어 등록정보 번역 추가 → 영어(미국)** — `store/LISTING_EN.md` 복사
- 앱 아이콘: `app/store/icon-512.png`
- 그래픽 이미지: `app/store/feature-1024x500.png`
- 휴대전화 스크린샷: `app/store/ko/01~08` (영어 등록정보에는 `app/store/en/01~08`)
- 카테고리: **건강/운동** · 태그: 건강 기록, 만성질환

**앱 무결성 → Play 앱 서명**: "Google에서 앱 서명 키 관리" 선택 (권장). 이후 3단계의 SHA-256 추가 잊지 말기.

---

## 5. 비공개 테스트 → 프로덕션

1. **테스트 → 비공개 테스트 → 새 버전 만들기** → `app-release-bundle.aab` 업로드 → 출시 노트(아래) → 저장 → 검토 → 출시
2. **테스터** 탭 → 이메일 목록 만들기 → 테스터 12명 이상의 Gmail 주소 등록 → 참여 링크 복사해서 전달
3. 테스터가 링크로 설치, **14일 유지** (설치만 유지되면 됨)
4. 14일 후 대시보드에 **프로덕션 액세스 신청** 버튼 활성화 → 설문(테스트 과정에서 배운 점 등 3~4문항) 작성 → 승인 대기 (보통 1~7일)
5. 승인되면 **프로덕션 → 새 버전 만들기** → 같은 aab 업로드 → 출시 → Google 심사 (1~3일, 건강 앱은 최대 7일)

**출시 노트 v1.0.0 (한국어)**
```
My Beanie 첫 출시.
· 검사 수치(크레아티닌·칼륨·인)와 혈압·체중·몸의 신호를 기록
· 크레아티닌 입력 시 eGFR 참고값 자동 계산 (CKD-EPI 2021)
· 추이 그래프와 지난번 대비 비교
· 진료 전 한 장 리포트 — 인쇄·PDF·공유
· 모든 기록은 내 기기에만 저장됩니다
```

**Release notes v1.0.0 (en-US)**
```
First release of My Beanie.
· Log lab values (creatinine, potassium, phosphorus), blood pressure, weight and body signals
· eGFR reference value calculated from creatinine (CKD-EPI 2021)
· Trend charts and then-vs-now comparison
· One-page pre-visit report — print, PDF, share
· Everything stays on your device
```

---

## 6. 업데이트할 때

앱 내용(HTML/JS)만 바뀌면 **스토어 재등록 없이** GitHub 업로드만으로 반영됩니다 — 패키지는 껍데기라 웹을 그대로 불러오기 때문. 패키지를 다시 올려야 하는 경우는 아이콘·앱 이름·패키지 ID·안드로이드 권한이 바뀔 때뿐이며, 그때는 PWABuilder에서 **같은 signing.keystore를 업로드**하고 Version code를 2, 3…으로 올려 다시 생성합니다.

---

## 7. 심사에서 걸릴 수 있는 것과 대응

| 상황 | 대응 |
|---|---|
| "의료 기능이 있으니 인증 서류 제출" | 스토어 설명에 진단·치료 표현이 없음을 지적하고, 개인 건강 기록 관리 앱임을 회신. 설명 문안(LISTING)이 이미 그 톤으로 작성됨 |
| "웹뷰/브라우저와 동일한 앱" (최소 기능) | Google은 TWA를 공식 지원하므로 iOS만큼 엄격하지 않음. 홈 화면 바로가기(기록·리포트), 오프라인 실행이 이미 있음 |
| "개인정보처리방침에 수집 항목 불일치" | 방침 2-1이 기기 내 저장을 명시하므로 데이터 보안 "수집 안 함"과 일치. 링크가 200으로 열리는지 확인 |
| assetlinks 검증 실패 → 주소창 노출 | 3단계 SHA-256 두 개 모두 넣었는지, JSON 형식이 깨지지 않았는지 확인 |
