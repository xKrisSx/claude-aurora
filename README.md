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

Terminals can't draw the full backdrop, so when you run `claude` in a terminal (Windows Terminal, IntelliJ, VS Code, iTerm…) you get a small pixel-art version instead: a five-row band above the prompt with stars and a mountain ridge.

The aurora only comes out while Claude is working. When a turn starts it fades in and sways, and when Claude is done it fades away and leaves a still night sky. While nothing moves, the band costs nothing to draw.

- `/aurora band on`: the default described above
- `/aurora band still`: a still sky with the aurora always up, never animated
- `/aurora band off`: no band at all

The choice is remembered across sessions. Collapse the band with its `[-]` to hide it for the moment. It looks best in a terminal with 24-bit colour.

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

Want the same aurora in your IDE? See [intellij-aurora](https://github.com/xKrisSx/intellij-aurora), a matching theme for IntelliJ IDEA and the other JetBrains IDEs.

## Notes

- The theme draws in the Claude desktop and mobile apps. The terminal and editor extensions don't show themes.
- It's made for dark mode.
- If your system asks apps to reduce motion, the sky stays still.

## License

MIT, see [LICENSE](LICENSE).
