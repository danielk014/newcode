#!/bin/bash

# Script to deploy enhanced Supabase functions
echo "🚀 Deploying enhanced Supabase functions..."

# Check if enhanced versions exist
if [ ! -f "supabase/functions/analyze-scripts/index-enhanced.ts" ]; then
    echo "❌ Enhanced analyze-scripts function not found"
    exit 1
fi

if [ ! -f "supabase/functions/generate-script/index-enhanced.ts" ]; then
    echo "❌ Enhanced generate-script function not found"
    exit 1
fi

# Backup original functions
echo "📦 Backing up original functions..."
cp supabase/functions/analyze-scripts/index.ts supabase/functions/analyze-scripts/index-original.ts
cp supabase/functions/generate-script/index.ts supabase/functions/generate-script/index-original.ts

# Replace with enhanced versions
echo "🔄 Replacing with enhanced versions..."
cp supabase/functions/analyze-scripts/index-enhanced.ts supabase/functions/analyze-scripts/index.ts
cp supabase/functions/generate-script/index-enhanced.ts supabase/functions/generate-script/index.ts

echo "✅ Functions updated locally"
echo ""
echo "To deploy to Supabase, run:"
echo "  supabase functions deploy analyze-scripts"
echo "  supabase functions deploy generate-script"
echo ""
echo "To revert to original versions, run:"
echo "  cp supabase/functions/analyze-scripts/index-original.ts supabase/functions/analyze-scripts/index.ts"
echo "  cp supabase/functions/generate-script/index-original.ts supabase/functions/generate-script/index.ts"