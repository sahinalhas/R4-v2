#!/bin/bash

# Atomic Design Import Path Update Script
# This script updates all import paths from old structure to new Atomic Design structure

echo "🔄 Starting import path updates..."

# Function to update imports in files
update_imports() {
    # ATOMS (19 components)
    find client -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
        -e 's|@/components/ui/button|@/components/atoms/Button|g' \
        -e 's|@/components/ui/input|@/components/atoms/Input|g' \
        -e 's|@/components/ui/textarea|@/components/atoms/Textarea|g' \
        -e 's|@/components/ui/label|@/components/atoms/Label|g' \
        -e 's|@/components/ui/checkbox|@/components/atoms/Checkbox|g' \
        -e 's|@/components/ui/radio-group|@/components/atoms/RadioGroup|g' \
        -e 's|@/components/ui/switch|@/components/atoms/Switch|g' \
        -e 's|@/components/ui/slider|@/components/atoms/Slider|g' \
        -e 's|@/components/ui/select|@/components/atoms/Select|g' \
        -e 's|@/components/ui/badge|@/components/atoms/Badge|g' \
        -e 's|@/components/ui/avatar|@/components/atoms/Avatar|g' \
        -e 's|@/components/ui/separator|@/components/atoms/Separator|g' \
        -e 's|@/components/ui/skeleton|@/components/atoms/Skeleton|g' \
        -e 's|@/components/ui/progress|@/components/atoms/Progress|g' \
        -e 's|@/components/ui/toggle|@/components/atoms/Toggle|g' \
        -e 's|@/components/ui/alert|@/components/atoms/Alert|g' \
        -e 's|@/components/ui/aspect-ratio|@/components/atoms/AspectRatio|g' \
        -e 's|@/components/ui/toast|@/components/atoms/Toast|g' \
        -e 's|@/components/ui/toaster|@/components/atoms/Toaster|g' \
        {} +
    
    echo "✅ Atoms updated"

    # MOLECULES (11 components)
    find client -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
        -e 's|@/components/ui/enhanced-textarea|@/components/molecules/EnhancedTextarea|g' \
        -e 's|@/components/ui/standard-field|@/components/molecules/StandardField|g' \
        -e 's|@/components/ui/tag-input|@/components/molecules/TagInput|g' \
        -e 's|@/components/ui/multi-select|@/components/molecules/MultiSelect|g' \
        -e 's|@/components/ui/stat-card|@/components/molecules/StatCard|g' \
        -e 's|@/components/ui/stats-grid|@/components/molecules/StatsGrid|g' \
        -e 's|@/components/ui/modern-card|@/components/molecules/ModernCard|g' \
        -e 's|@/components/ui/voice-input-button|@/components/molecules/VoiceInputButton|g' \
        -e 's|@/components/ui/voice-input-status|@/components/molecules/VoiceInputStatus|g' \
        -e 's|@/components/ui/page-header|@/components/molecules/PageHeader|g' \
        -e 's|@/components/ui/breadcrumb|@/components/molecules/Breadcrumb|g' \
        {} +
    
    echo "✅ Molecules updated"

    # ORGANISMS (24 components)
    find client -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
        -e 's|@/components/ui/dialog|@/components/organisms/Dialog|g' \
        -e 's|@/components/ui/alert-dialog|@/components/organisms/AlertDialog|g' \
        -e 's|@/components/ui/drawer|@/components/organisms/Drawer|g' \
        -e 's|@/components/ui/sheet|@/components/organisms/Sheet|g' \
        -e 's|@/components/ui/popover|@/components/organisms/Popover|g' \
        -e 's|@/components/ui/hover-card|@/components/organisms/HoverCard|g' \
        -e 's|@/components/ui/tooltip|@/components/organisms/Tooltip|g' \
        -e 's|@/components/ui/context-menu|@/components/organisms/ContextMenu|g' \
        -e 's|@/components/ui/dropdown-menu|@/components/organisms/DropdownMenu|g' \
        -e 's|@/components/ui/navigation-menu|@/components/organisms/NavigationMenu|g' \
        -e 's|@/components/ui/menubar|@/components/organisms/Menubar|g' \
        -e 's|@/components/ui/sidebar|@/components/organisms/Sidebar|g' \
        -e 's|@/components/ui/scroll-area|@/components/organisms/ScrollArea|g' \
        -e 's|@/components/ui/pagination|@/components/organisms/Pagination|g' \
        -e 's|@/components/ui/tabs|@/components/organisms/Tabs|g' \
        -e 's|@/components/ui/accordion|@/components/organisms/Accordion|g' \
        -e 's|@/components/ui/collapsible|@/components/organisms/Collapsible|g' \
        -e 's|@/components/ui/toggle-group|@/components/organisms/ToggleGroup|g' \
        -e 's|@/components/ui/table|@/components/organisms/Table|g' \
        -e 's|@/components/ui/chart|@/components/organisms/Chart|g' \
        -e 's|@/components/ui/calendar|@/components/organisms/Calendar|g' \
        -e 's|@/components/ui/form|@/components/organisms/Form|g' \
        -e 's|@/components/ui/command|@/components/organisms/Command|g' \
        -e 's|@/components/ui/card|@/components/organisms/Card|g' \
        {} +
    
    echo "✅ Organisms updated"

    # FEATURES (move to features/)
    find client -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
        -e 's|@/components/students/|@/components/features/students/|g' \
        -e 's|@/components/counseling/|@/components/features/counseling/|g' \
        -e 's|@/components/surveys/|@/components/features/surveys/|g' \
        -e 's|@/components/exam-management/|@/components/features/exam-management/|g' \
        -e 's|@/components/ai/|@/components/features/ai/|g' \
        -e 's|@/components/ai-suggestions/|@/components/features/ai-suggestions/|g' \
        -e 's|@/components/ai-tools/|@/components/features/ai-tools/|g' \
        -e 's|@/components/analytics/|@/components/features/analytics/|g' \
        -e 's|@/components/charts/|@/components/features/charts/|g' \
        -e 's|@/components/dashboard/|@/components/features/dashboard/|g' \
        -e 's|@/components/learning/|@/components/features/learning/|g' \
        -e 's|@/components/live-profile/|@/components/features/live-profile/|g' \
        -e 's|@/components/profile-sync/|@/components/features/profile-sync/|g' \
        -e 's|@/components/settings/|@/components/features/settings/|g' \
        -e 's|@/components/shared/|@/components/features/shared/|g' \
        -e 's|@/components/social/|@/components/features/social/|g' \
        -e 's|@/components/student-profile/|@/components/features/student-profile/|g' \
        {} +
    
    echo "✅ Features updated"

    # Common components
    find client -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i \
        -e 's|@/components/AIStatusIndicator|@/components/features/common/AIStatusIndicator|g' \
        -e 's|@/components/ErrorBoundary|@/components/features/common/ErrorBoundary|g' \
        -e 's|@/components/RiskSummaryWidget|@/components/features/common/RiskSummaryWidget|g' \
        {} +
    
    echo "✅ Common components updated"
}

# Run the updates
update_imports

echo "✨ All import paths updated successfully!"
echo "📊 Summary:"
echo "   - Atoms: 19 components"
echo "   - Molecules: 11 components"
echo "   - Organisms: 24 components"
echo "   - Features: 18 feature folders"
