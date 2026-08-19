/** 원국 — 간지·오행·시진 표. 계산은 manseryeok에 맡기고 표시만 담당. */

export const STEM_HANJA = {
  갑: "甲",
  을: "乙",
  병: "丙",
  정: "丁",
  무: "戊",
  기: "己",
  경: "庚",
  신: "辛",
  임: "壬",
  계: "癸",
};

export const BRANCH_HANJA = {
  자: "子",
  축: "丑",
  인: "寅",
  묘: "卯",
  진: "辰",
  사: "巳",
  오: "午",
  미: "未",
  신: "申",
  유: "酉",
  술: "戌",
  해: "亥",
};

export const STEM_ELEMENT = {
  갑: "목",
  을: "목",
  병: "화",
  정: "화",
  무: "토",
  기: "토",
  경: "금",
  신: "금",
  임: "수",
  계: "수",
};

export const BRANCH_ELEMENT = {
  자: "수",
  축: "토",
  인: "목",
  묘: "목",
  진: "토",
  사: "화",
  오: "화",
  미: "토",
  신: "금",
  유: "금",
  술: "토",
  해: "수",
};

export const STEM_YINYANG = {
  갑: "양",
  을: "음",
  병: "양",
  정: "음",
  무: "양",
  기: "음",
  경: "양",
  신: "음",
  임: "양",
  계: "음",
};

export const ELEMENTS = ["목", "화", "토", "금", "수"];

export const ELEMENT_COLOR = {
  목: "#2f6b3a",
  화: "#b42318",
  토: "#9a7040",
  금: "#6d6a62",
  수: "#1e3a5f",
};

/** 시진. 자시는 야자(23–24)·조자(00–01)로 나눔. 값은 구간의 대표 시각. */
export const HOUR_SLOTS = [
  { id: "x", label: "모름", sub: "시주 생략", hour: null, minute: null },
  { id: "ya", label: "야자시", sub: "23–24시", hour: 23, minute: 30 },
  { id: "jo", label: "조자시", sub: "00–01시", hour: 0, minute: 30 },
  { id: "chuk", label: "축시", sub: "01–03시", hour: 2, minute: 0 },
  { id: "in", label: "인시", sub: "03–05시", hour: 4, minute: 0 },
  { id: "myo", label: "묘시", sub: "05–07시", hour: 6, minute: 0 },
  { id: "jin", label: "진시", sub: "07–09시", hour: 8, minute: 0 },
  { id: "sa", label: "사시", sub: "09–11시", hour: 10, minute: 0 },
  { id: "o", label: "오시", sub: "11–13시", hour: 12, minute: 0 },
  { id: "mi", label: "미시", sub: "13–15시", hour: 14, minute: 0 },
  { id: "sin", label: "신시", sub: "15–17시", hour: 16, minute: 0 },
  { id: "yu", label: "유시", sub: "17–19시", hour: 18, minute: 0 },
  { id: "sul", label: "술시", sub: "19–21시", hour: 20, minute: 0 },
  { id: "hae", label: "해시", sub: "21–23시", hour: 22, minute: 0 },
];

export const HOUR_BY_ID = Object.fromEntries(HOUR_SLOTS.map((s) => [s.id, s]));

export const PILLAR_ORDER = [
  { key: "hour", ko: "시주", hanja: "時柱" },
  { key: "day", ko: "일주", hanja: "日柱" },
  { key: "month", ko: "월주", hanja: "月柱" },
  { key: "year", ko: "연주", hanja: "年柱" },
];
