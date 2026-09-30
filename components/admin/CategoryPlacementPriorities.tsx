import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";

type CategoryOption = { id: number; name: string };

export default function CategoryPlacementPriorities({
  categories,
  primaryCategoryId,
  extraCategoryIds,
  priorities,
  onChangePriority,
}: {
  categories: CategoryOption[];
  primaryCategoryId: number | null;
  extraCategoryIds: string[];
  priorities: Record<string, string>;
  onChangePriority: (categoryId: string, value: string) => void;
}) {
  const rows: { id: string; name: string; kind: "main" | "extra" }[] = [];

  if (primaryCategoryId) {
    const cat = categories.find((c) => c.id === primaryCategoryId);
    if (cat) {
      rows.push({
        id: String(primaryCategoryId),
        name: cat.name,
        kind: "main",
      });
    }
  }

  for (const id of extraCategoryIds) {
    const cat = categories.find((c) => String(c.id) === id);
    if (cat) {
      rows.push({ id, name: cat.name, kind: "extra" });
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 dark:border-white/10 p-4">
      <Label className="mb-0">Пріоритет у категоріях</Label>
      <p className="text-xs text-gray-500">
        Порядок у каталозі кожної категорії окремий (основна, Sale тощо). Більше
        число — вище в списку.
      </p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex flex-wrap items-center gap-2 sm:gap-3"
          >
            <span className="text-sm flex-1 min-w-[140px]">
              {row.name}
              <span className="text-gray-500">
                {row.kind === "main" ? " · основна" : " · додаткова"}
              </span>
            </span>
            <Input
              type="number"
              min="0"
              className="w-28"
              value={priorities[row.id] ?? "0"}
              onChange={(e) => onChangePriority(row.id, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
