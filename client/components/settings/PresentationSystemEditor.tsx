import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Hash,
} from "lucide-react";
import {
  PresentationCategory,
  PresentationItem,
  PresentationTab,
} from "@/lib/app-settings";

interface PresentationSystemEditorProps {
  tabs: PresentationTab[];
  onChange: (tabs: PresentationTab[]) => void;
  disabled?: boolean;
}

interface EditingState {
  categoryId: string;
  itemId: string;
  value: string;
}

export default function PresentationSystemEditor({
  tabs,
  onChange,
  disabled = false,
}: PresentationSystemEditorProps) {
  const [activeTab, setActiveTab] = useState<string>(
    tabs && tabs.length > 0 ? tabs[0].id : "",
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [editingItem, setEditingItem] = useState<EditingState | null>(null);
  const [newItemText, setNewItemText] = useState<string>("");
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const updateTabs = (updatedTabs: PresentationTab[]) => {
    onChange(updatedTabs);
  };

  const findCategory = (
    categoryId: string,
  ): PresentationCategory | null => {
    const searchInCategories = (
      categories: PresentationCategory[],
    ): PresentationCategory | null => {
      for (const category of categories) {
        if (category.id === categoryId) return category;
        const found = searchInCategories(category.children);
        if (found) return found;
      }
      return null;
    };

    for (const tab of tabs) {
      const found = searchInCategories(tab.categories);
      if (found) return found;
    }
    return null;
  };

  const addItem = (categoryId: string, title: string) => {
    if (!title.trim()) return;

    const targetCategory = findCategory(categoryId);
    if (!targetCategory) return;
    if (targetCategory.children.length > 0) return;

    const newItem: PresentationItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      editable: true,
    };

    const updateCategory = (
      category: PresentationCategory,
    ): PresentationCategory => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: [...category.items, newItem],
        };
      }
      return {
        ...category,
        children: category.children.map(updateCategory),
      };
    };

    const updateTab = (tab: PresentationTab): PresentationTab => {
      return {
        ...tab,
        categories: tab.categories.map(updateCategory),
      };
    };

    const updatedTabs = tabs.map(updateTab);
    updateTabs(updatedTabs);
    setNewItemText("");
    setAddingToCategory(null);
  };

  const editItem = (categoryId: string, itemId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    const updateCategory = (
      category: PresentationCategory,
    ): PresentationCategory => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map((item) =>
            item.id === itemId ? { ...item, title: newTitle.trim() } : item,
          ),
        };
      }
      return {
        ...category,
        children: category.children.map(updateCategory),
      };
    };

    const updateTab = (tab: PresentationTab): PresentationTab => {
      return {
        ...tab,
        categories: tab.categories.map(updateCategory),
      };
    };

    const updatedTabs = tabs.map(updateTab);
    updateTabs(updatedTabs);
    setEditingItem(null);
  };

  const removeItem = (categoryId: string, itemId: string) => {
    const updateCategory = (
      category: PresentationCategory,
    ): PresentationCategory => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.filter((item) => item.id !== itemId),
        };
      }
      return {
        ...category,
        children: category.children.map(updateCategory),
      };
    };

    const updateTab = (tab: PresentationTab): PresentationTab => {
      return {
        ...tab,
        categories: tab.categories.map(updateCategory),
      };
    };

    const updatedTabs = tabs.map(updateTab);
    updateTabs(updatedTabs);
  };

  const renderCategory = (
    category: PresentationCategory,
    depth: number = 0,
  ): JSX.Element => {
    const isExpanded = expandedCategories.has(category.id);
    const hasContent =
      category.items.length > 0 || category.children.length > 0;
    const canAddItems = category.children.length === 0;

    const getIndentStyle = (depth: number) => {
      return { paddingLeft: `${depth * 20 + 8}px` };
    };

    const getFolderIcon = () => {
      if (hasContent) {
        return isExpanded ? (
          <FolderOpen className="h-4 w-4 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500" />
        );
      }
      return <Hash className="h-4 w-4 text-gray-400" />;
    };

    return (
      <div key={category.id} className="mb-1">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleCategory(category.id)}
        >
          <CollapsibleTrigger asChild>
            <div
              className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              style={getIndentStyle(depth)}
            >
              <div className="flex items-center gap-2 flex-1">
                {hasContent && (
                  <div className="flex items-center">
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                  </div>
                )}
                {getFolderIcon()}
                <span className="text-sm font-medium text-gray-800">
                  {category.title}
                </span>
                {category.items.length > 0 && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {category.items.length} öğe
                  </span>
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-1">
            {/* Items */}
            {category.items.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-2 py-1 px-2 hover:bg-blue-50 rounded transition-colors"
                style={getIndentStyle(depth + 1)}
              >
                <FileText className="h-3 w-3 text-green-600 flex-shrink-0" />
                {editingItem?.itemId === item.id &&
                editingItem?.categoryId === category.id ? (
                  <>
                    <Input
                      value={editingItem.value}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          value: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          editItem(category.id, item.id, editingItem.value);
                        } else if (e.key === "Escape") {
                          setEditingItem(null);
                        }
                      }}
                      className="flex-1 text-sm h-7"
                      autoFocus
                      disabled={disabled}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        editItem(category.id, item.id, editingItem.value)
                      }
                      disabled={disabled}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setEditingItem(null)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700 hover:text-gray-900">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                        onClick={() =>
                          setEditingItem({
                            categoryId: category.id,
                            itemId: item.id,
                            value: item.title,
                          })
                        }
                        disabled={disabled}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
                            disabled={disabled}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Konuyu sil?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{item.title}" konusu silinecek. Bu işlem geri
                              alınamaz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeItem(category.id, item.id)}
                            >
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Add new item */}
            {canAddItems &&
              (addingToCategory === category.id ? (
                <div
                  className="flex items-center gap-2 py-1 px-2 border border-dashed border-blue-300 bg-blue-50 rounded transition-colors"
                  style={getIndentStyle(depth + 1)}
                >
                  <Plus className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  <Input
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Yeni konu başlığı..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addItem(category.id, newItemText);
                      } else if (e.key === "Escape") {
                        setAddingToCategory(null);
                        setNewItemText("");
                      }
                    }}
                    className="flex-1 text-sm h-7 border-0 bg-transparent focus:ring-0"
                    autoFocus
                    disabled={disabled}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-blue-200"
                    onClick={() => addItem(category.id, newItemText)}
                    disabled={disabled}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-blue-200"
                    onClick={() => {
                      setAddingToCategory(null);
                      setNewItemText("");
                    }}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 py-1 px-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                  style={getIndentStyle(depth + 1)}
                  onClick={() => setAddingToCategory(category.id)}
                >
                  <Plus className="h-3 w-3 flex-shrink-0" />
                  <span className="text-sm">Yeni konu ekle...</span>
                </div>
              ))}

            {/* Child categories */}
            <div className="space-y-1">
              {category.children.map((child) =>
                renderCategory(child, depth + 1),
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const getTotalItemCount = (tabs: PresentationTab[]): number => {
    if (!tabs || tabs.length === 0) return 0;

    const countCategoriesItems = (
      categories: PresentationCategory[],
    ): number => {
      if (!categories || categories.length === 0) return 0;
      return categories.reduce((total, category) => {
        const itemsCount = category.items ? category.items.length : 0;
        const childrenCount = category.children
          ? countCategoriesItems(category.children)
          : 0;
        return total + itemsCount + childrenCount;
      }, 0);
    };

    return tabs.reduce((total, tab) => {
      const categoriesCount = tab.categories
        ? countCategoriesItems(tab.categories)
        : 0;
      return total + categoriesCount;
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sunum Sistemi</span>
          <Badge variant="secondary">
            {getTotalItemCount(tabs)} toplam konu
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground mb-4">
          Kategoriler açılıp kapanabilir. Sadece konu başlıkları düzenlenebilir,
          kategoriler sabit kalmaktadır.
        </div>

        {!tabs || tabs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Henüz hiç sekme yok. Veri yüklenene kadar bekleyin.
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="space-y-1 mt-4"
              >
                {tab.categories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Bu sekmede henüz kategori yok.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {tab.categories.map((category) => renderCategory(category))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
