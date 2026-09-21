/* My Beanie i18n — ko / en */
window.I18N = {
  ko: {
    // meta
    title: 'My Beanie — 콩팥 건강 일지',
    // onboarding
    ob_sub: "It's my health buddy.\n기록은 이 기기에만 저장돼요.", ob_name: '이름(별명)', ob_name_ph: '예: 지원', ob_year: '출생연도', ob_year_ph: '예: 1975',
    female: '여성', male: '남성', ob_visit: '다음 진료일 (선택)', ob_go: '시작하기',
    disclaimer_short: 'My Beanie는 개인 건강기록 도구이며 진단·치료를 대신하지 않습니다.',
    year_check: '출생연도를 확인해 주세요', friend: '친구', welcome: '반가워요, {name}님',
    // home
    hello: '안녕하세요, {name}님', settings: '설정', egfr: 'eGFR', bp: '혈압', bp_short: '혈압', weight: '체중', kg: 'kg',
    start_logging: '기록을 시작해 보세요', last_record: '최근 기록', no_record: '최근 기록 없음', enter_cr: '크레아티닌을 입력하면 계산돼요',
    vs_last: '지난번 대비 {d}', next_visit: '다음 진료 · {date}', passed: '지남', today_lbl: '오늘', one_pager_btn: '한 장 리포트',
    set_visit: '다음 진료일을 설정하면 리포트 준비를 알려드려요', recent: '최근 기록', empty_home: '아직 기록이 없어요. 아래 ＋ 기록에서 시작해 보세요.',
    del_confirm: '이 기록을 삭제할까요?', delete: '삭제', memo: '메모', record: '기록',
    // nudge
    n_visit: '<b>진료 D-{d}.</b> 한 장 리포트가 준비돼 있어요. 궁금한 점을 메모에 적어두면 함께 정리돼요.',
    n_bp: '<b>최근 세 번 혈압이 높은 편이에요.</b> 진료 때 꼭 이야기해 보세요.',
    n_swell: '<b>붓기가 이어지고 있네요.</b> 오늘 체중을 함께 적어두면 진료 때 도움이 돼요.',
    n_first: '<b>첫 기록을 남겨 볼까요?</b> 검사 결과지가 없어도 혈압이나 몸의 신호만으로 충분해요.',
    n_days: '<b>{d}일 만이에요.</b> 오늘 몸은 어떤가요? 한 줄이면 충분해요.',
    n_ok: '잘 이어가고 있어요, {name}님. <b>오늘도 한 줄</b>이면 충분해요.',
    // log
    log_title: '오늘 기록', labs: '검사 수치', labs_hint: '검사 결과지가 있을 때만', cr: '크레아티닌 (mg/dL)', cr_ph: '예: 1.25', k: '칼륨 K (mmol/L)', k_ph: '예: 4.5', p: '인 P (mg/dL)', p_ph: '예: 3.8',
    daily: '일상 측정', sbp: '수축기', dbp: '이완기', wt: '체중 (kg)', signals: '몸의 신호', signals_hint: '해당하는 것만',
    notes_lbl: '의사에게 물어볼 것 · 메모', notes_ph: '예: 저녁마다 발목이 붓는데 괜찮은가요?', save: '저장', need_one: '한 가지라도 적어 주세요', saved: '저장했어요',
    sym: { swelling: '붓기', fatigue: '피로', itching: '가려움', appetite: '식욕저하', breath: '숨참', headache: '두통', foamy: '거품뇨', nocturia: '야간뇨', sleep: '잠 설침' },
    // trend
    trend: '추이', chart_empty: '아직 기록이 없어요', tt_title: '지난번 대비 비교', item: '항목', last: '지난번', now: '이번',
    tt_cr: '크레아티닌', tt_k: '칼륨 K', tt_sbp: '수축기 혈압 (30일 평균)', tt_dbp: '이완기 혈압 (30일 평균)', tt_wt: '체중 (30일 평균)', tt_empty: '두 번 이상 기록하면 비교가 시작돼요',
    // report
    rep_title: '진료 전 한 장', period: '기간', d30: '최근 30일', d90: '최근 90일', d180: '최근 180일', print: '인쇄 / PDF', share: '공유',
    op_head: '{name}님의 진료 전 한 장', op_meta: '{age}세 · {sex}', f_short: '여', m_short: '남', op_made: '작성 {date}', op_period: '최근 {d}일',
    op_labs: '검사 수치 (eGFR: CKD-EPI 2021)', date: '날짜', op_change: '기간 내 변화: eGFR {a} → {b} ({d})', op_no_labs: '기간 내 검사 수치 기록 없음',
    op_daily: '일상 측정', avg: '평균', range: '범위', count: '횟수', op_sbp: '수축기 혈압', op_dbp: '이완기 혈압', op_wt: '체중 (kg)',
    op_signals: '몸의 신호 (기간 내 횟수)', op_no_sym: '기록된 증상 없음', op_questions: '의사에게 물어볼 것', op_no_notes: '메모 없음 — 기록 화면에서 궁금한 점을 적어두세요',
    op_foot: '환자가 직접 기록한 개인 건강기록이며 의료기기가 아닙니다. eGFR은 CKD-EPI 2021(인종 미포함) 식으로 계산한 참고값이며, 판단은 담당 의료진에게 있습니다. kidneybloom.com',
    share_title: 'My Beanie 진료 전 한 장', copied: '텍스트를 복사했어요', no_share: '공유를 지원하지 않는 브라우저예요',
    // settings
    st_name: '이름', st_year: '출생연도', st_visit: '다음 진료일', st_lang: '언어 · Language', data: '데이터', export: '기록 내보내기 (JSON)', import: '기록 가져오기', reset: '모든 기록 삭제',
    imported: '가져왔어요', bad_file: '파일을 읽을 수 없어요', reset_confirm: '모든 기록과 설정을 삭제할까요? 되돌릴 수 없어요.', st_foot: 'My Beanie v0.2 · 개인 건강기록 도구',
    // tabs
    tab_home: '홈', tab_log: '기록', tab_trend: '추이', tab_report: '리포트',
    demo_bar: '데모 데이터 · 가상의 기록입니다 (실제 환자 아님)', demo_link: '실제로 시작하기 →', demo_name: '영희', storage_err: '저장 공간을 사용할 수 없어요',
  },
  en: {
    title: 'My Beanie — Kidney Health Journal',
    ob_sub: "It's my health buddy.\nYour records stay on this device.", ob_name: 'Name (nickname)', ob_name_ph: 'e.g. Jane', ob_year: 'Year of birth', ob_year_ph: 'e.g. 1975',
    female: 'Female', male: 'Male', ob_visit: 'Next appointment (optional)', ob_go: 'Get started',
    disclaimer_short: 'My Beanie is a personal health-record tool. It does not diagnose or treat.',
    year_check: 'Please check the year of birth', friend: 'friend', welcome: 'Nice to meet you, {name}',
    hello: 'Hello, {name}', settings: 'Settings', egfr: 'eGFR', bp: 'Blood pressure', bp_short: 'BP', weight: 'Weight', kg: 'kg',
    start_logging: 'Start logging', last_record: 'Latest', no_record: 'No records yet', enter_cr: 'Enter creatinine to calculate',
    vs_last: '{d} vs. last', next_visit: 'Next visit · {date}', passed: 'passed', today_lbl: 'today', one_pager_btn: 'One-Pager',
    set_visit: 'Set your next appointment and I\'ll remind you to prepare the report', recent: 'Recent entries', empty_home: 'Nothing logged yet. Tap ＋ Log below to begin.',
    del_confirm: 'Delete this entry?', delete: 'Delete', memo: 'Note', record: 'Entry',
    n_visit: '<b>Visit in {d} days.</b> Your One-Pager is ready. Jot down questions in a note and they\'ll be included.',
    n_bp: '<b>Your last three blood pressures ran high.</b> Be sure to mention it at your visit.',
    n_swell: '<b>Swelling has continued.</b> Logging today\'s weight alongside will help at your visit.',
    n_first: '<b>Shall we log the first entry?</b> No lab report needed — blood pressure or how you feel is enough.',
    n_days: '<b>It\'s been {d} days.</b> How is your body today? One line is enough.',
    n_ok: 'You\'re keeping it up, {name}. <b>One line today</b> is enough.',
    log_title: 'Today\'s log', labs: 'Lab values', labs_hint: 'only when you have results', cr: 'Creatinine (mg/dL)', cr_ph: 'e.g. 1.25', k: 'Potassium K (mmol/L)', k_ph: 'e.g. 4.5', p: 'Phosphorus P (mg/dL)', p_ph: 'e.g. 3.8',
    daily: 'Daily measurements', sbp: 'Systolic', dbp: 'Diastolic', wt: 'Weight (kg)', signals: 'Body signals', signals_hint: 'tap any that apply',
    notes_lbl: 'Questions for my doctor · Notes', notes_ph: 'e.g. My ankles swell every evening — is that okay?', save: 'Save', need_one: 'Please enter at least one item', saved: 'Saved',
    sym: { swelling: 'Swelling', fatigue: 'Fatigue', itching: 'Itching', appetite: 'Low appetite', breath: 'Short of breath', headache: 'Headache', foamy: 'Foamy urine', nocturia: 'Night urination', sleep: 'Poor sleep' },
    trend: 'Trends', chart_empty: 'No records yet', tt_title: 'Then vs. now', item: 'Item', last: 'Last', now: 'Now',
    tt_cr: 'Creatinine', tt_k: 'Potassium K', tt_sbp: 'Systolic BP (30-day avg)', tt_dbp: 'Diastolic BP (30-day avg)', tt_wt: 'Weight (30-day avg)', tt_empty: 'Log at least twice to start comparing',
    rep_title: 'Pre-visit report', period: 'Period', d30: 'Last 30 days', d90: 'Last 90 days', d180: 'Last 180 days', print: 'Print / PDF', share: 'Share',
    op_head: '{name}\'s pre-visit report', op_meta: 'Age {age} · {sex}', f_short: 'F', m_short: 'M', op_made: 'Prepared {date}', op_period: 'Last {d} days',
    op_labs: 'Lab values (eGFR: CKD-EPI 2021)', date: 'Date', op_change: 'Change in period: eGFR {a} → {b} ({d})', op_no_labs: 'No lab values logged in this period',
    op_daily: 'Daily measurements', avg: 'Avg', range: 'Range', count: 'n', op_sbp: 'Systolic BP', op_dbp: 'Diastolic BP', op_wt: 'Weight (kg)',
    op_signals: 'Body signals (count in period)', op_no_sym: 'No symptoms logged', op_questions: 'Questions for my doctor', op_no_notes: 'No notes — add questions from the Log screen',
    op_foot: 'A personal health record kept by the patient; not a medical device. eGFR is a reference value from the CKD-EPI 2021 (race-free) equation; clinical judgment rests with your care team. kidneybloom.com',
    share_title: 'My Beanie pre-visit report', copied: 'Copied to clipboard', no_share: 'Sharing is not supported in this browser',
    st_name: 'Name', st_year: 'Year of birth', st_visit: 'Next appointment', st_lang: 'Language · 언어', data: 'Data', export: 'Export records (JSON)', import: 'Import records', reset: 'Delete all records',
    imported: 'Imported', bad_file: 'Could not read the file', reset_confirm: 'Delete all records and settings? This cannot be undone.', st_foot: 'My Beanie v0.2 · personal health-record tool',
    tab_home: 'Home', tab_log: 'Log', tab_trend: 'Trends', tab_report: 'Report',
    demo_bar: 'Demo · fictional data, not a real patient', demo_link: 'Start for real →', demo_name: 'Jane', storage_err: 'Storage is not available',
  },
};
window.LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ko' || q === 'en') { try { localStorage.setItem('mybeanie.lang', q); } catch (e) {} return q; }
  try { const s = localStorage.getItem('mybeanie.lang'); if (s === 'ko' || s === 'en') return s; } catch (e) {}
  return (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
})();
window.t = (key, vars) => {
  let s = (I18N[LANG][key] ?? I18N.ko[key] ?? key);
  if (typeof s === 'string' && vars) Object.keys(vars).forEach(k => { s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]); });
  return s;
};
window.applyI18n = () => {
  document.documentElement.lang = LANG; document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; const v = t(k); if (v.includes('\n')) el.innerHTML = v.replace(/\n/g, '<br>'); else el.textContent = v; });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.querySelectorAll('[data-i18n-sym]').forEach(el => el.textContent = t('sym')[el.dataset.s]);
};
