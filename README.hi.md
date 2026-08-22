<div align="center">

# ⌨️ dsh-composer-history

**DeepSeek Harness Web GUI कंपोज़र के लिए टर्मिनल-शैली इनपुट इतिहास।**

*↑ को टर्मिनल की तरह दबाएँ — और अपना आधा-लिखा ड्राफ़्ट सुरक्षित रखें।*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![DSH plugin](https://img.shields.io/badge/dsh-plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-composer-history/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-composer-history/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-composer-history?label=version)](https://github.com/PerryLink/dsh-composer-history/releases)
[![npm version](https://img.shields.io/npm/v/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![npm downloads](https://img.shields.io/npm/dm/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)

[English](README.md) · [简体中文](README.zh.md) · [Español](README.es.md) · [Português](README.pt.md) · [हिन्दी](README.hi.md)

</div>

---

## Compatibility

| Surface | Status |
|---|---|
| Harness | DeepSeek Harness `0.1.1-rc.2` |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | केवल Web GUI (क्लाइंट प्लगइन; ब्राउज़र-लोकल स्टोरेज; कोई नेटवर्क नहीं, कोई नेटिव कोड नहीं) |
| Model | कोई भी (कोई मॉडल अनुरोध नहीं — शुद्ध UI व्यवहार) |

## What you get

`dsh-composer-history` DeepSeek Harness Web GUI कंपोज़र में टर्मिनल का इनपुट इतिहास लाता है:

1. **एज-फर्स्ट ऐरो रिकॉल** — साधारण ↑/↓ पहले कर्सर घुमाते हैं; इतिहास रिकॉल तभी शुरू होता है जब कर्सर पहली/आख़िरी लाइन पर हो। पहला रिकॉल `{draft, caret}` को सहेजता है, और नवीनतम एंट्री पर दोबारा पहुँचने (या `Esc` दबाने) पर दोनों बिल्कुल वैसे ही बहाल होते हैं — कभी मिटते नहीं।
2. **पर्सिस्टेंट इतिहास** — हर भेजा गया संदेश एक सीमित ब्राउज़र-लोकल स्टोर में जुड़ता है, इसलिए रिकॉल पेज रीलोड के बाद भी बचा रहता है और सत्रों के पार पहुँचता है।
3. **रिवर्स सर्च** — `Ctrl+R` (कॉन्फ़िगर करने योग्य) मिले हुए इतिहास, स्निपेट और टेम्पलेट पर एक क्वेरी ओवरले खोलता है।
4. **स्मार्ट इनपुट लेयर** — `/save`/`/load` स्निपेट, `{{workspace}}`/`{{session}}`/`{{draft}}` वेरिएबल वाले प्रॉम्प्ट टेम्पलेट, और ब्राउज़र-लोकल पुनः-उपयोग इनसाइट।
5. **स्लाइडिंग-कॉन्टेक्स्ट के प्रति सजग** — कॉम्पैक्शन सारांश `[compacted] …` एंट्री के रूप में रिकॉल और सर्च में शामिल होते हैं, और हर कॉम्पैक्शन पर एक-क्लिक `/compact` भरने वाला एक क्षणिक सूचना-संदेश आता है।

शुद्ध UI व्यवहार: कोई सत्र ईवेंट नहीं, कोई agent-loop बदलाव नहीं, कोई मॉडल अनुरोध नहीं। रिकॉल किया गया टेक्स्ट केवल सामान्य कंपोज़र ड्राफ़्ट में जाता है; मॉडल तक वह तभी पहुँचता है जब *आप* Enter दबाते हैं।

## Quick start

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Install & uninstall

npm पैकेज में पहले से बने हुए बंडल शामिल होते हैं; सोर्स चेकआउट को पहले बनाना होगा (`pnpm run build`) — क्लाइंट-पैकेज जाँच बिना बने बंडल के साथ बूट करने से मना कर देती है।

- **git चैनल** (नवीनतम `main`): `dsh plugin --profile web add "github:PerryLink/dsh-composer-history#main"`।
- **npm चैनल** (प्रकाशित रिलीज़): `dsh plugin --profile web add dsh-composer-history`।
- **tarball चैनल**: इस रेपो में `pnpm pack` चलाएँ, फिर `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`।
- **अनइंस्टॉल**: `dsh plugin --profile web remove dsh-composer-history` (या प्रोफ़ाइल पैच से पंक्ति हटा दें)।

## Configuration

सभी सेटिंग्स Schemastery `Config` फ़ील्ड हैं (cordis.yml और सेटिंग्स दस्तावेज़ से बदले जा सकते हैं)। id-आधारित ओवरराइड पूरी पंक्ति बदल देता है — ज़रूरत की हर कुंजी फिर से लिखें। अमान्य enum मान पूरे dsh बूट को ज़ोरदार तरीके से विफल कर देते हैं।

| Key | Default | Meaning |
|---|---|---|
| `recallWithDraft` | `'save'` | रिकॉल मोड (`save` / `gate`): `save` रिकॉल से पहले गैर-खाली ड्राफ़्ट सहेजता है; `gate` केवल खाली ड्राफ़्ट पर रिकॉल करता है (Claude/Codex-शैली गेटिंग) |
| `restoreOnEscape` | `true` | जब `Esc` ब्राउज़िंग समाप्त करे तो सहेजा गया ड्राफ़्ट बहाल करें |
| `edgeMode` | `'logical'` | एज पहचान मोड (`logical` / `visual`): `\n` लाइनों से या मापी गई लिपटी लाइनों से |
| `enableCtrlAlias` | `true` | Ctrl+↑/↓ को साधारण ऐरो की तरह व्यवहार करने दें |
| `restoreCaret` | `true` | बॉटम-आउट / `Esc` पर सहेजा गया कर्सर भी बहाल करें |
| `upKey` | `'ArrowUp'` | ऊपर की ओर रिकॉल करने वाला `KeyboardEvent.key`; `''` अक्षम करता है |
| `downKey` | `'ArrowDown'` | नई दिशा में चलने / बहाल करने वाला `KeyboardEvent.key`; `''` अक्षम करता है |
| `escapeKey` | `'Escape'` | ब्राउज़िंग से बाहर निकलने वाला `KeyboardEvent.key`; `''` अक्षम करता है |
| `maxHistory` | `500` | अधिकतम रिकॉल की गई एंट्री (नवीनतम रखी जाती हैं); `0` = असीमित |
| `includeKinds` | `['user']` | इतिहास में शामिल होने वाले वार्तालाप नोड प्रकार (steer संदेश शामिल करने हेतु `'steering'` जोड़ें) |
| `historyScope` | `'session'` | इतिहास का दायरा (`session` / `workspace`): `workspace` अन्य सूचीबद्ध सत्रों के उपयोगकर्ता संदेशों को वर्तमान सत्र से पहले रखता है |
| `persistHistory` | `true` | भेजे गए संदेशों को ब्राउज़र-लोकल स्टोर में जोड़ें |
| `maxPersisted` | `200` | अधिकतम सहेजी गई एंट्री; `0` = असीमित |
| `enableSearch` | `true` | `Ctrl+R` रिवर्स-सर्च ओवरले सक्षम करें |
| `searchKeys` | `['Ctrl+R']` | सर्च खोलने वाले कॉर्ड स्पेक (मॉडिफ़ायर `Ctrl`/`Alt`/`Meta`/`Shift` + एक कुंजी नाम); गलत स्पेक ब्राउज़र फ़ाइबर को ज़ोरदार तरीके से विफल करता है |
| `searchCaseSensitive` | `false` | क्या सर्च मिलान अक्षरों के केस में अंतर करे |
| `includeCompactionSummaries` | `true` | `[compacted] …` चेकपॉइंट सारांशों को रिकॉल और सर्च में शामिल करें |
| `showCompactionNotice` | `true` | कॉम्पैक्शन चेकपॉइंट आने पर क्षणिक सूचना दिखाएँ |
| `compactCommandText` | `'/compact'` | वह स्लैश कमांड जो सूचना की "Compact now" क्रिया कंपोज़र में भरती है; `''` क्रिया छिपा देता है |
| `enableSnippets` | `true` | स्निपेट लाइब्रेरी सक्षम करें (`/save`, `/load`, सर्च-पैनल चयन) |
| `maxSnippets` | `200` | अधिकतम संग्रहीत स्निपेट; `0` = असीमित |
| `enableTemplates` | `true` | प्रॉम्प्ट-टेम्पलेट लाइब्रेरी सक्षम करें (वेरिएबल इन्सर्शन पर भरते हैं) |
| `enableInsights` | `true` | पुनः-उपयोग इनसाइट संकेत सक्षम करें (लोकल उपयोग आँकड़े) |
| `insightMinUses` | `2` | पुनः-उपयोग संकेत दिखने से पहले न्यूनतम उपयोग |
| `enableCompactionHighlight` | `true` | सर्च पैनल में `[compacted] …` सारांशों को अलग ढंग से बैज करें |

## Tools & surfaces

| Surface | Kind | Notes |
|---|---|---|
| `ArrowUp` | keybinding | एज-फर्स्ट ↑/↓ रिकॉल — `{draft, caret}` सहेजता है, बॉटम-आउट या `Esc` पर दोनों बिल्कुल बहाल करता है |
| `Ctrl+R` | keybinding | मिले हुए इतिहास, स्निपेट और टेम्पलेट पर रिवर्स-सर्च ओवरले |
| `/save` | command | वर्तमान ड्राफ़्ट को नामित, टैग किए गए स्निपेट के रूप में सहेजें |
| `/load` | command | कर्सर पर सहेजा गया स्निपेट डालें |
| `templates` | UI | JSON दस्तावेज़ के रूप में प्रॉम्प्ट-टेम्पलेट निर्यात/आयात (केवल स्पष्ट क्लिक पर) |
| `composer-history` | settings namespace | हल की गई कॉन्फ़िगरेशन को ब्राउज़र आधे हिस्से तक ले जाता है |

## Keybindings

| Key | State | Behavior |
|---|---|---|
| ↑ | IDLE, कर्सर पहली लाइन पर | `{draft, caret}` सहेजें, नवीनतम एंट्री भरें, कर्सर अंत तक (कोई इतिहास नहीं → पास) |
| ↑ | BROWSING, कर्सर पहली लाइन पर | पुरानी एंट्री; सबसे पुरानी पर रुकें (इंटरसेप्ट, कोई परिवर्तन नहीं) |
| ↑ | कर्सर पहली लाइन पर नहीं | पूरी तरह मुक्त (ब्राउज़र कर्सर घुमाता है) |
| ↓ | IDLE | हमेशा मुक्त (सामान्य कर्सर गति) |
| ↓ | BROWSING, कर्सर आख़िरी लाइन पर | नई एंट्री; नवीनतम पर → `savedDraft` + `savedCaret` बहाल करें → IDLE |
| ↓ | कर्सर आख़िरी लाइन पर नहीं | पूरी तरह मुक्त |
| Esc | BROWSING (`restoreOnEscape: true`) | `savedDraft` + `savedCaret` बहाल करें → IDLE, इंटरसेप्टेड |
| Esc | अन्यथा | मुक्त (मेनू/पॉपअप Escape अर्थ अछूते) |
| Ctrl+↑/↓ | `enableCtrlAlias: true` | साधारण ऐरो के समान |
| `searchKeys` chord | कंपोज़र फ़ोकस, `plain` चरण, कोई मेनू/चयन/IME नहीं | रिवर्स सर्च खोलें; ब्राउज़िंग समाप्त, दिखा हुआ टेक्स्ट ड्राफ़्ट बन जाता है |
| Shift/Alt/Meta+ऐरो, IME, चयन | कोई भी | हमेशा मुक्त |

`upKey`/`downKey`/`escapeKey`/`searchKeys` ऊपर की कुंजियों का नाम बदलते हैं; मॉडिफ़ायर नीति (और सर्च कॉर्ड का सटीक-मॉडिफ़ायर मिलान) अपरिवर्तित रहती है। सर्च ओवरले के अंदर: ↑/↓ मिलान चयन घुमाते हैं (चुनी हुई पंक्ति दृश्य में स्क्रॉल होती है), Enter भरता है, Esc रद्द करता है, क्लिक चुनता है, बाहर दबाने पर रद्द होता है; मिले हुए सबस्ट्रिंग हर पंक्ति में हाइलाइट होते हैं।

## Reverse search

- **खोलें**: कंपोज़र फ़ोकस में हो और इनपुट `plain` हो, तब `searchKeys` कॉर्ड दबाएँ (यहाँ `Ctrl+R` ब्राउज़र की पेज रीलोड भी रोक देता है — कुंजी केवल कंपोज़र के अंदर ही खपत होती है)।
- **फ़िल्टर करें**: मिले हुए इतिहास (वर्तमान सत्र + पर्सिस्ट + workspace एंट्री) पर सबस्ट्रिंग मिलान; केस संवेदनशीलता `searchCaseSensitive` के अनुसार; मिले हुए सबस्ट्रिंग हर पंक्ति में हाइलाइट होते हैं।
- **चुनें**: Enter ड्राफ़्ट भरता है और कर्सर को अंत तक ले जाता है — सामान्य रिकॉल जैसा ही एकल `setDraft` लेखन पथ। रिकॉल किया गया टेक्स्ट मॉडल तक तभी पहुँचता है जब आप बाद में Enter दबाते हैं।
- **रद्द करें**: Esc या पैनल के बाहर दबाना; ड्राफ़्ट अछूता रहता है।

## Smart input layer

टर्मिनल-शैली इतिहास के ऊपर, तीन ब्राउज़र-लोकल लाइब्रेरी कंपोज़र को पुनः-उपयोग योग्य इनपुट सतह बनाती हैं। नीचे की हर चीज़ `localStorage` में रहती है (कुंजियाँ `dsh.composer-history.snippets.v1`, `.templates.v1`, `.insights.v1`), नेटवर्क को कभी नहीं छूती, और हर स्विच एक `Config` फ़ील्ड है।

**स्निपेट (क्रॉस-सेशन कमांड लाइब्रेरी)**

```text
/save ship-check --tag=release,ops
check the build, run the smoke suite, tag the release        ← ड्राफ़्ट का बाकी हिस्सा स्निपेट है
/save ship-check                                             → "snippet saved: ship-check"
/load ship-check                                             → स्निपेट कंपोज़र भर देता है
Ctrl+R → सर्च पैनल इतिहास के साथ स्निपेट सूचीबद्ध करता है (हरा बैज = नाम)
```

- `/save <नाम>` Enter को खपत करता है, ड्राफ़्ट (कमांड लाइन हटाकर) को kebab-case नाम (वैकल्पिक टैग के साथ) में सहेजता है, और कंपोज़र साफ़ करता है। सहेजने को कुछ नहीं → त्रुटि सूचना, कमांड कभी नहीं भेजा जाता।
- `/load <नाम>` कर्सर पर स्निपेट डालता है (पूरा-ड्राफ़्ट बदलाव, कर्सर अंत तक) और उपयोग गिनता है।
- दायरा: workspace cwd के साथ सहेजे गए स्निपेट workspace-दायरे के होते हैं; बिना वाले वैश्विक होते हैं। `maxSnippets` लाइब्रेरी सीमित करता है; समान-नाम सहेजाव बदल देते हैं।
- प्लगइन कभी नहीं भेजता: हर भराव सामान्य ड्राफ़्ट में जाता है और आपका Enter आपका ही रहता है।

**वेरिएबल वाले प्रॉम्प्ट टेम्पलेट**

टेम्पलेट `{{variable}}` प्लेसहोल्डर वाले संग्रहीत प्रॉम्प्ट टेक्स्ट हैं। सर्च पैनल उन्हें बैंगनी बैज के साथ सूचीबद्ध करता है; एक चुनने पर लाइव सत्र से वेरिएबल भरकर परिणाम डाला जाता है। अंतर्निहित वेरिएबल: `{{workspace}}` (सत्र का cwd), `{{session}}` (सत्र id), `{{draft}}` (वर्तमान ड्राफ़्ट)। अज्ञात वेरिएबल का संदर्भ देने वाला टेम्पलेट छूटे हुए की सूची के साथ ज़ोरदार तरीके से विफल होता है — आधा भरा प्रॉम्प्ट त्रुटि से बदतर है।

टेम्पलेट लाइब्रेरी पैनल के **Export templates / Import templates** बटनों से JSON दस्तावेज़ (`composer-templates-v1`) में निर्यात/आयात होती है — एक स्पष्ट उपयोगकर्ता क्रिया; प्लगइन कभी स्वयं फ़ाइलें नहीं लिखता।

**पुनः-उपयोग इनसाइट**

हर नया कमिट किया गया उपयोगकर्ता संदेश (और हर स्निपेट लोड) सटीक टेक्स्ट से कुंजीबद्ध एक ब्राउज़र-लोकल उपयोग रिकॉर्ड दर्ज करता है। जब आप टाइप करते हैं, तो जैसे ही ड्राफ़्ट कम से कम `insightMinUses` (डिफ़ॉल्ट 2) सत्रों में उपयोग हुए प्रॉम्प्ट से मेल खाता है, कंपोज़र के नीचे एक छोटा संकेत `used M× in N sessions` दिखाता है। `enableInsights` से टॉगल करें; आँकड़ों में केवल डीडुप किए गए टेक्स्ट और काउंटर होते हैं।

**कॉम्पैक्शन सारांश हाइलाइट**

`Ctrl+R` `[compacted] …` सारांशों को अंबर बैज देता है (इतिहास बिना बैज रहता है), स्निपेट को हरा, टेम्पलेट को बैंगनी — पैनल का स्रोत एक नज़र में दिख जाता है। `enableCompactionHighlight` से टॉगल करें।

## Sliding context

हार्नेस कोर हर dsh सत्र को एक स्लाइडिंग कॉन्टेक्स्ट विंडो देता है, वही वर्कफ़्लो जो Claude Code और Codex देते हैं: जब बातचीत मॉडल की कॉन्टेक्स्ट सीमा के करीब पहुँचती है (या प्रोवाइडर ओवरफ़्लो की सूचना देता है), तो हार्नेस **ऑटो-कॉम्पैक्ट** करता है — पुराने टर्न एक `compaction` चेकपॉइंट मार्कर के पीछे सारांशित हो जाते हैं जो ट्रांसक्रिप्ट में दिखता रहता है, मॉडल केवल सारांश और हालिया पूँछ रखता है, और सत्र जारी रहता है। `/compact` माँग पर वही कॉम्पैक्शन चलाता है, और मार्कर एक फैलाने योग्य "Context compacted" पंक्ति के रूप में रेंडर होता है।

`dsh-composer-history` कंपोज़र को उस वर्कफ़्लो से जोड़ता है ताकि विंडो के खिसकने पर आपका टाइपिंग इतिहास कभी न खोए:

- **रिकॉल कॉम्पैक्शन से बचा रहता है** — छायांकित टर्न सत्र स्नैपशॉट में रहते हैं, इसलिए ↑ चेकपॉइंट से पहले और बाद में भेजे गए हर संदेश पर चलता रहता है।
- **सारांश इतिहास में शामिल होते हैं** — हर चेकपॉइंट का सारांश टेक्स्ट `[compacted] …` एंट्री के रूप में ↑ रिकॉल और `Ctrl+R` सर्च में आता है (टॉगल: `includeCompactionSummaries`), इसलिए जो कॉन्टेक्स्ट मॉडल अब शब्दशः नहीं देखता वह एक कीस्ट्रोक दूर रहता है।
- **कॉम्पैक्शन सूचना** — पेज खुला रहते हुए चेकपॉइंट आने पर एक क्षणिक स्नैकबार उसे घोषित करता है (Claude Code का "Auto-compacting conversation…" क्षण) सारांश अंश और एक-क्लिक **Fill `/compact`** क्रिया के साथ (`showCompactionNotice`, `compactCommandText`); भराव सामान्य ड्राफ़्ट में जाता है, और केवल आपका Enter उसे भेजता है।
- **सर्च गिनती** — `Ctrl+R` पैनल अब एक लाइव `N entries` / `N matches` स्थिति-पंक्ति दिखाता है, और लंबी एंट्री दो लाइनों तक सीमित रहती हैं।

> कॉम्पैक्शन स्वयं (सीमाएँ, सारांश मॉडल, `/compact`) हार्नेस कोर के कॉम्पैक्शन प्लगइनों का काम है — यह प्लगइन केवल उन चेकपॉइंट मार्करों को देखता है जो क्लाइंट स्नैपशॉट पहले से उजागर करता है, इसलिए यह बिना किसी agent-loop बदलाव या मॉडल अनुरोध के काम करता है।

## Permissions & data

- **अनुमतियाँ**: प्लगइन अपने workshop manifest में `browser:local-storage` घोषित करता है — और कुछ नहीं। कोई नेटवर्क नहीं, कोई सबप्रोसेस नहीं, कोई सत्र ईवेंट नहीं।
- **डेटा**: चार ब्राउज़र-लोकल `localStorage` कुंजियाँ — `dsh.composer-history.v1` (भेजे गए संदेशों का इतिहास), `dsh.composer-history.snippets.v1` (स्निपेट टेक्स्ट + टैग + उपयोग काउंटर), `dsh.composer-history.templates.v1` (टेम्पलेट टेक्स्ट), और `dsh.composer-history.insights.v1` (डीडुप किए गए प्रॉम्प्ट टेक्स्ट + प्रति-सत्र उपयोग काउंटर)। सभी सीमित, केवल समान-मूल, कभी अपलोड नहीं; भ्रष्ट पेलोड चुपचाप रीसेट होते हैं।
- **मॉडल-दृश्य ⟺ आप Enter दबाते हैं**: रिकॉल किया गया टेक्स्ट, स्निपेट लोड, टेम्पलेट भराव और `/compact` भराव सभी सामान्य कंपोज़र ड्राफ़्ट में जाते हैं। जब तक आप Enter नहीं दबाते, कुछ भी मॉडल तक नहीं पहुँचता।

## Security boundaries

- **केवल UI, कभी प्रवर्तन नहीं।** प्लगइन केवल कंपोज़र ड्राफ़्ट संपादित करता है; सैंडबॉक्स, अनुमोदन और सत्र प्रणालियाँ प्रवर्तन प्राधिकारी बनी रहती हैं, और कोई कमांड या टूल कभी दावा या बायपास नहीं किया जाता।
- **कोई सामग्री ब्राउज़र से बाहर नहीं जाती।** इतिहास, स्निपेट, टेम्पलेट और इनसाइट `localStorage` में रहते हैं; कुछ भी अपलोड नहीं होता और कोई मॉडल अनुरोध या नेटवर्क कॉल नहीं होती।
- **ज़ोरदार विफलता।** अमान्य enum मान पूरे dsh बूट को विफल करते हैं; गलत सर्च कॉर्ड ब्राउज़र फ़ाइबर को विफल करता है — गलत कॉन्फ़िगरेशन कभी चुपचाप घटता नहीं।
- **सब कुछ सीमित।** `maxHistory`, `maxPersisted` और `maxSnippets` रखी गई एंट्री सीमित करते हैं; भ्रष्ट या बाहरी पेलोड चुपचाप रीसेट होते हैं।
- **पास-थ्रू पर शून्य साइड इफ़ेक्ट।** प्लगइन केवल `plain` इनपुट चरण में इंटरसेप्ट करता है और स्लैश मेनू, कमांड पॉपअप, IME संयोजन, टेक्स्ट चयन और मॉडिफ़ायर संयोजनों को रास्ता देता है।

## Known limitations

- **लॉजिकल बनाम विज़ुअल लाइनें।** डिफ़ॉल्ट `logical` `\n` पर आधारित है (ऑटो-रैप हुआ लंबा संदेश एक लाइन गिना जाता है); `visual` एक छिपे mirror से वास्तविक रैप मापता है (प्रति एज जाँच O(लाइनें·log n) बाइनरी सर्च, ड्राफ़्ट/चौड़ाई अनुसार मेमोइज़)। mirror मापन को असली लेआउट इंजन चाहिए — शुद्ध span गणित यूनिट-टेस्ट से ढका है।
- **पर्सिस्टेंट इतिहास प्रति-ब्राउज़र है।** स्टोर एक मूल के `localStorage` में रहता है; ब्राउज़रों या मशीनों के बीच कभी सिंक नहीं होता। भ्रष्ट पेलोड चुपचाप रीसेट होते हैं।
- **अनडू स्टैक में रिकॉल ट्रांज़ैक्शन शामिल हैं।** हर भराव/बहाली इनपुट मशीन के अनडू लॉग में एक `setDraft` ट्रांज़ैक्शन है; Ctrl+Z रिकॉल के पार पीछे जाता है। सटीकता सुधार को अपस्ट्रीम edit-range एक्सपोज़र चाहिए।
- `/xxx` एंट्री रिकॉल करने के बाद Enter सामान्य कमांड claim/adjudication पथ पर चलता है (अपेक्षित, और Enter कभी इंटरसेप्ट नहीं होता)।
- मेनू/पॉपअप और गैर-`plain` चरण हमेशा जीतते हैं; कमिट किया गया सेंड और सत्र बदलाव दोनों IDLE पर रीसेट होते हैं।
- संदर्भ चिप (U+FFFC प्लेसहोल्डर) रिकॉल/बहाल ड्राफ़्ट टेक्स्ट के साथ चलते हैं।
- `historyScope: 'workspace'` अन्य सूचीबद्ध सत्रों के लाइव असेंबली पढ़ता है; जिन सत्रों का असेंबली अभी मटेरियल नहीं हुआ वे अभी कुछ नहीं देते।
- सर्च ओवरले शुद्ध DOM है (कोई React निर्भरता नहीं); यह `maxHistory` सीमा तक सभी मिलान रेंडर करता है।
- **कॉम्पैक्शन सजगता अवलोकनात्मक है।** इंस्टॉल से पहले (या सत्र बदलाव से पहले) आए चेकपॉइंट कभी सूचना नहीं चलाते; जिस चेकपॉइंट का सारांश ईवेंट लोड की गई विंडो से बाहर गिरा वह कोई `[compacted] …` एंट्री नहीं देता (`summary: null`)।
- सूचना की "Compact now" क्रिया केवल कॉन्फ़िगर किया गया कमांड टेक्स्ट ड्राफ़्ट में *भरती* है — भेजना आपका Enter ही रहता है।
- **स्निपेट, टेम्पलेट और इनसाइट ब्राउज़र-लोकल हैं।** नाम kebab-case हैं (1..64 अक्षर); टैग 8 × 32 अक्षरों तक सीमित हैं। टेम्पलेट वेरिएबल लाइव सत्र से हल होते हैं; `{{draft}}` चुनाव के समय का ड्राफ़्ट है।

## Development

```sh
pnpm install           # node ^22.19 || >=24
pnpm run build         # tsc build + tsdown bundle (lib/)
pnpm run typecheck     # tsc --noEmit (src + tests)
pnpm test              # vitest run
pnpm run test:watch    # vitest watch
pnpm run test:coverage # vitest run --coverage
pnpm run check:readmes # README consistency gate
pnpm run verify:pack   # pack-surface check
```

## Topics

`deepseek-harness` · `dsh` · `dsh-plugin` · `web-gui` · `input-history` · `keyboard-shortcuts` · `compaction` · `sliding-context` · `typescript`

## Contributors

- [@PerryLink](https://github.com/PerryLink) — निर्माता और अनुरक्षक: एज-फर्स्ट ऐरो रिकॉल, पर्सिस्टेंट इतिहास, रिवर्स सर्च, स्लाइडिंग-कॉन्टेक्स्ट सजगता, स्निपेट लाइब्रेरी, प्रॉम्प्ट टेम्पलेट, पुनः-उपयोग इनसाइट, और `dsh.bundle` / `dshWorkshop` manifest।

## PerryLink DSH Plugin Family

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) द्वारा अनुरक्षित [15 DeepSeek Harness प्लगइनों](https://github.com/PerryLink) में से एक है। अगर यह आपके काम आता है, तो बाकी भी शायद काम आएँगे:

| Plugin | One-liner |
|---|---|
| [dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel) | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |
| [dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck) | Engineering-discipline guard: requirements grill, test gates, adversary review |
| [dsh-background-agents](https://github.com/PerryLink/dsh-background-agents) | Durable background child agents with a Web UI sidebar, messaging and interrupt |
| [dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions) | LSP diagnostics, formatting, completion, code actions and rename over language servers |
| [dsh-output-styles](https://github.com/PerryLink/dsh-output-styles) | Claude Code outputStyles-equivalent runtime style switching |
| [dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind) | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |
| [dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules) | Claude Code-style declarative allow/deny/ask permission rules with audit |
| [dsh-auto-review](https://github.com/PerryLink/dsh-auto-review) | Second-model auto-review on the approval chain, fail-closed by default |
| [dsh-memento](https://github.com/PerryLink/dsh-memento) | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |
| [dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security) | Security-audit skill pack: secret scan, dependency and supply-chain review |
| [dsh-session-pin](https://github.com/PerryLink/dsh-session-pin) | Pin sessions in the Web sidebar with durable ordering |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |
| [dsh-github](https://github.com/PerryLink/dsh-github) | GitHub PR/issues integration for DSH, every write gated by approval |
| [dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide) | Plugin-development knowledge base as an on-demand agent skill |
| [dsh-claude-move](https://github.com/PerryLink/dsh-claude-move) | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH |

## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors
