#!/bin/bash

echo "🚀 Installing Serena MCP Server"
echo "=============================="

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source $HOME/.cargo/env
fi

# Clone Serena repository
echo "📥 Cloning Serena repository..."
cd /tmp
rm -rf serena
git clone https://github.com/oraios/serena.git
cd serena

# Install Serena
echo "🔧 Installing Serena..."
uv pip install --all-extras -r pyproject.toml -e .

# Find the installation path
SERENA_PATH=$(which serena-mcp-server)
if [ -z "$SERENA_PATH" ]; then
    # Try to find it in uv's installation
    SERENA_PATH="$HOME/.local/bin/serena-mcp-server"
fi

if [ ! -f "$SERENA_PATH" ]; then
    # Try uvx approach
    echo "🔄 Trying uvx installation..."
    uvx --from git+https://github.com/oraios/serena serena-mcp-server --version
    SERENA_PATH="uvx --from git+https://github.com/oraios/serena serena-mcp-server"
fi

echo "✅ Serena installed at: $SERENA_PATH"
echo ""
echo "📝 To configure in .mcp.json, use:"
echo "   Command: $SERENA_PATH"
echo ""
echo "🎯 Installation complete!"