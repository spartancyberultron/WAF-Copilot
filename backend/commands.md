### After Creating the dockerfile move into the backend directory and run these commands
1. ```docker build --tag waf-copilot-image . ```
2. ```docker run --publish 8000:8000 waf-copilot-image```

### Use this to stop the container
1. ```docker container stop <CONTAINER_ID>```

- Make sure you have docker desktop installed , Windows virtualization enabled and wsl updated.