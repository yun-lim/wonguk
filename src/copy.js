import { ELEMENTS } from "./tables.js";

const DAY_MASTER = {
  갑: {
    title: "갑목 · 큰 나무",
    body: "곧게 서는 기운이다. 시작을 열고 방향을 정하는 쪽에 마음이 간다. 굽히기보다 밀고 나가며, 중심을 빼앗기면 답답해한다. 사람을 이끌 때는 분명한 뜻을 보여줄 때 힘이 난다.",
  },
  을: {
    title: "을목 · 덩굴과 꽃",
    body: "유연하게 기대고 감싸며 자란다. 혼자 버티기보다 관계와 환경 속에서 힘을 모은다. 섬세하고 눈치가 빠르며, 적응이 곧 재능이다. 너무 맞추다 보면 본래 결이 흐려질 수 있다.",
  },
  병: {
    title: "병화 · 태양",
    body: "드러나고 비추는 불이다. 열정과 표현이 크고, 자리를 밝히면 주변이 따라온다. 숨기는 일에는 재주가 적다. 과열되면 판단이 앞질러 가니, 쉬는 리듬이 오래 가는 힘이다.",
  },
  정: {
    title: "정화 · 촛불과 노을",
    body: "가깝게 데우는 불이다. 정과 취향이 분명하고, 작은 결을 알아본다. 무대보다 온기가 필요한 자리에 강하다. 마음을 너무 쓰면 꺼지기 쉬우니, 거리를 두는 일이 아니라 연료를 남겨 두는 일이 필요하다.",
  },
  무: {
    title: "무토 · 산과 언덕",
    body: "묵직하게 버티는 땅이다. 책임과 안정이 기본값이고, 한 번 맡은 것은 쉽게 내려놓지 않는다. 변화가 느려 보일 수 있으나 쌓이면 크다. 고집이 산이 되지 않게, 물길을 열어 두는 편이 낫다.",
  },
  기: {
    title: "기토 · 논밭",
    body: "사람을 품고 키우는 땅이다. 실무와 살림, 조율에 강하다. 드러내기보다 밭을 갈듯 꾸준히 만든다. 너무 많이 품으면 본인이 먼저 지치니, 경계를 긋는 것도 일의 일부다.",
  },
  경: {
    title: "경금 · 쇠와 바위",
    body: "자르고 결정하는 쇠다. 원칙과 결단이 빠르고, 흐릿한 말을 견디지 못한다. 밀리면 날을 세운다. 날카로움이 사람을 베지 않게, 쓰임새를 정하고 쓰는 편이 길다.",
  },
  신: {
    title: "신금 · 보석과 바늘",
    body: "갈고 다듬어 빛내는 쇠다. 정교함과 품위를 따지고, 대충을 참기 어렵다. 겉은 차분해 보여도 안쪽 기준은 높다. 완성도를 지키되, 마침표를 찍는 연습이 번아웃을 막는다.",
  },
  임: {
    title: "임수 · 강과 바다",
    body: "넓게 흐르는 물이다. 포부가 크고 막히면 길을 돌려 간다. 사람 사이에 스며들면서도 깊이를 숨긴다. 흐름이 끊기면 답답하니, 한 방향으로 모으는 그릇이 필요하다.",
  },
  계: {
    title: "계수 · 비와 이슬",
    body: "스며들어 적시는 물이다. 직관과 섬세함이 강하고, 눈에 띄지 않게 스며 영향을 준다. 소리 없이 채우고, 소리 없이 빠지기도 한다. 경계를 분명히 해야 흘러내리지 않는다.",
  },
};

export const GOD_HINT = {
  비견: "나와 같은 힘, 자립",
  겁재: "경쟁과 나눔",
  식신: "표현과 재능이 풀리는 자리",
  상관: "파격·말·재주, 틀을 깨는 힘",
  편재: "움직이는 기회와 재물",
  정재: "안정된 재물과 책임",
  편관: "압박과 도전",
  정관: "명예·규율·직분",
  편인: "특수한 배움과 생각",
  정인: "보호·학습·문서",
  일간: "나",
};

export function hasBatchim(word) {
  const ch = word[word.length - 1];
  const code = ch.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

export function joinKo(list) {
  if (list.length === 0) return "";
  if (list.length === 1) return list[0];
  if (list.length === 2) {
    const mid = hasBatchim(list[0]) ? "과" : "와";
    return `${list[0]}${mid} ${list[1]}`;
  }
  return `${list.slice(0, -1).join("·")}${hasBatchim(list[list.length - 2]) ? "과" : "와"} ${list[list.length - 1]}`;
}

export function eunNeun(phrase) {
  const last = phrase.split(" ").pop();
  return phrase + (hasBatchim(last) ? "은" : "는");
}

export function iGa(phrase) {
  const last = phrase.split(" ").pop();
  return phrase + (hasBatchim(last) ? "이" : "가");
}

export function eulReul(word) {
  return word + (hasBatchim(word) ? "을" : "를");
}

export function readingDayMaster(dayMaster) {
  const row = DAY_MASTER[dayMaster.stem];
  if (!row) return { title: "일간", body: "일간 정보를 읽지 못했습니다." };
  return {
    title: row.title,
    body: `${dayMaster.yinyang}${dayMaster.element} 일간. ${row.body}`,
  };
}

export function readingElements(elements, dayMaster, hourUnknown) {
  const missing = ELEMENTS.filter((e) => elements[e] === 0);
  const weak = ELEMENTS.filter((e) => elements[e] === 1);
  const even = ELEMENTS.filter((e) => elements[e] === 2);
  const excess = ELEMENTS.filter((e) => elements[e] >= 3);
  const basis = hourUnknown
    ? "연·월·일 여섯 글자"
    : "연·월·일·시 여덟 글자";

  const bits = [];
  bits.push(`${basis}만 센다. 지장간은 넣지 않았다.`);
  bits.push(`일간은 ${dayMaster.element} 기운이다.`);

  if (excess.length) {
    bits.push(
      `${iGa(joinKo(excess))} 많다. 이 기운이 자리를 넓게 차지하면 고집이나 과부하로 나타날 수 있다.`,
    );
  }
  if (missing.length) {
    bits.push(
      `${eunNeun(joinKo(missing))} 겉글자에 없다. 없다고 인생에 없는 것은 아니나, 원국만 보면 이 결이 잘 드러나지 않는다.`,
    );
  }
  if (weak.length && !missing.length) {
    bits.push(`${eunNeun(joinKo(weak))} 한 글자라 얇다. 대운·세운이 보태 주면 느낌이 달라진다.`);
  } else if (weak.length) {
    bits.push(`${eunNeun(joinKo(weak))} 한 글자로 얇다.`);
  }
  if (!excess.length && !missing.length) {
    bits.push(
      even.length
        ? "크게 치우친 글자는 없다. 과불급보다 흘려 쓰는 자리가 더 중요하다."
        : "한쪽으로 크게 기울지 않았다.",
    );
  }

  return {
    title: "오행 과불급",
    body: bits.join(" "),
  };
}

export function readingLuck(luck, dayMaster, elements, age) {
  if (!luck) {
    return { title: "지금 대운", body: "대운을 계산하지 못했습니다." };
  }

  const dir = luck.forward ? "순행" : "역행";
  const dirWhy = luck.forward
    ? "연간이 양이면 남, 음이면 여가 순행한다."
    : "연간이 음이면 남, 양이면 여가 역행한다.";

  if (luck.beforeFirst || !luck.current) {
    return {
      title: "지금 대운",
      body: `아직 첫 대운 전이다. 대운수는 약 ${luck.startAge}세(만나이). ${dir}이며 ${dirWhy} 지금은 원국, 특히 월주의 바탕이 더 크게 읽힌다.`,
    };
  }

  const cur = luck.current;
  const stemGod = cur.stem.god;
  const hint = GOD_HINT[stemGod] || stemGod;
  const luckEl = cur.stem.element;
  const count = elements[luckEl] ?? 0;
  let mix = "";
  if (count === 0) {
    mix = `원국에 없던 ${iGa(luckEl)} 들어온다. 생소한 결이 열리거나, 그동안 안 쓰던 근육을 쓰게 되는 시기다.`;
  } else if (count >= 3) {
    mix = `이미 많은 ${luckEl} 위에 같은 기운이 겹친다. 익숙한 힘이 커지되, 과하면 막힌다.`;
  } else {
    mix = `원국의 ${eulReul(luckEl)} 한 겹 보탠다.`;
  }

  return {
    title: `지금 대운 · ${cur.hanja} ${cur.korean}`,
    body: `만나이 ${age}세, ${cur.start}–${cur.end}세 ${cur.hanja}(${cur.korean}) 대운. ${dir}. ${dirWhy} 대운 천간은 일간 대비 ${stemGod} — ${hint}. ${mix} 대운은 10년 바탕이지, 올해의 세부가 아니다.`,
  };
}
