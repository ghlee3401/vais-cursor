# GitHub 레포 생성 후 푸시

`vais-cursor` 레포가 아직 없다면 아래 순서로 진행하세요.

## 1. GitHub에서 레포 생성

1. https://github.com/new 접속
2. **Repository name**: `vais-cursor`
3. **Public** 선택
4. **Create repository** 클릭 (README 등 추가 옵션 없이 생성)

## 2. 푸시

vais-cursor 폴더에서:

```bash
git branch -M main
git push -u origin main
```

이미 `origin`이 `https://github.com/ghlee3401/vais-cursor.git`로 설정되어 있습니다.  
다른 계정/조직이면 `git remote set-url origin https://github.com/YOUR_USER/vais-cursor.git` 후 푸시하세요.
