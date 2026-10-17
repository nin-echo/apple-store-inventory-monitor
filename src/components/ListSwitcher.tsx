import { useState } from "react";
import { ListPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { switchList } from "@/lib/store";
import type { Settings } from "@/lib/types";

/** 切换、新建、删除监控列表。只有当前列表会被监控。 */
export function ListSwitcher({ settings }: { settings: Settings }) {
  const { activeList, targets, savedLists } = settings;
  const counts: Record<string, number> = { [activeList]: targets.length };
  for (const [name, list] of Object.entries(savedLists)) counts[name] = list.length;
  const others = Object.keys(savedLists).sort((a, b) => a.localeCompare(b));
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const trimmed = name.trim();
  const nameTaken = trimmed in counts;

  return (
    <div className="flex items-center gap-1.5">
      <Select value={activeList} onValueChange={(next) => void switchList(next)}>
        <SelectTrigger className="h-8 w-44 rounded-lg bg-background/40 text-xs" aria-label="当前监控列表">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[activeList, ...others].map((list) => (
            <SelectItem key={list} value={list}>
              {list}（{counts[list]}）
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Popover onOpenChange={() => setConfirming(false)}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="rounded-lg" aria-label="管理监控列表">
            <ListPlus aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="grid w-64 gap-2">
          <p className="text-xs text-muted-foreground">只有当前列表会被监控，切换后下一轮生效。</p>
          <Input
            className="control-surface select-text"
            placeholder="新列表名称"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="新列表名称"
          />
          {nameTaken ? <p className="text-[11px] text-destructive">已有同名列表</p> : null}
          <Button
            size="sm"
            disabled={!trimmed || nameTaken}
            onClick={() => void switchList(trimmed).then((ok) => ok && setName(""))}
          >
            新建并切换
          </Button>
          <Button
            size="sm"
            variant={confirming ? "destructive" : "outline"}
            disabled={others.length === 0}
            onClick={() => {
              if (!confirming) return setConfirming(true);
              setConfirming(false);
              void switchList(others[0]!, true);
            }}
          >
            <Trash2 aria-hidden="true" />
            {confirming ? `确认删除「${activeList}」` : "删除当前列表"}
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
