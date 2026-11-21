#!/bin/bash
# Quick script to find and list all components with old gradient/glow styles

echo "=== Components with old styles ==="
cd /workspace/src

# Find files with gradients, glows, shadows
grep -r "linear-gradient\|text-shadow: 0 0\|box-shadow.*0 0.*rgba(0, 217\|backdrop-filter: blur\|rgba(25, 32, 56" \
  components/ \
  --include="*.vue" \
  -l | sort | uniq

echo ""
echo "=== Count by file ==="
grep -r "linear-gradient\|text-shadow: 0 0\|box-shadow.*0 0.*rgba(0, 217" \
  components/ \
  --include="*.vue" \
  -c | grep -v ":0$"
