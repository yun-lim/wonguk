# 네이티브 앱으로 감싸기

모바일 브라우저용 PWA입니다. Expo Go가 필요 없습니다.
Safari / Chrome: https://yun-lim.github.io/wonguk/

display standalone, start_url ./ (상대 경로), theme-color,
apple-mobile-web-app-capable. Pages 베이스는 /wonguk/ 입니다.

## Capacitor
Pages URL을 server.url 로 두면 됩니다.
https://yun-lim.github.io/wonguk/
또는 dist 를 webDir 으로 두고 BASE_PATH=/wonguk/ 로 맞춥니다.

## TWA
manifest: https://yun-lim.github.io/wonguk/manifest.json
assetlinks 파일은 아직 없습니다.

API 키, AdSense, 실결제 키를 소스에 넣지 마세요.
