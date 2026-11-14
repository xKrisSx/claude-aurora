# Aurora: a dark theme for Claude

A near-black theme for the Claude desktop and mobile apps. Behind the conversation there is an animated night sky:

- **Stars** that slowly twinkle, a faint Milky Way and the occasional shooting star
- **Northern lights** in curtains that sway and shimmer with vertical rays
- **Low mountain ridges** with drifting fog between them

The interface itself goes almost black, with a soft frosted glass over the sky so text stays easy to read, an aurora-green accent and Nord-style code highlighting.

## Seven auroras

The aurora doesn't have to be green. It comes in seven colour sets:

| Name | Colours |
| --- | --- |
| `classic` | green and violet |
| `fire` | red, orange and gold |
| `ice` | blue, cyan and white |
| `neon` | pink and cyan |
| `cosmic` | violet, magenta and peach |
| `toxic` | acid green and yellow |
| `blood` | red and pink |

- A random one is picked each time a session starts.
- Every 20 minutes it switches to a different one on its own.
- `/aurora` picks a new random one right away, and `/aurora fire` (or any name above) picks that one.

## In the terminal

Terminals can't draw the full backdrop, so when you run `claude` in a terminal (Windows Terminal, IntelliJ, VS Code, iTerm…) you get a small pixel-art version instead: a five-row band above the prompt with twinkling stars, the aurora in its current colours and a mountain ridge, gently moving. Collapse it with the band's `[-]` if you want the space back. It looks best in a terminal with 24-bit colour.

## Install

In a Claude Code session in a terminal:

```
/plugin install aurora --marketplace xKrisSx/claude-aurora
```

Answer `y` to add the marketplace, then press Enter to install for your user.

From a shell:

```
claude plugin install aurora --marketplace xKrisSx/claude-aurora
```

In the desktop app: click **+** next to the message box, then **Plugins**, **Add marketplace**, enter `xKrisSx/claude-aurora`, then **Add plugin**.

## IntelliJ theme

There is a matching theme for IntelliJ IDEA and the other JetBrains IDEs in [`intellij/`](intellij): a near-black UI with an aurora-green accent, aurora-tinted syntax and terminal colours, and a faint starry sky with the aurora and misty mountains behind the editor and tool windows.

1. Download [`intellij/aurora-intellij-theme.jar`](intellij/aurora-intellij-theme.jar).
2. In the IDE: **Settings → Plugins → ⚙ → Install Plugin from Disk…** and pick the jar.
3. Choose **Aurora** in **Settings → Appearance & Behavior → Appearance → Theme**.

To make the background image stronger or fainter, change its transparency under **Settings → Appearance & Behavior → Appearance → Background Image…**. Rebuild the jar from `intellij/src` with `jar cf aurora-intellij-theme.jar -C src .`.

## Notes

- The theme draws in the Claude desktop and mobile apps. The terminal and editor extensions don't show themes.
- It's made for dark mode.
- If your system asks apps to reduce motion, the sky stays still.

## License

MIT, see [LICENSE](LICENSE).
