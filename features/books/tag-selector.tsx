"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Tag, Check, Plus } from "lucide-react";

interface TagSelectorProps {
	availableTags: string[];
	selectedTag: string;
	onSelectTag: (tag: string) => void;
	onCreateTag: (tag: string) => void;
}

export default function TagSelector({
	availableTags,
	selectedTag,
	onSelectTag,
	onCreateTag,
}: TagSelectorProps) {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	const handleSelect = (tag: string) => {
		onSelectTag(tag);
		setOpen(false);
	};

	const handleCreateTag = () => {
		if (inputValue.trim()) {
			onCreateTag(inputValue.trim());
			setInputValue("");
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2">
					<Tag className="h-4 w-4" />
					{selectedTag || "タグを選択"}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="p-0" align="start">
				<Command>
					<CommandInput
						placeholder="タグを検索または作成..."
						value={inputValue}
						onValueChange={setInputValue}
					/>
					<CommandList>
						<CommandEmpty>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-2 w-full justify-start"
								onClick={handleCreateTag}
							>
								<Plus className="h-4 w-4" />
								<span>「{inputValue}」を作成</span>
							</Button>
						</CommandEmpty>
						<CommandGroup>
							{availableTags.map((tag) => (
								<CommandItem
									key={tag}
									value={tag}
									onSelect={() => handleSelect(tag)}
								>
									<Tag className="mr-2 h-4 w-4" />
									{tag}
									{selectedTag === tag && <Check className="ml-auto h-4 w-4" />}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
