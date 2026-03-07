# Claude Code Rules

## Node Version
Always prefix npm/node/vite commands with the nvm Node 24 PATH:

```sh
export PATH="/home/grayson/.local/share/nvm/v24.12.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
```

Example:
```sh
export PATH="/home/grayson/.local/share/nvm/v24.12.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH" && npm run build
```

The system Node is v18 (too old for Vite 7 + Tailwind v4). The nvm LTS is v24 at `~/.local/share/nvm/v24.12.0/bin/`.
