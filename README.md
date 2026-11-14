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

## Notes

- The theme draws in the Claude desktop and mobile apps. The terminal and editor extensions don't show themes.
- It's made for dark mode.
- If your system asks apps to reduce motion, the sky stays still.

## License

MIT, see [LICENSE](LICENSE).
