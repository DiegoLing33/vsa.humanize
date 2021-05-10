## 1. A token

Go to
```
https://oauth.vk.com/authorize?client_id=6618713&display=page&redirect_uri=blank.html&scope=friends&response_type=token&v=5.130&state=123456
```

## 2. Copy FULL URL to the .env-demo `token_url=`
You should have something like this:
```
token_url=https://oauth.vk.com/blank.html#access_token=23523525234&expires_in=86400&user_id=44411142&state=123456
```

## 3. Rename .env-demo to .env

## 4. Run `node start`