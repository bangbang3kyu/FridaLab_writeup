# FridaLab Write-up

<p align="center">
  <img src="https://img.shields.io/badge/FridaLab-Write--up-7bd88f?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Android-Hooking-34a853?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JADX-Static%20Analysis-ffb347?style=for-the-badge" />
  <a href="https://ajar-turquoise-862.notion.site/FridaLab-3ba4bfd02eb580db8d58e6603f61bef9">
    <img src="https://img.shields.io/badge/Notion-Writeup-000000?style=for-the-badge&logo=notion&logoColor=white" />
  </a>
</p>

```text
┌──────────────────────────────────────────────────────────────┐
│  MOBILE HACKING LAB NOTE                                     │
│  Frida + JADX + Android Emulator                             │
│  challenge 01  →  challenge 08                              │
└──────────────────────────────────────────────────────────────┘
```

> FridaLab을 처음부터 세팅하고, Challenge 1부터 Challenge 8까지 풀면서 정리한 모바일 해킹 입문 기록입니다.
>
> 이 문서는 단순한 정답 모음이 아니라,  
> `Frida`가 어떤 방식으로 동작하는지,  
> `Android Java 레이어`를 어떻게 바라보는지,  
> 그리고 각 챌린지에서 어떤 개념을 익혔는지까지 함께 정리하는 것을 목표로 합니다.

---

## Overview

FridaLab은 Android 앱의 Java 레이어를 Frida로 후킹하면서
기본적인 동적 분석 흐름을 익히기 좋은 연습용 환경입니다.

### Mission Brief

| Field | Value |
| --- | --- |
| Target | `uk.rossmarks.fridalab` |
| Goal | Java 레이어 후킹 감각 익히기 |
| Style | Dynamic Analysis / Runtime Instrumentation |
| Notes | `JADX`로 구조를 보고, `Frida`로 실행 중 동작을 바꿈 |

이번 학습에서는 아래 순서로 진행했습니다.

1. Android Emulator 준비
2. `adb` 연결 확인
3. `frida-server` 실행
4. `frida-tools` 설치
5. `JADX`로 앱 구조 확인
6. Challenge 1부터 8까지 풀이

---

## Environment

> [!IMPORTANT]
> 초반에는 WSL과 Windows를 섞어 쓰지 않고, **Windows PowerShell 기준으로 통일**하는 것이 훨씬 덜 헷갈렸습니다.
> 에뮬레이터, `adb`, `frida-server`, `frida-tools`를 한 환경으로 맞추는 것이 핵심입니다.

| Item | Description |
| --- | --- |
| OS | Windows |
| Shell | Windows PowerShell |
| Emulator | Android Emulator |
| Target Architecture | `x86_64` |
| Frida Server | `frida-server-17.16.4-android-x86_64` |
| Frida Tools | `frida-tools` |
| Static Analysis | `JADX` |
| Target App | `uk.rossmarks.fridalab` |

### Tooling

- `adb`
- `frida`
- `frida-server`
- `JADX`
- Android Emulator

### Why I used Windows PowerShell instead of mixing environments

- 에뮬레이터 실행: Windows
- `adb` 실행: Windows PowerShell
- `frida-tools` 실행: Windows PowerShell
- `frida-server`: Android Emulator 내부 실행

이렇게 통일하면 연결 문제를 빠르게 확인할 수 있습니다.

> [!TIP]
> FridaLab 입문자는 “도구 설치가 끝났는가”보다 “내가 어떤 환경에서 무엇을 실행하는가”를 먼저 정리하는 편이 훨씬 안정적입니다.

---

## Setup

```text
┌──────────────────────────────────────────────────────────────┐
│  SETUP FLOW                                                  │
│  1) adb devices                                             │
│  2) frida-server start                                      │
│  3) frida-ps -U                                             │
│  4) FridaLab.apk install                                    │
└──────────────────────────────────────────────────────────────┘
```

### 1. ADB 연결 확인

```powershell
adb devices
```

에뮬레이터가 정상적으로 보이면 기본 연결은 끝난 것입니다.

> [!NOTE]
> `adb devices`에서 에뮬레이터가 먼저 보여야 이후 Frida 세팅이 자연스럽게 이어집니다.

### 2. `frida-server` 배치

```powershell
adb root
adb push "C:\path\to\frida-server-17.16.4-android-x86_64" /data/local/tmp/frida-server
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server &"
```

### 3. Frida Tools 설치

```powershell
py -m pip install frida-tools
```

### 4. 연결 테스트

```powershell
frida-ps -U
```

`frida-ps -U`에서 앱 목록이 보이면 Frida가 정상적으로 디바이스를 인식한 것입니다.

> [!TIP]
> `frida-ps -U`가 보인다는 것은 단순히 명령이 실행된 것이 아니라, Frida가 실제 디바이스/에뮬레이터와 통신하고 있다는 신호입니다.

### 5. FridaLab APK 설치

```powershell
adb install "C:\Users\EZ\Downloads\FridaLab.apk"
```

---

## Core Concepts

```text
┌──────────────────────────────────────────────────────────────┐
│  CORE HOOKING PRIMITIVES                                     │
│  Java.perform  |  Java.use  |  Java.choose  |  Java.cast    │
└──────────────────────────────────────────────────────────────┘
```

FridaLab을 풀면서 가장 많이 반복해서 쓴 개념들을 정리했습니다.

### `Java.perform`

Java 런타임이 준비된 뒤에 코드를 실행할 때 사용합니다.

```javascript
Java.perform(function () {
  console.log("Java is ready");
});
```

### `Java.use`

앱 내부의 Java 클래스를 Frida가 다룰 수 있는 형태로 가져옵니다.

```javascript
var MainActivity = Java.use("uk.rossmarks.fridalab.MainActivity");
```

### `Java.choose`

이미 메모리에 올라와 있는 객체 인스턴스를 찾을 때 사용합니다.

```javascript
Java.choose("uk.rossmarks.fridalab.MainActivity", {
  onMatch: function (instance) {
    console.log(instance);
  },
  onComplete: function () {}
});
```

### `Java.cast`

가져온 객체를 특정 타입으로 바꿔서, 그 클래스 전용 메서드를 쓰고 싶을 때 사용합니다.

```javascript
var Button = Java.use("android.widget.Button");
var btn = Java.cast(instance.findViewById(2131165231), Button);
```

### `implementation`

메서드 동작을 새로 정의하는 후킹 방식입니다.

```javascript
main.chall03.overload().implementation = function () {
  return true;
};
```

### `overload`

같은 이름의 메서드가 여러 개 있을 때, 정확한 시그니처를 지정합니다.

```javascript
main.chall05.overload("java.lang.String").implementation = function (s) {
  return;
};
```

### `String.$new`

Java 문자열 객체를 만들 때 사용합니다.

```javascript
var String = Java.use("java.lang.String");
var text = String.$new("Confirm");
```

### `findViewById`

화면에 있는 UI 요소를 ID로 찾을 때 사용합니다.

```javascript
var view = instance.findViewById(2131165231);
```

---

## Challenge Notes

> [!WARNING]
> 아래 표는 “정답만” 보는 용도가 아니라, 각 챌린지에서 어떤 Frida 패턴을 배웠는지 요약한 것입니다.

각 챌린지는 Frida의 대표적인 사용 패턴을 익히는 데 초점이 있었습니다.

| Challenge | Main Idea | Key Concept |
| --- | --- | --- |
| C1 | 정적 변수 값 변경 | `Java.use`, static field |
| C2 | 실행 중인 인스턴스에서 메서드 호출 | `Java.choose` |
| C3 | 반환값 후킹 | `implementation` |
| C4 | 인자를 넣어서 직접 호출 | `Java.choose`, method call |
| C5 | 기존 호출을 가로채서 인자 변경 | `overload`, argument spoofing |
| C6 | 시간 조건과 호출 타이밍 이해 | delayed execution, hook timing |
| C7 | PIN 값 확인 또는 brute force | static value, checker function |
| C8 | UI 텍스트 변경 | `findViewById`, `Java.cast`, `setText` |

---

## Write-up Summary

```text
┌──────────────────────────────────────────────────────────────┐
│  WRITE-UP LOG                                                │
│  C1  static field                                           │
│  C2  instance method                                        │
│  C3  return hook                                             │
│  C4  direct call                                             │
│  C5  argument spoofing                                       │
│  C6  timing / delayed call                                  │
│  C7  pin verification                                       │
│  C8  UI manipulation                                         │
└──────────────────────────────────────────────────────────────┘
```

### C1

정적 변수 `chall01`의 값을 직접 `1`로 바꿔 해결했습니다.

배운 점:

- static field는 `Java.use()`로 바로 접근 가능
- 값만 맞추면 되는 가장 기본적인 후킹 형태

### C2

실행 중인 `MainActivity` 인스턴스를 찾아 `chall02()`를 직접 호출했습니다.

배운 점:

- 인스턴스 메서드는 실제 객체를 찾아야 호출 가능
- `Java.choose()`가 매우 유용함

### C3

`chall03()`의 반환값을 `true`로 바꿔 정답 조건을 만족시켰습니다.

배운 점:

- 메서드의 실행 흐름을 바꾸는 대표적인 방식
- `implementation`으로 리턴값을 쉽게 제어 가능

### C4

`chall04("frida")`처럼 정확한 문자열 인자를 넣어서 호출했습니다.

배운 점:

- 정답 값이 고정되어 있으면 단순 호출로 해결 가능
- 인자를 직접 넘기는 방식의 이해

### C5

인자를 받는 메서드를 후킹해서, 실제로는 `"frida"`가 들어가도록 바꿨습니다.

배운 점:

- 이미 호출되는 함수를 가로채는 개념
- 단순 호출과 후킹의 차이를 체감한 문제

### C6

시간 조건 때문에 바로 끝내지 않고, 적절한 타이밍을 맞춰 호출하는 흐름을 익혔습니다.

배운 점:

- 후킹 자체보다도 “언제 호출하느냐”가 중요할 수 있음
- 타이밍 기반 문제는 조금 더 꼼꼼한 관찰이 필요함

### C7

랜덤 PIN 검증을 통과하기 위해, PIN 값을 읽거나 brute force로 맞추는 방식을 사용했습니다.

배운 점:

- checker function의 역할을 이해하게 됨
- 검증 함수가 있으면 값을 읽거나 탐색하는 방식으로 우회 가능

### C8

버튼을 찾아 텍스트를 `"Confirm"`으로 바꿔 문제를 해결했습니다.

배운 점:

- UI도 결국 Java 객체로 다룰 수 있음
- `findViewById`와 `Java.cast`의 조합이 중요함

---

## What I Learned

```text
┌──────────────────────────────────────────────────────────────┐
│  TAKEAWAYS                                                   │
│  - Frida is live instrumentation                             │
│  - Java objects can be observed and modified at runtime      │
│  - JADX + Frida is a very strong beginner workflow           │
└──────────────────────────────────────────────────────────────┘
```

- Frida는 단순히 함수를 바꾸는 도구가 아니라, Android 앱의 Java 레이어를 살아 있는 상태로 관찰하고 조작하는 도구다.
- `Java.use`, `Java.choose`, `Java.cast`의 역할을 이해하면 대부분의 기본 문제를 풀 수 있다.
- WSL과 Windows를 섞어 쓰기보다, 에뮬레이터와 `adb`, `frida-server`, `frida-tools`를 한 환경으로 통일하는 것이 훨씬 안정적이다.
- JADX는 Frida와 함께 써야 분석 속도가 빨라진다.
- UI도 결국 Java 객체이기 때문에, 버튼 텍스트 변경처럼 직접 제어할 수 있다.

---

## Repository Structure

```text
FridaLab_writeup/
  C1/
    c1.js
  C2/
    c2.js
  C3/
    c3.js
  C4/
    c4.js
  C5/
    c5.js
  C6/
    c6.js
  C7/
    c7.js
  C8/
    c8.js
  outputs/
  README.md
```

---

## References

- Frida official documentation
- Android Emulator / ADB documentation
- JADX GitHub repository
- FridaLab tutorial blog posts and personal notes

---

## Closing

FridaLab을 통해 가장 크게 배운 점은,  
모바일 해킹은 “어렵게 만드는 기술”보다 “무엇이 실제로 실행되는지 정확히 보는 습관”이 중요하다는 점이었습니다.

처음에는 환경 세팅만으로도 낯설었지만,  
하나씩 후킹하고 결과를 확인해보면서  
`정적 분석`, `동적 분석`, `UI 제어`, `함수 후킹`의 흐름이 조금씩 연결되었습니다.

이 README는 그 과정을 처음 시작하는 사람도 따라오기 쉽게 정리한 기록입니다.

---

<p align="center">
  <b>End of Lab Notes</b><br/>
  <sub>Keep the hooks small, the logs readable, and the workflow consistent.</sub>
</p>
