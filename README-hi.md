<div align="center">

# ⌨️ dsh-composer-history

> Release stamp: `0.8.8` (2026-10-04).
- **1024 स्टोर चैनल**: एक बार `npm i -g dsh1024`, फिर `dsh1024 plugin --profile web add dsh-composer-history` ([deepseek1024.com](https://deepseek1024.com) इंस्टॉल रैंकिंग में गिना जाता है)।

**DeepSeek Harness Web GUI कंपोज़र के लिए टर्मिनल-शैली इनपुट इतिहास।**

*↑ को टर्मिनल की तरह दबाएँ — और अपना आधा-लिखा ड्राफ़्ट सुरक्षित रखें।*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Gitee](https://img.shields.io/badge/Gitee-mirror-c71d23?logo=gitee)](https://gitee.com/perrylink/dsh-composer-history)
[![DSH plugin](https://img.shields.io/badge/dsh--plugin-✅-green)](https://github.com/topics/dsh-plugin)
[![dsh-doctor](https://raw.githubusercontent.com/PerryLink/dsh-plugin-doctor/main/badges/PerryLink__dsh-composer-history.svg)](https://github.com/PerryLink/dsh-plugin-doctor#verified-徽章)
[![DSH Market](https://raw.githubusercontent.com/2BingLing/dsh-market/master/assets/readme/badge-top-rated.svg)](https://dsh.market/)
[![Node](https://img.shields.io/badge/node-%5E22.19%20%7C%7C%20%3E%3D24-brightgreen.svg)](#)
[![CI](https://img.shields.io/github/actions/workflow/status/PerryLink/dsh-composer-history/ci.yml?branch=main&label=CI)](https://github.com/PerryLink/dsh-composer-history/actions)
[![Version](https://img.shields.io/github/v/tag/PerryLink/dsh-composer-history?label=version)](https://github.com/PerryLink/dsh-composer-history/releases)
[![npm version](https://img.shields.io/npm/v/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![npm downloads](https://img.shields.io/npm/dm/dsh-composer-history)](https://www.npmjs.com/package/dsh-composer-history)
[![dshfind](https://dshfind.com/api/badge/PerryLink/dsh-composer-history?metric=downloads&lang=hi)](https://dshfind.com/hi/plugins/PerryLink/dsh-composer-history?ref=badge)

[English](README.md) · [简体中文](README-zh.md) · [Español](README-es.md) · [Português](README-pt.md) · [हिन्दी](README-hi.md)

```sh
dsh plugin --profile <name> add dsh-composer-history
```


</div>

---


**📖 इकोसिस्टम नॉलेज बेस** — मापे गए आँकड़े, मार्केटिंग नहीं: [डेवलपमेंट गाइड · चयन डेटा · रखरखाव मानदंड](https://perrylink.github.io/dsh-plugin-guide/)।

<!-- star-cta -->
## Install & uninstall

npm पैकेज में पहले से बने हुए बंडल शामिल होते हैं; सोर्स चेकआउट को पहले बनाना होगा (`pnpm run build`) — क्लाइंट-पैकेज जाँच बिना बने बंडल के साथ बूट करने से मना कर देती है।

- **git चैनल** (नवीनतम `main`): `dsh plugin --profile web add github:PerryLink/dsh-composer-history`।
- **npm चैनल** (प्रकाशित रिलीज़): `dsh plugin --profile web add dsh-composer-history`।
- **tarball चैनल**: इस रेपो में `pnpm pack` चलाएँ, फिर `dsh plugin --profile web add ./dsh-composer-history-<version>.tgz`।
- **अनइंस्टॉल**: `dsh plugin --profile web remove dsh-composer-history` (या प्रोफ़ाइल पैच से पंक्ति हटा दें)।

## ⭐ 如果它帮到了你

यह प्लगइन [DSH प्लगइन परिवार](https://github.com/PerryLink) का हिस्सा है (40+ प्लगइन, सभी Apache-2.0)। अगर यह उपयोगी लगे, तो **एक स्टार दें** — इससे कोई सुविधा अनलॉक नहीं होती, पर अगला व्यक्ति इसे खोज में आसानी से पा लेता है।

*English:* part of a 40+ plugin family for DeepSeek Harness. If it is useful, **a star helps the next person find it** — nothing is gated behind it.

## What is dsh-composer-history?

DeepSeek Harness Web GUI कंपोज़र के लिए टर्मिनल-शैली इनपुट इतिहास।

↑ को टर्मिनल की तरह दबाएँ — और अपना आधा-लिखा ड्राफ़्ट सुरक्षित रखें।

![dsh-composer-history का टर्मिनल डेमो: dsh-composer-history — /save and /load, plus arrow recall and Ctrl+R search](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-hero.png)

![Animated terminal demo of dsh-composer-history](https://raw.githubusercontent.com/PerryLink/dsh-composer-history/main/docs/assets/dsh-composer-history-demo.gif)

*वही रन, एनिमेटेड।*

## Compatibility

| Surface | Status |
|---|---|
| हारनेस | DeepSeek Harness `dsh-v0.2.1-rc.2` (2026-10-18 सत्यापित): `engines.dsh >=0.2.1-0 <0.3.0`; P0 संगतता पथ के रिग्रेशन परीक्षण हैं। |
| Node | `^22.19.0 \|\| >=24.0.0` |
| Platforms | केवल Web GUI (क्लाइंट प्लगइन; ब्राउज़र-लोकल स्टोरेज; कोई नेटवर्क नहीं, कोई नेटिव कोड नहीं) |
| Model | कोई भी (कोई मॉडल अनुरोध नहीं — शुद्ध UI व्यवहार) |

ब्राउज़र हिस्सा प्रकाशित क्लाइंट पैकेजों (`dsh-client-ui-conversation`, `dsh-client-ui-input-trigger`, `dsh-client-ui-settings`) और cordis `Context` पर चलता है; यह अब हटाए गए `dsh-client-runtime` पैकेज पर निर्भर नहीं करता, इसलिए क्लाइंट सतह `0.1.2-rc.1` होस्ट के साथ भी मेल खाती है।
इंटरसेप्शन वेब कम्पोज़र के DOM पर टिकता है: `[data-input-scroll]` के अंदर contenteditable सतह `div[data-composer-input]` (Lexical कम्पोज़र, 0.1.2-alpha.5 / 0.1.2-rc.1 से), साथ ही `[data-input-scroll]` के अंदर लीगेसी textarea कम्पोज़र (0.1.1-rc.2 तक की लाइनें) मेल खाता रहता है; बाकी textarea आगे बढ़ जाते हैं। compat वर्कफ़्लो का jsdom वेब-व्यवहार स्मोक पैक किए गए बंडल पर इस पहचान/टेक्स्ट/कैरेट फेस को दोहराता है।
0.1.2-rc.1 (2026-09-04 को अनुकूलित): सत्र लिफ़ाफ़ा अपना ignorable फ़ील्ड केवल संग्रहीत-लॉग पठन संगतता के लिए रखता है - Session.append अभी भी इसे स्टैम्प नहीं कर सकता, इसलिए गेट व्यवहार अपरिवर्तित है। 2026-09-06 को dsh-v0.1.7-alpha.1 master checkout के विरुद्ध सत्यापित (पूर्ण गेट शृंखला + प्रोफ़ाइल इंस्टॉल स्मोक)।
0.1.5-rc.1 (2026-09-10 को अनुकूलित): निर्भरता पिन प्रकाशित 0.1.5-rc.1 लाइन पर चले जाते हैं; कोई सीम परिवर्तन इस प्लगइन के व्यवहार को प्रभावित नहीं करता।
0.1.5-rc.2 (2026-09-11 को अनुकूलित): निर्भरता पिन प्रकाशित 0.1.5-rc.2 लाइन पर चले जाते हैं; कोई सीम परिवर्तन इस प्लगइन के व्यवहार को प्रभावित नहीं करता।
0.1.7-alpha.1 (2026-10-04 को अनुकूलित): सेटिंग्स सीम दोनों हिस्सों में बदल दी गई है। होस्ट हिस्सा अब हटाए गए `ctx.settings.register(ns, schema, { base })` से `composer-history` नामस्थान पंजीकृत नहीं करता — इस लाइन पर प्लगइन की टिकाऊ सेटिंग्स सतह उसका अपना जीवित `Config` ही है: हर सेटिंग `.volatile()` घोषित है, प्रोफ़ाइल प्रविष्टि id (`composer-history`, यानी bundle patch की पंक्ति id) फ़ॉर्म का नाम है, और `apply` जनित-फ़ॉर्म प्रस्तुति नीति का दावा करता है (`ctx.settings.configure({ auto: true }, ctx.fiber)`, effect के स्वामित्व में ताकि reload साफ़-सुथरे ढंग से फिर पंजीकृत हो)। ब्राउज़र हिस्सा उसी प्रविष्टि को हटाए गए `ctx.settingsScope.bind({ namespace })` के बजाय `ctx.configForms.get('composer-history')` से पढ़ता है; snapshot/subscribe का आकार अपरिवर्तित है, इसलिए हर स्वीकृत परिवर्तन पर वायरिंग फिर से बैठती है। संपादन-योग्य सतह संरक्षित है, बढ़ाई नहीं गई: पुराने नामस्थान के सभी फ़ील्ड volatile हैं और कोई नया फ़ील्ड संपादन-योग्य नहीं बना। मौजूदा `settings.yaml` का `composer-history` नाम वाला अनुभाग होस्ट स्वयं उसी id की प्रोफ़ाइल प्रविष्टि में स्थानांतरित कर देता है।

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
dsh plugin --profile web add github:PerryLink/dsh-composer-history
```

```sh
# 1. install the bundle into your profile
dsh plugin --profile web add github:PerryLink/dsh-composer-history

# or from npm (published releases)
dsh plugin --profile web add dsh-composer-history

# 2. restart and verify the row
dsh --profile web --dump-config | grep -A3 'id: composer-history'
```

## Configuration

सभी सेटिंग्स Schemastery `Config` फ़ील्ड हैं (cordis.yml और प्रविष्टि के सेटिंग्स फ़ॉर्म से बदले जा सकते हैं; profile patch ही संग्रहीत दस्तावेज़ है)। id-आधारित ओवरराइड पूरी पंक्ति बदल देता है — ज़रूरत की हर कुंजी फिर से लिखें। अमान्य enum मान पूरे dsh बूट को ज़ोरदार तरीके से विफल कर देते हैं, और सेटिंग्स फ़ॉर्म का संपादन संग्रहीत होने से पहले होस्ट द्वारा मान्य किया जाता है।

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
| `composer-history` | settings form | प्रोफ़ाइल प्रविष्टि का अपना जीवित `Config` फ़ॉर्म — हल की गई कॉन्फ़िगरेशन (cordis.yml आधार + प्रोफ़ाइल ओवरराइड) को ब्राउज़र आधे हिस्से तक ले जाता है |

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

## बैकअप निर्यात और आयात

चारों ब्राउज़र-लोकल लाइब्रेरी एक संस्करणित JSON दस्तावेज़ में निर्यात/आयात होती हैं। पैनल की **Export JSON / Copy JSON / Import file / Paste JSON** क्रियाएँ पूरी तरह ब्राउज़र में चलती हैं: निर्यात पर डाउनलोड या क्लिपबोर्ड कॉपी, आयात पर फ़ाइल चयन या पेस्ट किया टेक्स्ट — कुछ भी अपलोड नहीं होता और कोई होस्ट RPC या नेटवर्क कॉल शामिल नहीं।

**दस्तावेज़ आकार**

```json
{
  "schemaVersion": 1,
  "exportedAt": 1735689600000,
  "data": {
    "history": ["…"],
    "snippets": [{ "name": "…", "text": "…", "tags": [], "scope": "global", "createdAt": 0, "updatedAt": 0, "useCount": 0, "lastUsedAt": 0 }],
    "templates": [{ "name": "…", "text": "…", "description": "", "updatedAt": 0 }],
    "insights": [{ "text": "…", "sessions": [], "uses": 0, "lastUsedAt": 0 }]
  }
}
```

**मर्ज और टकराव रणनीति**

- इतिहास एंट्री सादे स्ट्रिंग हैं और सटीक टेक्स्ट से डीडुप होती हैं; डुप्लिकेट या खाली एंट्री छोड़ी जाती है, कभी ओवरराइट नहीं।
- स्निपेट और टेम्पलेट `name` से कुंजीबद्ध हैं; इनसाइट सटीक `text` से। समान-कुंजी टकराव में **नवीनतम टाइमस्टैम्प जीतता है** (स्निपेट/टेम्पलेट के लिए `updatedAt`, इनसाइट के लिए `lastUsedAt`); पुराना या समान-टाइमस्टैम्प आयात छोड़ा जाता है, और नई कुंजियाँ जोड़ी जाती हैं।
- आयात `maxPersisted` और `maxSnippets` का सम्मान करता है; टेम्पलेट और इनसाइट अपनी निश्चित प्रोटोकॉल सीमा (`500` प्रत्येक) पर रुकते हैं।
- परिणाम सूचना बताती है कि कितने रिकॉर्ड लिखे गए और कितने छोड़े गए (पुराने/डुप्लिकेट)।

**स्कीमा संस्करण**

`schemaVersion` `1` से शुरू होता है। आयात चरणबद्ध माइग्रेशन चलाते हैं (एक बार में एक संस्करण) ताकि भविष्य के प्रारूप पुराने दस्तावेज़ों को मौके पर अपग्रेड कर सकें। जिस दस्तावेज़ का `schemaVersion` इस बिल्ड की समझ से **नया** हो वह त्रुटि के साथ अस्वीकार होता है — कभी चुपचाप गिराया या आंशिक रूप से मर्ज नहीं; माइग्रेट करने के लिए बहुत पुराना संस्करण भी उसी तरह अस्वीकार होता है।

## Sliding context

हार्नेस कोर हर dsh सत्र को एक स्लाइडिंग कॉन्टेक्स्ट विंडो देता है, वही वर्कफ़्लो जो Claude Code और Codex देते हैं: जब बातचीत मॉडल की कॉन्टेक्स्ट सीमा के करीब पहुँचती है (या प्रोवाइडर ओवरफ़्लो की सूचना देता है), तो हार्नेस **ऑटो-कॉम्पैक्ट** करता है — पुराने टर्न एक `compaction` चेकपॉइंट मार्कर के पीछे सारांशित हो जाते हैं जो ट्रांसक्रिप्ट में दिखता रहता है, मॉडल केवल सारांश और हालिया पूँछ रखता है, और सत्र जारी रहता है। `/compact` माँग पर वही कॉम्पैक्शन चलाता है, और मार्कर एक फैलाने योग्य "Context compacted" पंक्ति के रूप में रेंडर होता है।

`dsh-composer-history` कंपोज़र को उस वर्कफ़्लो से जोड़ता है ताकि विंडो के खिसकने पर आपका टाइपिंग इतिहास कभी न खोए:

- **रिकॉल कॉम्पैक्शन से बचा रहता है** — छायांकित टर्न Chat दृश्य द्वारा प्रकाशित अंतिम रूप से तय बातचीत में रहते हैं, इसलिए ↑ चेकपॉइंट से पहले और बाद में भेजे गए हर संदेश पर चलता रहता है।
- **सारांश इतिहास में शामिल होते हैं** — हर चेकपॉइंट का सारांश टेक्स्ट `[compacted] …` एंट्री के रूप में ↑ रिकॉल और `Ctrl+R` सर्च में आता है (टॉगल: `includeCompactionSummaries`), इसलिए जो कॉन्टेक्स्ट मॉडल अब शब्दशः नहीं देखता वह एक कीस्ट्रोक दूर रहता है।
- **कॉम्पैक्शन सूचना** — पेज खुला रहते हुए चेकपॉइंट आने पर एक क्षणिक स्नैकबार उसे घोषित करता है (Claude Code का "Auto-compacting conversation…" क्षण) सारांश अंश और एक-क्लिक **Fill `/compact`** क्रिया के साथ (`showCompactionNotice`, `compactCommandText`); भराव सामान्य ड्राफ़्ट में जाता है, और केवल आपका Enter उसे भेजता है।
- **सर्च गिनती** — `Ctrl+R` पैनल अब एक लाइव `N entries` / `N matches` स्थिति-पंक्ति दिखाता है, और लंबी एंट्री दो लाइनों तक सीमित रहती हैं।

> कॉम्पैक्शन स्वयं (सीमाएँ, सारांश मॉडल, `/compact`) हार्नेस कोर के कॉम्पैक्शन प्लगइनों का काम है — यह प्लगइन केवल उन चेकपॉइंट मार्करों को देखता है जो Chat दृश्य का बातचीत प्रक्षेपण (`uiConversation.binding(id).target('chat').legacy.nodes`) पहले से प्रकाशित करता है, इसलिए यह बिना किसी agent-loop बदलाव या मॉडल अनुरोध के काम करता है।

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

- **कम्पोज़र DOM फेस।** इंटरसेप्शन होस्ट-निजी DOM पर टिकता है: `[data-input-scroll]` के अंदर contenteditable `div[data-composer-input]` (होस्ट 0.1.2-alpha.5 / 0.1.2-rc.1 और बाद); `[data-input-scroll]` के अंदर लीगेसी textarea कम्पोज़र (0.1.1-rc.2 तक की लाइनें) मेल खाता रहता है। यह आकार कोई प्रकाशित API नहीं है (अपस्ट्रीम प्रस्ताव C3 दर्ज करता है कि प्लगइन केवल होस्ट DOM का अनुमान लगा सकते हैं), इसलिए भविष्य में होस्ट DOM बदलाव इंटरसेप्शन को चुपचाप तोड़ सकता है — compat वर्कफ़्लो का jsdom स्मोक पैक किए गए बंडल पर फेस को फिर से जाँचता है।
- **लॉजिकल बनाम विज़ुअल लाइनें।** डिफ़ॉल्ट `logical` `\n` पर आधारित है (ऑटो-रैप हुआ लंबा संदेश एक लाइन गिना जाता है); `visual` एक छिपे mirror से वास्तविक रैप मापता है जो contenteditable सतह का कंप्यूटेड बॉक्स कॉपी करता है (प्रति एज जाँच O(लाइनें·log n) बाइनरी सर्च, ड्राफ़्ट/चौड़ाई अनुसार मेमोइज़)। mirror मापन को असली लेआउट इंजन चाहिए — शुद्ध span गणित यूनिट-टेस्ट से ढका है, और Lexical कम्पोज़र पर मापे गए span सर्वोत्तम-प्रयास बने रहते हैं (`logical` डिफ़ॉल्ट बना रहता है)।
- **पर्सिस्टेंट इतिहास प्रति-ब्राउज़र है।** स्टोर एक मूल के `localStorage` में रहता है; ब्राउज़रों या मशीनों के बीच कभी सिंक नहीं होता। भ्रष्ट पेलोड चुपचाप रीसेट होते हैं।
- **अनडू स्टैक में रिकॉल ट्रांज़ैक्शन शामिल हैं।** हर भराव/बहाली इनपुट मशीन के अनडू लॉग में एक `setDraft` ट्रांज़ैक्शन है; Ctrl+Z रिकॉल के पार पीछे जाता है। सटीकता सुधार को अपस्ट्रीम edit-range एक्सपोज़र चाहिए।
- `/xxx` एंट्री रिकॉल करने के बाद Enter सामान्य कमांड claim/adjudication पथ पर चलता है (अपेक्षित, और Enter कभी इंटरसेप्ट नहीं होता)।
- मेनू/पॉपअप और गैर-`plain` चरण हमेशा जीतते हैं; कमिट किया गया सेंड और सत्र बदलाव दोनों IDLE पर रीसेट होते हैं।
- संदर्भ चिप (U+FFFC प्लेसहोल्डर) रिकॉल/बहाल ड्राफ़्ट टेक्स्ट के साथ चलते हैं।
- `historyScope: 'workspace'` अन्य सूचीबद्ध सत्रों के Chat लक्ष्य पढ़ता है; जिस सत्र का Chat दृश्य इस पृष्ठ में सक्रिय नहीं हुआ वह अभी कुछ नहीं देता।
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

यह प्रोजेक्ट [PerryLink](https://github.com/PerryLink) के **87 सक्रिय रूप से अनुरक्षित** DeepSeek Harness प्लगइन में से एक है। पूरा परिवार **95** प्लगइन है — **5 फ़्रोज़न**, **3 सेवानिवृत्त** — और नीचे संक्षिप्त रखा गया है ताकि हर README की पहली स्क्रीन छोटी रहे। हर पंक्ति देखने के लिए इसे खोलें; कारण स्थिति कॉलम में है।

<details>
<summary>सभी 95 प्लगइन खोलें</summary>

| प्लगइन | एक पंक्ति | स्थिति |
|---|---|---|
| **[dsh-aqua-input-check](https://github.com/PerryLink/dsh-aqua-input-check)** | 水产养殖投入品记录核对（按投入品用量、休药期与起捕间隔核对记录自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-archive-check](https://github.com/PerryLink/dsh-archive-check)** | 档案归档完整性与保管期限核对（依据《档案法》及配套规定，仅提示差异，不作出定性结论） |  |
| **[dsh-auto-review](https://github.com/PerryLink/dsh-auto-review)** | Second-model auto-review on the approval chain, fail-closed by default |  |
| **[dsh-autotier](https://github.com/PerryLink/dsh-autotier)** | Automatic strong/cheap model-tier routing with deterministic risk guards and a `/tier` command |  |
| **[dsh-background-agents](https://github.com/PerryLink/dsh-background-agents)** | Durable background child agents with a Web UI sidebar, messaging and interrupt | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-bid-ca-precheck](https://github.com/PerryLink/dsh-bid-ca-precheck)** | 投标文件符合性预检（按招标文件逐条核对响应情况，仅提示差异，不作出定性结论） |  |
| **[dsh-bid-qual-check](https://github.com/PerryLink/dsh-bid-qual-check)** | 投标人资格条件核对（按资格条件与证明材料核对逐条响应，仅提示差异，不作出定性结论） |  |
| **[dsh-budget](https://github.com/PerryLink/dsh-budget)** | Cost governance for DeepSeek Harness: budgets, carbon, and latency in one panel. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-cert-mcp](https://github.com/PerryLink/dsh-cert-mcp)** | Read-only MCP server exposing the certification registry: grades, snapshots and five-dimension evidence |  |
| **[dsh-checkpoint-rewind](https://github.com/PerryLink/dsh-checkpoint-rewind)** | Claude Code /rewind-equivalent: snapshots, session forks, one-shot restore |  |
| **[dsh-claude-move](https://github.com/PerryLink/dsh-claude-move)** | Migrate Claude Code sessions, memory, skills and CLAUDE.md into DSH | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-click](https://github.com/PerryLink/dsh-click)** | Cross-platform native desktop control for DeepSeek Harness — Windows first. |  |
| **[dsh-composer-history](https://github.com/PerryLink/dsh-composer-history)** | Terminal-style input history for the web composer: arrows, Ctrl+R search |  |
| **[dsh-contract-stance](https://github.com/PerryLink/dsh-contract-stance)** | 合同条款立场台账核对（按立场、风险等级与退让底线核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-customs-doc-check](https://github.com/PerryLink/dsh-customs-doc-check)** | 报关单证一致性核对（按公开的报关单填制规范核对单证间字段一致性，仅提示差异，不作出定性结论） |  |
| **[dsh-data-quality](https://github.com/PerryLink/dsh-data-quality)** | Dataset quality checks and citation cross-checks (the optional numeric bridge consumed here) |  |
| **[dsh-defend](https://github.com/PerryLink/dsh-defend)** | Prompt-injection, jailbreak, and secret-leak defense for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-demurrage-ledger](https://github.com/PerryLink/dsh-demurrage-ledger)** | 滞箱费台账核对（按免箱期与费率核对超期天数与金额的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-doublecheck](https://github.com/PerryLink/dsh-doublecheck)** | Engineering-discipline guard: requirements grill, test gates, adversary review |  |
| **[dsh-draw](https://github.com/PerryLink/dsh-draw)** | Unified static-image generation routing for DeepSeek Harness. | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-drill-script-check](https://github.com/PerryLink/dsh-drill-script-check)** | 应急演练脚本核对（按阶段、响应分级、指挥与资源要素核对脚本齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-eia-guide-check](https://github.com/PerryLink/dsh-eia-guide-check)** | 环评导则适用性核对（按要素、导则名称与执行标准核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-emergency-plan](https://github.com/PerryLink/dsh-emergency-plan)** | 应急预案要素齐备性与条款级页码定位（依据 GB/T 29639-2020 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-essay-rubric-check](https://github.com/PerryLink/dsh-essay-rubric-check)** | 作文量表评分核对（按评分项、原文定位与分值算术核对评分自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-evidence-check](https://github.com/PerryLink/dsh-evidence-check)** | 证据清单齐备性核对（按待证事实与证据要素核对清单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-export-ctl-check](https://github.com/PerryLink/dsh-export-ctl-check)** | 出口管制物项核对（按管制清单、最终用途与许可证核对台账齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-fast](https://github.com/PerryLink/dsh-fast)** | Read-only performance diagnostics for DeepSeek Harness. |  |
| **[dsh-fmea-table-check](https://github.com/PerryLink/dsh-fmea-table-check)** | FMEA 分析表要素齐备性与风险顺序数一致性核对（按公开的 FMEA 方法标准核对表内自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-forecast-penalty](https://github.com/PerryLink/dsh-forecast-penalty)** | 预测准确率考核核对（按准确率、门槛与考核单价核对考核费用的算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-fund-research](https://github.com/PerryLink/dsh-fund-research)** | Deterministic research reports for Chinese public mutual funds |  |
| **[dsh-github](https://github.com/PerryLink/dsh-github)** | GitHub PR/issues integration for DSH, every write gated by approval |  |
| **[dsh-gongwen-flow-check](https://github.com/PerryLink/dsh-gongwen-flow-check)** | 公文流转与办理时限核对（按公开的公文处理规范核对环节完整性与时限，仅提示差异，不作出定性结论） |  |
| **[dsh-gongwen-word-check](https://github.com/PerryLink/dsh-gongwen-word-check)** | 公文格式要素核对（按公开的党政机关公文格式标准核对版头与主体要素，仅提示差异，不作出定性结论） |  |
| **[dsh-guard-plan-qc](https://github.com/PerryLink/dsh-guard-plan-qc)** | 劳动保护与安全防护用品配置表核对（按公开的配备标准核对品名规格与配置数量，仅提示差异，不作出定性结论） |  |
| **[dsh-hazchem-check](https://github.com/PerryLink/dsh-hazchem-check)** | 危险化学品临界量与重大危险源辨识核对（按储存量与临界量核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-hazplan-check](https://github.com/PerryLink/dsh-hazplan-check)** | HAZOP 分析表要素齐备性与偏差推导一致性核对（依据公开的危险与可操作性分析标准，仅提示差异，不作出定性结论） |  |
| **[dsh-hidden-risk-map](https://github.com/PerryLink/dsh-hidden-risk-map)** | 安全隐患台账→《工贸企业重大事故隐患判定标准》（应急管理部令第10号）条款映射提示（仅提示差异，不作出定性结论） |  |
| **[dsh-hs-classify](https://github.com/PerryLink/dsh-hs-classify)** | 商品归类层级一致性核对（按章、品目、子目与商品编号的层级关系核对自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-icd-rule-check](https://github.com/PerryLink/dsh-icd-rule-check)** | ICD 合并编码与星剑号配对提示（依据 GB/T 14396-2016 与公开的 ICD 使用说明，仅提示差异，不作出定性结论） |  |
| **[dsh-industry-research](https://github.com/PerryLink/dsh-industry-research)** | Industry research orchestration that seals its deliverables through this plugin's `ctx.researchReport.assemble` |  |
| **[dsh-lawcite-adapter](https://github.com/PerryLink/dsh-lawcite-adapter)** | 法条引用与文书要素核对（按名称、条号、原文与效力状态核对引用可核验性，仅提示差异，不作出定性结论） |  |
| **[dsh-laya](https://github.com/PerryLink/dsh-laya)** | Laya typed decisions (`noul`/`choice`/`score`) as a first-class Cordis service and model-visible tools |  |
| **[dsh-lc-doc-check](https://github.com/PerryLink/dsh-lc-doc-check)** | 信用证单据条款核对（按单据种类、份数、期限与不符点核对交单自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-learning-gap-check](https://github.com/PerryLink/dsh-learning-gap-check)** | 能力差距与培养计划核对（按能力等级差、培养措施与完成期限核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-library](https://github.com/PerryLink/dsh-library)** | Local document knowledge base for DeepSeek Harness. |  |
| **[dsh-local-ai](https://github.com/PerryLink/dsh-local-ai)** | Local-model (Ollama) integration for DeepSeek Harness. |  |
| **[dsh-lsp-actions](https://github.com/PerryLink/dsh-lsp-actions)** | LSP diagnostics, formatting, completion, code actions and rename over language servers |  |
| **[dsh-mask](https://github.com/PerryLink/dsh-mask)** | PII masking middleware: anonymize at the model boundary, restore at the display layer |  |
| **[dsh-mcp-panel](https://github.com/PerryLink/dsh-mcp-panel)** | Read-only MCP runtime panel: /mcp command + Settings tab with status, tools and errors |  |
| **[dsh-medrec-qc](https://github.com/PerryLink/dsh-medrec-qc)** | 病案首页形式质控与逻辑矛盾提示（依据国卫办医发〔2016〕24号等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-memento](https://github.com/PerryLink/dsh-memento)** | Approval-gated cross-session memory: ctx.memory seam + SQLite + memory tool |  |
| **[dsh-nsfc-form-check](https://github.com/PerryLink/dsh-nsfc-form-check)** | 国家自然科学基金申请书形式审查与匿名化提示（依据《国家自然科学基金条例》与申请人导入的当年指南，仅提示差异，不作出定性结论） |  |
| **[dsh-nurse-record-check](https://github.com/PerryLink/dsh-nurse-record-check)** | 护理记录时限、签名与评估表完整性校验（依据《病历书写基本规范》等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-observe](https://github.com/PerryLink/dsh-observe)** | OpenTelemetry and Langfuse observability exporter for DeepSeek Harness. |  |
| **[dsh-origin-rvc-check](https://github.com/PerryLink/dsh-origin-rvc-check)** | 原产地区域价值成分核对（按 RVC 定义式与门槛核对原产地判定自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-ota-review-check](https://github.com/PerryLink/dsh-ota-review-check)** | 在线点评回复台账核对（按回复时限、问题分类与整改状态核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-output-styles](https://github.com/PerryLink/dsh-output-styles)** | Claude Code outputStyles-equivalent runtime style switching |  |
| **[dsh-paper-doc-adapter](https://github.com/PerryLink/dsh-paper-doc-adapter)** | 试卷解析结构核对（按题型、答案、分值与 yotta 标识核对试卷结构自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-permission-rules](https://github.com/PerryLink/dsh-permission-rules)** | Claude Code-style declarative allow/deny/ask permission rules with audit |  |
| **[dsh-permit-report-check](https://github.com/PerryLink/dsh-permit-report-check)** | 行政许可办理核对（按申请材料、法定时限与决定记录核对台账闭环，仅提示差异，不作出定性结论） |  |
| **[dsh-pipeline-check](https://github.com/PerryLink/dsh-pipeline-check)** | 项目全流程文件链条核对（按环节先后与金额口径核对链条自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-pleading-draft](https://github.com/PerryLink/dsh-pleading-draft)** | 起诉状要素齐备性核对（按诉请、事实、证据、法条四要素核对文书齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-plugin-doctor](https://github.com/PerryLink/dsh-plugin-doctor)** | Zero-dependency static + sandbox smoke detector for DSH plugins |  |
| **[dsh-plugin-guide](https://github.com/PerryLink/dsh-plugin-guide)** | Plugin-development knowledge base as an on-demand agent skill |  |
| **[dsh-plugin-kit](https://github.com/PerryLink/dsh-plugin-kit)** | Shared zero-runtime-dependency toolkit for the PerryLink DSH plugins |  |
| **[dsh-plugin-upgrade](https://github.com/PerryLink/dsh-plugin-upgrade)** | One-package, one-corridor-index plugin upgrade skill: routes a repository to the matching closed corridor card |  |
| **[dsh-policy-brief-draft](https://github.com/PerryLink/dsh-policy-brief-draft)** | 政策专报要素核对（按观点、依据、出处与建议核对专报齐备，仅提示差异，不作出定性结论） |  |
| **[dsh-power-loss-split](https://github.com/PerryLink/dsh-power-loss-split)** | 线损电量拆分与考核表核对（依据公开的线损计算口径，仅提示差异，不作出定性结论） |  |
| **[dsh-power-ticket-check](https://github.com/PerryLink/dsh-power-ticket-check)** | 电力工作票要素齐备性与签发许可顺序核对（依据现行电力安全工作规程，仅提示差异，不作出定性结论） |  |
| **[dsh-ppap-check](https://github.com/PerryLink/dsh-ppap-check)** | PPAP 提交要素齐备性核对（按公开的 PPAP 手册与提交等级核对要素齐备与版本填写，仅提示差异，不作出定性结论） |  |
| **[dsh-protest-deadline](https://github.com/PerryLink/dsh-protest-deadline)** | 质疑与投诉期限核对（按公开的政府采购质疑投诉规定核对期限与台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-railway-window](https://github.com/PerryLink/dsh-railway-window)** | 铁路施工天窗台账核对（按时间窗、时长算术与命令号核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-reach](https://github.com/PerryLink/dsh-reach)** | Multi-channel approval/question bridge: WeChat/Telegram/Feishu, session console | 🧊 फ़्रोज़न — रिपॉज़िटरी README देखें |
| **[dsh-repair-order-qc](https://github.com/PerryLink/dsh-repair-order-qc)** | 维修工单结算核对（按项目金额、配件工时合计与结算总额核对算术自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-research-report](https://github.com/PerryLink/dsh-research-report)** | Verifiable research-report engine: content-addressed evidence ledger and sealed versions |  |
| **[dsh-review-reply-check](https://github.com/PerryLink/dsh-review-reply-check)** | 审稿意见逐条回应覆盖核对（按意见与回应一一对应核对覆盖完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-rulefile-check](https://github.com/PerryLink/dsh-rulefile-check)** | 规则库文件自检核对（按条款引用纪律与效力上限核对规则库自身合规，仅提示差异，不作出定性结论） |  |
| **[dsh-safety-brief-check](https://github.com/PerryLink/dsh-safety-brief-check)** | 安全技术交底记录要素齐备性与签字闭环核对（依据公开的安全生产法规与检查标准，仅提示差异，不作出定性结论） |  |
| **[dsh-score](https://github.com/PerryLink/dsh-score)** | Multi-dimensional quality scoring for DeepSeek Harness plugins. |  |
| **[dsh-session-pin](https://github.com/PerryLink/dsh-session-pin)** | Pin sessions in the Web sidebar with durable ordering | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-session-sync](https://github.com/PerryLink/dsh-session-sync)** | Cross-device session sync for DeepSeek Harness — a dedicated git mirror of your session store. |  |
| **[dsh-site-log-check](https://github.com/PerryLink/dsh-site-log-check)** | 监理日志跨日连续性与旁站覆盖提示（依据 GB/T 50319-2013 等公开文件，仅提示差异，不作出定性结论） |  |
| **[dsh-skill-pack-security](https://github.com/PerryLink/dsh-skill-pack-security)** | Security-audit skill pack: secret scan, dependency and supply-chain review |  |
| **[dsh-soe-decision-check](https://github.com/PerryLink/dsh-soe-decision-check)** | 三重一大决策台账核对（按前置研究、会议审议与决议记录核对程序留痕，仅提示差异，不作出定性结论） |  |
| **[dsh-soilwater-check](https://github.com/PerryLink/dsh-soilwater-check)** | 土壤与地下水监测台账核对（按点位、监测项目、限值与超标判定核对台账自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-sop-sync-check](https://github.com/PerryLink/dsh-sop-sync-check)** | 作业规程与 FMEA／控制计划一致性核对（按编号与版本核对三份文件是否同步，仅提示差异，不作出定性结论） |  |
| **[dsh-spc-gbt-adapter](https://github.com/PerryLink/dsh-spc-gbt-adapter)** | 控制图常数与过程能力指数核对（按 GB/T 4091 的常规控制图常数表核对控制限与 Cp/Cpk 的自洽性，仅提示差异，不作出定性结论） |  |
| **[dsh-talk](https://github.com/PerryLink/dsh-talk)** | Voice-first session loop for DeepSeek Harness: talk to it, hear it answer. |  |
| **[dsh-team-rooms](https://github.com/PerryLink/dsh-team-rooms)** | Cross-session team rooms: shared message bus, task board and timeline | 🚫 सेवानिवृत्त — रिपॉज़िटरी README देखें |
| **[dsh-tender-extract](https://github.com/PerryLink/dsh-tender-extract)** | 招标文件条款摘录核对（按出处与原文逐字核对摘录完整性，仅提示差异，不作出定性结论） |  |
| **[dsh-tender-matrix](https://github.com/PerryLink/dsh-tender-matrix)** | 评标因素评分矩阵核对（按分值上限与合计核对矩阵自洽，仅提示差异，不作出定性结论） |  |
| **[dsh-test-drive](https://github.com/PerryLink/dsh-test-drive)** | Isolated install-and-smoke test drives for DeepSeek Harness plugins. |  |
| **[dsh-ticktick](https://github.com/PerryLink/dsh-ticktick)** | TickTick/Dida365 task bridge: session-header panel + 11 tools |  |
| **[dsh-translate](https://github.com/PerryLink/dsh-translate)** | Vendor parameter translation and deterministic JSON repair for DeepSeek Harness. |  |
| **[dsh-warranty-calc](https://github.com/PerryLink/dsh-warranty-calc)** | 质保期与索赔金额核对（按质保期月数与里程、索赔金额算式核对自洽，仅提示差异，不作出定性结论） |  |

</details>

</details>

</details>## License

[Apache License 2.0](LICENSE) © 2026 dsh-composer-history contributors

### DSH Desktop मार्केट से इंस्टॉल करें

सभी PerryLink प्लगइन DSH Desktop के बिल्ट-इन मार्केट में देखे जा सकते हैं: **Market → Sources → add source → पेस्ट करें** `https://perrylink-dsh-catalog.perrylink.workers.dev/catalog-source.json` **→ चुनें**। इंस्टॉलेशन मार्केट के npm-identity सत्यापन और आपकी पुष्टि से ही होता है।
