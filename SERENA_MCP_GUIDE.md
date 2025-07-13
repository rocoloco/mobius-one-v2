# Serena MCP Installation Guide

## 🚀 Installation Complete!

Serena MCP has been configured in your `.mcp.json` file and is ready to use.

## 📋 What is Serena?

Serena is a powerful coding agent toolkit that provides:
- **Semantic code retrieval** - Search code by meaning, not just text
- **Advanced code editing** - Intelligent code modifications
- **Multi-language support** - Python, TypeScript, JavaScript, Go, Rust, PHP, and more
- **Language server integration** - Full semantic understanding of your code

## 🔧 Configuration

Serena has been added to your `.mcp.json` with these settings:
- **Context**: `ide-assistant` (optimized for IDE integration)
- **Project**: `/Users/rosarios/Mobius-One_v2` (your current project)
- **Command**: Uses `uvx` to run Serena without global installation

## 🎯 How to Use Serena

**IMPORTANT**: After restarting Claude Code with Serena enabled, you need to run this command at the start of each conversation:

```
/mcp__serena__initial_instructions
```

This loads Serena's tool instructions and capabilities.

## 🛠️ Available Serena Tools

Once activated, Serena provides tools like:
- Semantic code search across your project
- Intelligent code editing and refactoring
- File navigation and analysis
- Shell command execution
- And more...

## 📝 Next Steps

1. **Restart Claude Code** to load the new MCP configuration
2. **Run `/mcp__serena__initial_instructions`** in your next conversation
3. **Use Serena's semantic search** to find code by concept, not just keywords

## 🔍 Example Usage

After activation, you can ask things like:
- "Find all authentication-related code"
- "Show me where user sessions are managed"
- "Find the OAuth implementation"
- "Search for database connection handling"

Serena will use semantic understanding to find relevant code, even if it doesn't contain exact keywords.

## ⚠️ Troubleshooting

If Serena doesn't work after restart:
1. Check that `uvx` is installed: `/Users/rosarios/.local/bin/uvx --version`
2. Test Serena directly: `/Users/rosarios/.local/bin/uvx --from git+https://github.com/oraios/serena serena-mcp-server --help`
3. Check Claude Code logs for any MCP errors

## 🔧 Alternative Installation (if needed)

If the uvx approach doesn't work, you can install Serena globally:

```bash
# Clone and install
git clone https://github.com/oraios/serena.git
cd serena
/Users/rosarios/.local/bin/uv pip install --all-extras -r pyproject.toml -e .

# Find installation path
which serena-mcp-server
```

Then update `.mcp.json` with the direct path to `serena-mcp-server`.

---

**Note**: Serena is particularly powerful for large codebases where you need to find code by concept rather than exact text matches. It understands the semantic meaning of your code!